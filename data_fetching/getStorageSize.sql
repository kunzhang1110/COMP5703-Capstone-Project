select    
      sum(reserved_page_count) * 8.0 / 1024 [SizeInMB]
from    
      sys.dm_db_partition_stats

GO

select    
      sys.objects.name, sum(reserved_page_count) * 8.0 / 1024 [SizeInMB]
from    
      sys.dm_db_partition_stats, sys.objects
where    
      sys.dm_db_partition_stats.object_id = sys.objects.object_id

group by sys.objects.name
order by sum(reserved_page_count) DESC