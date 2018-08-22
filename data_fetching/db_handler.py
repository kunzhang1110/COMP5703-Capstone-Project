import pymongo

def db_connect(collection_name):
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["COMP5703"]
    mycollection = mydb[collection_name]
    print(mycollection)
    return mycollection

def insert_trip(mycollection, data_entry):
    mycollection.insert(data_entry)
