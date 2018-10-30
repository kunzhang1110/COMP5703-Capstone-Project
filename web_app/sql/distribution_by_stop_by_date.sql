SELECT
  start_date,
  stop_performance,
  count(*) as count
INTO dbo.web_stop_dist
FROM dbo.py_stop_performance
GROUP BY start_date, stop_performance
