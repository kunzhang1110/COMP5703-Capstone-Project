"""
This module fetches Public Transport - Realtime Vehicle Positions
"""
import os
import json
from enum import Enum
import pytz
from time import sleep
from datetime import datetime, timedelta
import requests
from google.protobuf import json_format
from google.transit import gtfs_realtime_pb2
from db_handler import db_connect, insert_trip
from google.protobuf import json_format
from pandas.io.json import json_normalize
import threading


GTFS_API_KEY = "vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2"
TIMETABLE_URL = "https://api.transport.nsw.gov.au/v1/publictransport/timetables/complete/gfts"

TIME_ZONE = "Australia/Sydney"

class TransportType(Enum):
    """Transport type for url"""
    BUS = "buses"
    LIGHTRAIL = "lightrail"
    FERRY = "ferries"


def fetch(transport_type):
    print("Fetching" + transport_type.value)
    headers = {
        'Connection': 'close',  # close connection after response
        'Api-User-Agent': 'Example/1.0',
        'Authorization': 'apikey vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2'
    }
    url = VEHICLEPOS_URL + transport_type.value
    response = requests.get(url, headers=headers)
    print("responding:" , response.status_code)
    if response.status_code == 200:
        feed_message = gtfs_realtime_pb2.FeedMessage()
        feed_message.ParseFromString(response.content)
        json_message = json_format.MessageToJson(feed_message)
        for entity in feed_message.entity:
            if entity.HasField('vehicle'):
                vehicle = json_format.MessageToJson(entity.vehicle) #return json string
                vehicle_parsed = json.loads(vehicle)    #convert json string to JSON
                insert_trip(MY_COLLECTION, vehicle_parsed)
        print("data saved")
    else:
        print(response.status_code)
        print(response.content)


if __name__ == '__main__':
    MY_COLLECTION = db_connect("vehiclepos")
    TIMEOUT = 30.0 # Sixty seconds
    ENDTIME = datetime.now() + timedelta(minutes=15)
    while True:
        if datetime.now() >= ENDTIME:
            break
        fetch(TransportType.FERRY)
        sleep(TIMEOUT)
