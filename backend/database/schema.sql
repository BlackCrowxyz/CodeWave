-- GTFS Database Schema
-- General Transit Feed Specification (GTFS) database schema for PostgreSQL

-- Create GTFS schema
CREATE SCHEMA IF NOT EXISTS gtfs;

-- Agency table: Transit agencies with service represented in this dataset
CREATE TABLE IF NOT EXISTS gtfs.agency (
    agency_id text PRIMARY KEY,
    agency_name text NOT NULL,
    agency_url text NOT NULL,
    agency_timezone text NOT NULL
);

-- Stops table: Individual locations where vehicles pick up or drop off riders
CREATE TABLE IF NOT EXISTS gtfs.stops (
    stop_id text PRIMARY KEY,
    stop_code text,
    stop_name text NOT NULL,
    stop_desc text,
    stop_lat double precision NOT NULL,
    stop_lon double precision NOT NULL,
    zone_id text,
    stop_url text,
    location_type integer,
    parent_station text
);

-- Routes table: Transit routes (a group of trips that are displayed as a single service)
CREATE TABLE IF NOT EXISTS gtfs.routes (
    route_id text PRIMARY KEY,
    agency_id text,
    route_short_name text,
    route_long_name text,
    route_desc text,
    route_type integer NOT NULL,
    route_url text,
    route_color text,
    route_text_color text,
    FOREIGN KEY (agency_id) REFERENCES gtfs.agency(agency_id)
);

-- Trips table: Trips for each route
CREATE TABLE IF NOT EXISTS gtfs.trips (
    trip_id text PRIMARY KEY,
    route_id text,
    service_id text NOT NULL,
    trip_headsign text,
    trip_short_name text,
    direction_id integer,
    block_id text,
    shape_id text,
    FOREIGN KEY (route_id) REFERENCES gtfs.routes(route_id)
);

-- Stop Times table: Times that a vehicle arrives at and departs from stops for each trip
CREATE TABLE IF NOT EXISTS gtfs.stop_times (
    trip_id text NOT NULL,
    arrival_time text,
    departure_time text,
    stop_id text NOT NULL,
    stop_sequence integer NOT NULL,
    stop_headsign text,
    pickup_type integer,
    drop_off_type integer,
    timepoint integer,
    PRIMARY KEY (trip_id, stop_sequence),
    FOREIGN KEY (trip_id) REFERENCES gtfs.trips(trip_id),
    FOREIGN KEY (stop_id) REFERENCES gtfs.stops(stop_id)
);

-- Calendar table: Service dates specified using a weekly schedule with start and end dates
CREATE TABLE IF NOT EXISTS gtfs.calendar (
    service_id text PRIMARY KEY,
    monday integer NOT NULL,
    tuesday integer NOT NULL,
    wednesday integer NOT NULL,
    thursday integer NOT NULL,
    friday integer NOT NULL,
    saturday integer NOT NULL,
    sunday integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);

-- Calendar Dates table: Exceptions for the services defined in calendar.txt
CREATE TABLE IF NOT EXISTS gtfs.calendar_dates (
    service_id text NOT NULL,
    date date NOT NULL,
    exception_type integer NOT NULL,
    PRIMARY KEY (service_id, date)
);

-- Shapes table: Rules for mapping vehicle travel paths (for drawing routes on a map)
CREATE TABLE IF NOT EXISTS gtfs.shapes (
    shape_id text NOT NULL,
    shape_pt_lat double precision NOT NULL,
    shape_pt_lon double precision NOT NULL,
    shape_pt_sequence integer NOT NULL,
    shape_dist_traveled double precision,
    PRIMARY KEY (shape_id, shape_pt_sequence)
);

-- Feed Info table: Additional information about the feed itself
CREATE TABLE IF NOT EXISTS gtfs.feed_info (
    feed_publisher_name text,
    feed_publisher_url text,
    feed_lang text,
    feed_start_date date,
    feed_end_date date,
    feed_version text,
    feed_contact_email text
);

-- Users table: Application users for authentication
CREATE TABLE IF NOT EXISTS gtfs.users (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id ON gtfs.stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_id ON gtfs.stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON gtfs.trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_service_id ON gtfs.trips(service_id);
CREATE INDEX IF NOT EXISTS idx_routes_agency_id ON gtfs.routes(agency_id);
CREATE INDEX IF NOT EXISTS idx_stops_location ON gtfs.stops(stop_lat, stop_lon);
CREATE INDEX IF NOT EXISTS idx_calendar_dates_service_id ON gtfs.calendar_dates(service_id);
CREATE INDEX IF NOT EXISTS idx_shapes_shape_id ON gtfs.shapes(shape_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON gtfs.users(email);

