DECLARE @select_count int =0;

DROP TABLE dbo.real_time_actual_delay;
DROP TABLE [dbo].stop_sequence_avg_delay;
DROP TABLE [dbo].stop_sequence_avg_delay_desc;

SELECT
      [timestamp]
      ,[route_id]
      ,a.[trip_id]
      ,[start_time]
      ,[start_date]
      ,[trip_schedule_relationship]
      ,a.[stop_id]
      ,a.[stop_sequence]
      ,a.[arrival_delay]
      ,a.[arrival_time]
      ,[departure_delay]
      ,a.[departure_time]
      ,[vehicle_id]
      ,[stop_schedule_relationship],


		DATEDIFF(
			second,
			CONVERT(datetime2, b.[departure_time]),
			DATEADD(
				s,
				DATEDIFF(
					second,
					CONVERT(datetime2, [start_date]),
					DATEADD(s, a.[departure_time], '19700101')),
				'19000101')
		) as actual_delay

 INTO dbo.real_time_actual_delay
 FROM [dbo].[real_time_test] as a
 LEFT JOIN [dbo].[stop_times] as b
 ON a.trip_id = b.trip_id AND a.[stop_id] = b.[stop_id] AND a.[stop_sequence] = b.[stop_sequence]

GO

DECLARE @select_count int =1000;
SELECT
	[route_id],
	[trip_id],
	[stop_id],
	[stop_sequence],
	avg([actual_delay]) AS [stop_sequence_avg_delay]
INTO [dbo].stop_sequence_avg_delay
FROM [dbo].[real_time_actual_delay]
GROUP BY [route_id],[trip_id],[stop_id],[stop_sequence]

GO

DECLARE @select_count int =1000;
SELECT
	[route_id]
	,[trip_id]
      ,[stop_id]
      ,[stop_sequence]
      ,[stop_sequence_avg_delay]
	  ,(CASE
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
INTO [dbo].stop_sequence_avg_delay_desc
FROM [dbo].[stop_sequence_avg_delay]

GO

DECLARE @select_count int =100;
SELECT
      [stop_id],
	  [delay_desc]
	  ,COUNT(*) as delay_number
	  ,SUM(COUNT(*)) OVER (PARTITION BY [stop_id]) as total
      ,CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [stop_id]) as decimal) as Percentage
FROM [dbo].[stop_sequence_avg_delay_desc]
GROUP BY [stop_id], [delay_desc]
ORDER BY [stop_id], [delay_desc]

GO

DECLARE @select_count int =100;
SELECT
      [trip_id],
	  [delay_desc]
	  ,COUNT(*) as delay_number
	  ,SUM(COUNT(*)) OVER (PARTITION BY [trip_id]) as total
      ,CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [trip_id]) as decimal) as Percentage
FROM [dbo].[stop_sequence_avg_delay_desc]
GROUP BY [trip_id], [delay_desc]
ORDER BY [trip_id], [delay_desc]
GO

DECLARE @select_count int =100;
SELECT
      [route_id],
	  [delay_desc]
	  ,COUNT(*) as delay_number
	  ,SUM(COUNT(*)) OVER (PARTITION BY [route_id]) as total
      ,CAST(COUNT(*) as decimal)/ CAST(SUM(COUNT(*)) OVER (PARTITION BY [route_id]) as decimal) as Percentage
FROM [dbo].[stop_sequence_avg_delay_desc]
GROUP BY [route_id], [delay_desc]
ORDER BY [route_id], [delay_desc]
