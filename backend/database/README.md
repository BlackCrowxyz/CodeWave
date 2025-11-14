# GTFS Database Schema

This directory contains the database schema for the General Transit Feed Specification (GTFS) data.

## Overview

GTFS (General Transit Feed Specification) is a standardized format for public transportation schedules and geographic information. This schema implements the core GTFS specification in PostgreSQL.

## Database Setup

To set up the database schema, run:

```bash
psql -U your_username -d your_database -f database/schema.sql
```

Or if you're using a connection string:

```bash
psql postgresql://username:password@host:port/database -f database/schema.sql
```

## Schema Structure

### Core Tables

#### `gtfs.agency`
Transit agencies with service represented in this dataset.

| Column | Type | Description |
|--------|------|-------------|
| agency_id | text | Primary key - Uniquely identifies a transit agency |
| agency_name | text | Full name of the transit agency |
| agency_url | text | URL of the transit agency |
| agency_timezone | text | Timezone where the agency is located |

#### `gtfs.stops`
Individual locations where vehicles pick up or drop off riders.

| Column | Type | Description |
|--------|------|-------------|
| stop_id | text | Primary key - Uniquely identifies a stop |
| stop_code | text | Short text or number that identifies the stop |
| stop_name | text | Name of the stop |
| stop_desc | text | Description of the stop |
| stop_lat | double precision | Latitude of the stop location |
| stop_lon | double precision | Longitude of the stop location |
| zone_id | text | Fare zone for a stop |
| stop_url | text | URL for the stop |
| location_type | integer | Type of the location |
| parent_station | text | Station associated with the stop |

#### `gtfs.routes`
Transit routes. A route is a group of trips displayed to riders as a single service.

| Column | Type | Description |
|--------|------|-------------|
| route_id | text | Primary key - Uniquely identifies a route |
| agency_id | text | Foreign key - Agency for the route |
| route_short_name | text | Short name of a route |
| route_long_name | text | Full name of a route |
| route_desc | text | Description of the route |
| route_type | integer | Type of transportation used on a route |
| route_url | text | URL of a web page about the route |
| route_color | text | Route color designation |
| route_text_color | text | Legible color for text on route_color |

**Route Types:**
- 0: Tram, Streetcar, Light rail
- 1: Subway, Metro
- 2: Rail
- 3: Bus
- 4: Ferry
- 5: Cable tram
- 6: Aerial lift
- 7: Funicular

#### `gtfs.trips`
Trips for each route. A trip is a sequence of two or more stops at specific times.

| Column | Type | Description |
|--------|------|-------------|
| trip_id | text | Primary key - Uniquely identifies a trip |
| route_id | text | Foreign key - Route associated with the trip |
| service_id | text | Service pattern for the trip |
| trip_headsign | text | Text that appears on signage |
| trip_short_name | text | Short name for the trip |
| direction_id | integer | Direction of travel (0 or 1) |
| block_id | text | Block to which the trip belongs |
| shape_id | text | Shape that describes the trip path |

#### `gtfs.stop_times`
Times that a vehicle arrives at and departs from stops for each trip.

| Column | Type | Description |
|--------|------|-------------|
| trip_id | text | Primary key (composite) - Trip identifier |
| arrival_time | text | Arrival time at the stop |
| departure_time | text | Departure time from the stop |
| stop_id | text | Stop identifier |
| stop_sequence | integer | Primary key (composite) - Order of stops |
| stop_headsign | text | Text that appears on signage |
| pickup_type | integer | Pickup method (0=regular, 1=none, 2=phone, 3=driver) |
| drop_off_type | integer | Drop off method |
| timepoint | integer | Whether times are exact (1) or approximate (0) |

#### `gtfs.calendar`
Service dates specified using a weekly schedule with start and end dates.

| Column | Type | Description |
|--------|------|-------------|
| service_id | text | Primary key - Uniquely identifies a service |
| monday - sunday | integer | Service availability (1=available, 0=not available) |
| start_date | date | Start service date |
| end_date | date | End service date |

#### `gtfs.calendar_dates`
Exceptions for the services defined in calendar.

| Column | Type | Description |
|--------|------|-------------|
| service_id | text | Service identifier |
| date | date | Exception date |
| exception_type | integer | Type of exception (1=added, 2=removed) |

#### `gtfs.shapes`
Rules for mapping vehicle travel paths (optional, for drawing routes on a map).

| Column | Type | Description |
|--------|------|-------------|
| shape_id | text | Uniquely identifies a shape |
| shape_pt_lat | double precision | Latitude of a shape point |
| shape_pt_lon | double precision | Longitude of a shape point |
| shape_pt_sequence | integer | Sequence of the point |
| shape_dist_traveled | double precision | Distance traveled along the shape |

#### `gtfs.feed_info`
Additional information about the feed itself (optional).

| Column | Type | Description |
|--------|------|-------------|
| feed_publisher_name | text | Name of the feed publisher |
| feed_publisher_url | text | URL of the feed publisher |
| feed_lang | text | Default language for the feed |
| feed_start_date | date | Start date for the feed |
| feed_end_date | date | End date for the feed |
| feed_version | text | Version of the feed |
| feed_contact_email | text | Contact email for the feed |

## Indexes

The schema includes optimized indexes for common query patterns:

- Stop times by stop_id and trip_id
- Trips by route_id and service_id
- Routes by agency_id
- Geographic index on stop locations
- Calendar dates by service_id
- Shapes by shape_id

## Data Import

To import GTFS data from CSV files:

```sql
-- Example for stops
COPY gtfs.stops FROM '/path/to/stops.txt' DELIMITER ',' CSV HEADER;

-- Example for routes
COPY gtfs.routes FROM '/path/to/routes.txt' DELIMITER ',' CSV HEADER;
```

## Common Queries

### Find all stops for a route
```sql
SELECT DISTINCT s.*
FROM gtfs.stops s
JOIN gtfs.stop_times st ON s.stop_id = st.stop_id
JOIN gtfs.trips t ON st.trip_id = t.trip_id
WHERE t.route_id = 'your_route_id';
```

### Find next departures from a stop
```sql
SELECT r.route_short_name, t.trip_headsign, st.departure_time
FROM gtfs.stop_times st
JOIN gtfs.trips t ON st.trip_id = t.trip_id
JOIN gtfs.routes r ON t.route_id = r.route_id
WHERE st.stop_id = 'your_stop_id'
AND st.departure_time > CURRENT_TIME
ORDER BY st.departure_time
LIMIT 10;
```

## References

- [GTFS Specification](https://developers.google.com/transit/gtfs)
- [GTFS Static Overview](https://developers.google.com/transit/gtfs/reference)

## Notes

- All time values are stored as text in HH:MM:SS format
- Times can exceed 24:00:00 for trips that span multiple days
- Coordinates use WGS84 datum (latitude and longitude in decimal degrees)

