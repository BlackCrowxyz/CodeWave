import axios from 'axios';
import pool from "../config/db.js";

export const findBusRoute = async (req, res) => {
  try {
    const { startLat, startLon, endLat, endLon } = req.query;

    if (!startLat || !startLon || !endLat || !endLon) {
      return res.status(400).json({ message: 'Missing start or end coordinates' });
    }

    
    const startStopsQuery = `
      SELECT stop_id, stop_name, stop_lat, stop_lon,
             sqrt(power(stop_lat - $1, 2) + power(stop_lon - $2, 2)) as distance
      FROM gtfs.stops
      WHERE stop_lat BETWEEN $1 - 0.01 AND $1 + 0.01
        AND stop_lon BETWEEN $2 - 0.015 AND $2 + 0.015
      ORDER BY distance ASC
      LIMIT 5;
    `;

    // Find stops near end location (increased radius to ~3km for "Bus + Walk")
    const endStopsQuery = `
      SELECT stop_id, stop_name, stop_lat, stop_lon,
             sqrt(power(stop_lat - $1, 2) + power(stop_lon - $2, 2)) as distance
      FROM gtfs.stops
      WHERE stop_lat BETWEEN $1 - 0.03 AND $1 + 0.03
        AND stop_lon BETWEEN $2 - 0.04 AND $2 + 0.04
      ORDER BY distance ASC
      LIMIT 10;
    `;

    const startStopsRes = await pool.query(startStopsQuery, [startLat, startLon]);
    const endStopsRes = await pool.query(endStopsQuery, [endLat, endLon]);

    if (startStopsRes.rows.length === 0 || endStopsRes.rows.length === 0) {
      return res.status(404).json({ message: 'No stops found near start or end location' });
    }

    const startStopIds = startStopsRes.rows.map(r => r.stop_id);
    const endStopIds = endStopsRes.rows.map(r => r.stop_id);

    // Find routes that serve both a start stop and an end stop
    const routeQuery = `
      SELECT DISTINCT r.route_short_name, r.route_long_name, r.route_id,
             s1.stop_name as start_stop_name, s2.stop_name as end_stop_name,
             s1.stop_id as start_stop_id, s2.stop_id as end_stop_id,
             s2.stop_lat as end_stop_lat, s2.stop_lon as end_stop_lon
      FROM gtfs.routes r
      JOIN gtfs.trips t ON r.route_id = t.route_id
      JOIN gtfs.stop_times st1 ON t.trip_id = st1.trip_id
      JOIN gtfs.stop_times st2 ON t.trip_id = st2.trip_id
      JOIN gtfs.stops s1 ON st1.stop_id = s1.stop_id
      JOIN gtfs.stops s2 ON st2.stop_id = s2.stop_id
      WHERE st1.stop_id = ANY($1)
        AND st2.stop_id = ANY($2)
        AND st1.stop_sequence < st2.stop_sequence
      LIMIT 1;
    `;

    const routeRes = await pool.query(routeQuery, [startStopIds, endStopIds]);

    if (routeRes.rows.length > 0) {
      const route = routeRes.rows[0];

      
      const dLat = (endLat - route.end_stop_lat) * 111;
      const dLon = (endLon - route.end_stop_lon) * 111 * Math.cos(endLat * (Math.PI / 180));
      const distKm = Math.sqrt(dLat * dLat + dLon * dLon);

      // Walking speed ~5km/h -> 12 min/km
      const walkTime = Math.round(distKm * 12);

      res.status(200).json({
        ...route,
        walking_distance_to_dest: distKm.toFixed(2),
        walking_time_to_dest: walkTime
      });
    } else {
      res.status(404).json({ message: 'No direct bus route found' });
    }

  } catch (error) {
    console.error('Error finding bus route:', error);
    res.status(500).json({ message: 'Failed to find bus route', error: error.message });
  }
};


export const getRealtimeBusUpdates = async (req, res) => {
  try {
    const { TFI_GTFS_URL, NTA_API_KEY } = process.env;
    const { routeId, stopId } = req.query;

    if (!TFI_GTFS_URL || !NTA_API_KEY) {
      return res.status(500).json({ message: 'TFI API configuration missing' });
    }

    const response = await axios.get(TFI_GTFS_URL, {
      headers: {
        'x-api-key': NTA_API_KEY,
      },
    });

    const data = response.data;

    if (!data || !data.entity || data.entity.length === 0) {
      return res.status(200).json(data);
    }

    // Extract unique IDs
    const routeIds = new Set();
    const stopIds = new Set();
    const tripIdsToLookup = [];

    data.entity.forEach(entity => {
      if (entity.trip_update) {
        if (entity.trip_update.trip) {
          if (entity.trip_update.trip.route_id) {
            routeIds.add(entity.trip_update.trip.route_id);
          }
          if (stopId && entity.trip_update.trip.trip_id) {
            tripIdsToLookup.push(entity.trip_update.trip.trip_id);
          }
        }
        if (entity.trip_update.stop_time_update) {
          entity.trip_update.stop_time_update.forEach(stu => {
            if (stu.stop_id) stopIds.add(stu.stop_id);
          });
        }
      }
    });

    const uniqueRouteIds = Array.from(routeIds);
    const uniqueStopIds = Array.from(stopIds);
    const uniqueTripIdsToLookup = [...new Set(tripIdsToLookup)];

    // Fetch names from DB
    let routeMap = {};
    let stopMap = {};

    if (uniqueRouteIds.length > 0) {
      const routeRes = await pool.query(
        'SELECT route_id, route_short_name FROM gtfs.routes WHERE route_id = ANY($1)',
        [uniqueRouteIds]
      );
      routeRes.rows.forEach(row => {
        routeMap[row.route_id] = row.route_short_name;
      });
    }

    if (uniqueStopIds.length > 0) {
      const stopRes = await pool.query(
        'SELECT stop_id, stop_name FROM gtfs.stops WHERE stop_id = ANY($1)',
        [uniqueStopIds]
      );
      stopRes.rows.forEach(row => {
        stopMap[row.stop_id] = row.stop_name;
      });
    }

    // Fetch scheduled arrival times and sequences if stopId is provided
    let scheduleMap = {};
    if (stopId && uniqueTripIdsToLookup.length > 0) {
      const scheduleRes = await pool.query(
        `SELECT trip_id, arrival_time, stop_sequence 
             FROM gtfs.stop_times 
             WHERE stop_id = $1 AND trip_id = ANY($2)`,
        [stopId, uniqueTripIdsToLookup]
      );
      scheduleRes.rows.forEach(row => {
        scheduleMap[row.trip_id] = {
          arrival_time: row.arrival_time,
          stop_sequence: row.stop_sequence
        };
      });
    }

    
    const enrichedEntities = data.entity.map(entity => {
      if (entity.trip_update) {
        
        if (entity.trip_update.trip && entity.trip_update.trip.route_id) {
          entity.trip_update.trip.route_short_name = routeMap[entity.trip_update.trip.route_id] || entity.trip_update.trip.route_id;
        }

        
        if (entity.trip_update.stop_time_update) {
          entity.trip_update.stop_time_update = entity.trip_update.stop_time_update.map(stu => {
            return {
              ...stu,
              stop_name: stopMap[stu.stop_id] || stu.stop_id
            };
          });
        }

        
        if (stopId && entity.trip_update.trip && entity.trip_update.trip.trip_id) {
          const tripId = entity.trip_update.trip.trip_id;
          const scheduleInfo = scheduleMap[tripId];

          if (scheduleInfo) {
            const { arrival_time: scheduledTimeStr, stop_sequence: myStopSequence } = scheduleInfo;

            
            if (entity.trip_update.stop_time_update && entity.trip_update.stop_time_update.length > 0) {
              const firstUpdateSeq = entity.trip_update.stop_time_update[0].stop_sequence;
              if (firstUpdateSeq > myStopSequence) {
                entity.has_passed = true;
              }
            }

            
            let delay = 0;
            const specificStopUpdate = entity.trip_update.stop_time_update?.find(stu => stu.stop_id === stopId);
            if (specificStopUpdate && specificStopUpdate.arrival && specificStopUpdate.arrival.delay) {
              delay = specificStopUpdate.arrival.delay;
            } else if (entity.trip_update.stop_time_update && entity.trip_update.stop_time_update.length > 0) {
             
              const firstUpdate = entity.trip_update.stop_time_update[0];
              if (firstUpdate.arrival && firstUpdate.arrival.delay) {
                delay = firstUpdate.arrival.delay;
              }
            }

            if (scheduledTimeStr) {
              
              const [hours, minutes, seconds] = scheduledTimeStr.split(':').map(Number);
              const now = new Date();
              const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);

              
              const predictedDate = new Date(scheduledDate.getTime() + delay * 1000);

              entity.predicted_arrival_time = predictedDate.toISOString();
              entity.scheduled_arrival_time = scheduledTimeStr;
              entity.delay = delay;
            }
          }
        }
      }
      return entity;
    });

    res.status(200).json({ ...data, entity: enrichedEntities });
  } catch (error) {
    console.error('Error fetching TFI data:', error.message);
    res.status(500).json({ message: 'Failed to fetch real-time bus updates', error: error.message });
  }
};
