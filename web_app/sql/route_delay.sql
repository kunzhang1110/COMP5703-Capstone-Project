DROP TABLE dbo.route_delay_with_name

SELECT
  a.route_id,
  a.route_desc,
  c.agency_name,
  a.route_short_name,
  a.route_long_name,
  b.early_percent as early_percentage,
  b.ontime_percent as ontime_percentage,
  b.late_percent as late_percentage,
  b.route_performance
INTO dbo.web_route_delay_with_name
FROM dbo.routes as a
JOIN dbo.py15_route_performance as b
ON  a.route_id = b.route_id
JOIN dbo.agency as c
ON a.agency_id = c.agency_id
