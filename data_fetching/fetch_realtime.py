"""
This module fetches Public Transport - Realtime Trip Updates
"""
import json
from enum import Enum
# import pytz
from time import sleep
from datetime import datetime, timedelta
import requests
from google.protobuf import json_format
from google.transit import gtfs_realtime_pb2
from db_handler import db_connect, insert_trip
# from pandas.io.json import json_normalize
# import threading


GTFS_API_KEY = "vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2"
REAL_TIME_URL = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/"


TIME_ZONE = "Australia/Sydney"

class TransportType(Enum):
    """Transport type for url"""
    BUS = "buses"
    LIGHTRAIL = "lightrail"
    FERRY = "ferries"


def fetch(transport_type):
    print("Fetching: " + transport_type.value + "...")
    headers = {
        'Connection': 'close',  # close connection after response
        'Api-User-Agent': 'Example/1.0',
        'Authorization': 'apikey vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2'
    }
    url = REAL_TIME_URL + transport_type.value
    response = requests.get(url, headers=headers)
    print("responding:", response.status_code)
    if response.status_code == 200:
        feed_message = gtfs_realtime_pb2.FeedMessage()
        feed_message.ParseFromString(response.content)
        for entity in feed_message.entity:
            if entity.HasField('trip_update'):
                trip_update = json_format.MessageToJson(entity.trip_update) #return json string
                trip_update_parsed = json.loads(trip_update)    #convert json string to JSON
                insert_trip(MY_COLLECTION, trip_update_parsed)
        print("data saved")
    else:
        print(response.status_code)
        print(response.content)


if __name__ == '__main__':
    MY_COLLECTION = db_connect("realtime")
    TIMEOUT = 30.0 # in minutes
    ENDTIME = datetime.now() + timedelta(minutes=TIMEOUT)
    while True:
        if datetime.now() >= ENDTIME:
            break
        fetch(TransportType.FERRY)
        sleep(TIMEOUT)
