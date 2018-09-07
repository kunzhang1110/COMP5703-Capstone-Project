import pyodbc
server = 'cp13.database.windows.net'
database = 'COMP5703'
username = 'cp13'
password = 'COMP5703comp'
driver= '{ODBC Driver 13 for SQL Server}'
cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';PORT=1433;DATABASE='+database+';UID='+username+';PWD='+ password)
cursor = cnxn.cursor()
cursor.execute("SELECT TOP (20) [trip_id],[arrival_time] ,[departure_time] ,[stop_id] FROM [dbo].[stop_times]")
row = cursor.fetchone()
while row:
    print (str(row))
    row = cursor.fetchone()
