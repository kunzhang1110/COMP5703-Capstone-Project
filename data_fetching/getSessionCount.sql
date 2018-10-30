/****** get count of each session  ******/
SELECT count(entity_id) as Rows,dateadd(second, timestamp + 36000, '1970-01-01') as Timestamp /*36000 as Sydney UTC+10*/
  FROM [dbo].[trip_updates_raw]
  GROUP BY timestamp
  ORDER BY timestamp 

GO

SELECT count(entity_id) as Rows
  FROM [dbo].[trip_updates_raw]



