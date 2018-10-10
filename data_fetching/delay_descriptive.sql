DROP TABLE dbo.real_time_actual_delay;
DROP TABLE dbo.stop_sequence_avg_delay;
DROP TABLE dbo.stop_sequence_avg_delay_desc;
DROP TABLE dbo.stop_delay;
DROP TABLE dbo.trip_delay;
DROP TABLE dbo.route_delay;
DROP TABLE dbo.route_delay_with_name;


-- Total -- 3:30s for 26360 rows single session

-- Calculate Actual Delay
SELECT
  timestamp,
  route_id,
  a.trip_id,
  start_time,
  start_date,
  trip_schedule_relationship,
  a.stop_id,
  a.stop_sequence,
  a.arrival_delay,
  a.arrival_time,
  departure_delay,
  a.departure_time,
  vehicle_id,
  stop_schedule_relationship,
	DATEDIFF(  -- actual_delay in seconds
		second,
	  DATEADD(-- b.departure_time in HH:MM:SS in seconds converted from 36 hour to 24 hour
      s,
      (CAST(SUBSTRING(b.departure_time,1,2) as bigint)*3600
        + CAST(SUBSTRING(b.departure_time,4,2) as bigint)*60
        + CAST(SUBSTRING(b.departure_time,7,2) as bigint)),
      '19000101'),
		DATEADD(  -- a.departure_time in HH:MM:SS in seconds from 19000101
			s,
			DATEDIFF( -- seconds HH:MM:SS
				second,
				CONVERT(datetime2, start_date), -- start_date:00:00:00 in UNIX second
				DATEADD(s, a.departure_time, '19700101')), -- a.departure_time in UNIX second UTC+10
		  '19000101')
	) as actual_delay

 INTO dbo.real_time_actual_delay
 FROM dbo.trip_update_one_session as a
 JOIN dbo.stop_times as b
 ON a.trip_id = b.trip_id AND a.stop_id = b.stop_id AND a.stop_sequence = b.stop_sequence

-- 19s for 26360 rows

GO

-- Calculate average delay across (route_id,trip_id,stop_id,stop_sequence)
SELECT
  route_id,
	trip_id,
	stop_id,
	stop_sequence,
	avg(actual_delay) AS stop_sequence_avg_delay
INTO dbo.stop_sequence_avg_delay
FROM dbo.real_time_actual_delay
GROUP BY route_id,trip_id,stop_id,stop_sequence

GO

-- Evaluate delay and add delay description
SELECT
  route_id,
	trip_id,
  stop_id,
  stop_sequence,
  stop_sequence_avg_delay,
  (CASE
    WHEN stop_sequence_avg_delay <= 180
		THEN 'early' --early
		WHEN stop_sequence_avg_delay <= 300
		THEN 'on time' -- on time
		WHEN stop_sequence_avg_delay <= 900
		THEN 'late' -- late
		WHEN stop_sequence_avg_delay > 900
		THEN 'very late'
		ELSE NULL
	END) as delay_desc
INTO dbo.stop_sequence_avg_delay_desc
FROM dbo.stop_sequence_avg_delay

GO

-- Evaluate delay percentage at each stop
SELECT
  stop_id,
  delay_desc,
	COUNT(*) as delay_number,
	SUM(COUNT(*)) OVER (PARTITION BY [stop_id]) as total,
  CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [stop_id]) as decimal) as Percentage
INTO dbo.stop_delay
FROM dbo.stop_sequence_avg_delay_desc
GROUP BY stop_id, delay_desc
ORDER BY stop_id, delay_desc

GO

-- Evaluate delay percentage on each trip
SELECT
  trip_id,
	delay_desc,
	COUNT(*) as delay_number,
	SUM(COUNT(*)) OVER (PARTITION BY [trip_id]) as total,
  CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [trip_id]) as decimal) as Percentage
INTO dbo.trip_delay
FROM dbo.stop_sequence_avg_delay_desc
GROUP BY trip_id, delay_desc
ORDER BY trip_id, delay_desc

GO

-- Evaluate delay percentage for each route
SELECT
    route_id,
	  delay_desc,
	  COUNT(*) as delay_number,
	  SUM(COUNT(*)) OVER (PARTITION BY [route_id]) as total,
    CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [route_id]) as decimal) as Percentage
INTO dbo.route_delay
FROM dbo.stop_sequence_avg_delay_desc
GROUP BY route_id, delay_desc
ORDER BY route_id, delay_desc

GO

-- Display delay percentage for each route with route name
SELECT
  a.route_id,
  a.route_short_name,
  a.route_long_name,
	b.delay_desc,
	b.Percentage
INTO dbo.route_delay_with_name
FROM dbo.routes as a JOIN dbo.route_delay as b
ON  a.route_id = b.route_id
