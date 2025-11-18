psql postgres # to start database

CREATE SCHEMA IF NOT EXISTS gtfs;

CREATE TABLE IF NOT EXISTS gtfs.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------


Here is a complete, clean **`README.md`** you can include in your project root.
It contains everything — how to set up the database, schemas, GTFS tables, user tables, setup, and how to fix common issues like the `"relation gtfs.users does not exist"` error.

---

here is the `.env` file:

```
# Database Configuration
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=[yourpassword]
DB_HOST=localhost
DB_PORT=5432

# Application Configuration
APP_SECRET=
PORT=3001
NODE_ENV=development

# GTFS Schema Configuration
DB_SCHEMA=gtfs

# API Keys
ORS_API_KEY=

# TFI Configuration
TFI_GTFS_URL="https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json"
NTA_API_KEY=
```


# GTFS Journey Planner — Setup Guide

This project combines **frontend**, **backend**, and **PostgreSQL** (with a `gtfs` schema) to handle GTFS data, user journeys, and real-time transport updates.

---

## 📦 Project Structure

```

project/
├── frontend/
├── backend/
├── README.md
└── sql/
├── gtfs_core.sql
├── gtfs_users.sql

````

---

## 🗄️ Database Setup (PostgreSQL)

If you want to set up the database manually:

### 1. Create a database and schema

```sql
CREATE DATABASE mydb;
\c mydb;
CREATE SCHEMA IF NOT EXISTS gtfs;
```

### 2. Create GTFS core tables

Run the following SQL (save as `gtfs_core.sql`):

```sql
CREATE TABLE IF NOT EXISTS gtfs.agency (
  agency_id text PRIMARY KEY,
  agency_name text NOT NULL,
  agency_url text NOT NULL,
  agency_timezone text NOT NULL
);

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

CREATE TABLE IF NOT EXISTS gtfs.routes (
  route_id text PRIMARY KEY,
  agency_id text,
  route_short_name text,
  route_long_name text,
  route_desc text,
  route_type integer NOT NULL,
  route_url text,
  route_color text,
  route_text_color text
);

CREATE TABLE IF NOT EXISTS gtfs.trips (
  route_id text,
  service_id text NOT NULL,
  trip_id text PRIMARY KEY,
  trip_headsign text,
  trip_short_name text,
  direction_id integer,
  block_id text,
  shape_id text
);

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
  PRIMARY KEY (trip_id, stop_sequence)
);

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

CREATE TABLE IF NOT EXISTS gtfs.calendar_dates (
  service_id text NOT NULL,
  date date NOT NULL,
  exception_type integer NOT NULL
);

CREATE TABLE IF NOT EXISTS gtfs.shapes (
  shape_id text NOT NULL,
  shape_pt_lat double precision NOT NULL,
  shape_pt_lon double precision NOT NULL,
  shape_pt_sequence integer NOT NULL,
  shape_dist_traveled double precision,
  PRIMARY KEY (shape_id, shape_pt_sequence)
);

CREATE TABLE IF NOT EXISTS gtfs.feed_info (
  feed_publisher_name text,
  feed_publisher_url text,
  feed_lang text,
  feed_start_date date,
  feed_end_date date,
  feed_version text,
  feed_contact_email text
);
```

Then run:

```bash
psql -d mydb -f sql/gtfs_core.sql
```

---

### 3. Create user, journey, and realtime tables

Save this as `sql/gtfs_users.sql`:

```sql
CREATE TABLE IF NOT EXISTS gtfs.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gtfs.journeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES gtfs.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    itinerary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gtfs.realtime_updates (
    id SERIAL PRIMARY KEY,
    trip_id TEXT REFERENCES gtfs.trips(trip_id),
    stop_id TEXT REFERENCES gtfs.stops(stop_id),
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    delay INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, stop_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON gtfs.users(email);
CREATE INDEX IF NOT EXISTS idx_journeys_user ON gtfs.journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_trip ON gtfs.realtime_updates(trip_id);
CREATE INDEX IF NOT EXISTS idx_realtime_stop ON gtfs.realtime_updates(stop_id);
CREATE INDEX IF NOT EXISTS idx_realtime_created ON gtfs.realtime_updates(created_at);

CREATE OR REPLACE FUNCTION gtfs.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON gtfs.users 
    FOR EACH ROW EXECUTE FUNCTION gtfs.update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at 
    BEFORE UPDATE ON gtfs.journeys 
    FOR EACH ROW EXECUTE FUNCTION gtfs.update_updated_at_column();

CREATE TRIGGER update_realtime_updates_updated_at 
    BEFORE UPDATE ON gtfs.realtime_updates 
    FOR EACH ROW EXECUTE FUNCTION gtfs.update_updated_at_column();
```

Run:

```bash
psql -d mydb -f sql/gtfs_users.sql
```

---

### 4. Verify all tables

```sql
\dt gtfs.*
```

You should now see:

```
gtfs | agency
gtfs | stops
gtfs | routes
gtfs | trips
gtfs | stop_times
gtfs | calendar
gtfs | calendar_dates
gtfs | shapes
gtfs | feed_info
gtfs | users
gtfs | journeys
gtfs | realtime_updates
```
