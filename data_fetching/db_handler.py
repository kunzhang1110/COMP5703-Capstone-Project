import pyodbc

# COMP5703 Server
COMP5703_SERVER = {
    'server': 'cp13.database.windows.net',
    'database': 'COMP5703',
    'username': 'cp13',
    'password': 'COMP5703comp',
    'driver': '{ODBC Driver 13 for SQL Server}'
}

FIELDNAMES = ["entity_id", "timestamp", "trip_id", "start_time", "start_date", "trip_schedule_relationship",
              "stop_sequence", "arrival_delay", "arrival_time", "departure_delay",
              "route_id", "vehicle_id", "departure_time", "stop_id", "stop_schedule_relationship"]
PORT = 1443


def db_connect(server_info, _port):
    _port = str(_port)
    try:
        conn = pyodbc.connect('DRIVER=' + server_info['driver'] +
                              ';SERVER=' + server_info['server'] +
                              ';PORT=' + _port +
                              ';DATABASE=' + server_info['database'] +
                              ';UID=' + server_info['username'] +
                              ';PWD=' + server_info['password'],
                              autocommit=True)
    except pyodbc.Error as ex:
        print("Connection Error:" + ex.args[1])
    else:
        print("Connection Succeeded. Listening on Port " + _port)
        return conn

def get_conn():
    conn = db_connect(COMP5703_SERVER, PORT)
    cursor = conn.cursor()
    cursor.fast_executemany = True
    return conn, cursor


def insert_all(_all_rows_dict):
    all_rows = []
    conn, cursor = get_conn()
    sql_field = ','.join(FIELDNAMES)
    sql_value_holder = '?, '*(len(_all_rows_dict[0])-1) + "?"
    sql = 'INSERT INTO [dbo].[trip_updates_raw] (' + sql_field + ') VALUES(' + sql_value_holder + ')'
    print(sql)
    for entry in _all_rows_dict:
        all_rows.append(list(entry.values()))
    cursor.executemany(sql, all_rows)
    conn.commit()
    print("Insertion Complete")



if __name__ == '__main__':
    pass









# import pymongo
#
# def db_connect(collection_name):
#     myclient = pymongo.MongoClient("mongodb://localhost:27017/")
#     mydb = myclient["COMP5703"]
#     mycollection = mydb[collection_name]
#     print(mycollection)
#     return mycollection
#
# def insert_trip_db(mycollection, data_entry):
#     mycollection.insert(data_entry)
