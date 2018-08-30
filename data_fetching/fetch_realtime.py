"""
This module fetches Public Transport - Realtime Trip Updates
"""
import json

from enum import Enum
import csv
# import pytz
from os import path
from time import sleep
from datetime import datetime, timedelta
import requests
from google.protobuf import json_format
from google.transit import gtfs_realtime_pb2
from db_handler import db_connect, insert_trip_db
from pandas.io.json import json_normalize
# import threading


GTFS_API_KEY = "vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2"
REAL_TIME_URL = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/"
DATA_SAVE_PATH = "./data"

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
        timestamp = feed_message.header.timestamp
        for entity in feed_message.entity:
            entity_parse(entity, timestamp)
        print("data saved")
    else:
        print(response.status_code)
        print(response.content)

def entity_parse(_entity, _timestamp):
    if _entity.HasField("trip_update"):
        entity_id = _entity.id
        trip_update = _entity.trip_update
        trip = trip_update.trip
        vehicle = trip_update.vehicle
        trip_id = trip.trip_id
        start_time = trip.start_time
        start_date = trip.start_date
        trip_schedule_relationship = trip.schedule_relationship
        route_id = trip.route_id
        vehicle_id = vehicle.id
        if hasattr(trip_update, "stop_time_update"):
            stop_time_update = trip_update.stop_time_update
            for update in stop_time_update:
                # TODO: use wrapper class to wrap attributes functions
                stop_id = update.stop_id
                schedule_relationship = update.schedule_relationship
                if hasattr(update, "stop_sequence"):
                    stop_sequence = update.stop_sequence
                else:
                    continue
                if hasattr(update, "arrival"):
                    arrival = update.arrival
                    arrival_delay = arrival.delay
                    arrival_time = arrival.time
                else:
                    continue
                if hasattr(update, "departure"):
                    departure = update.departure
                    departure_delay = departure.delay
                    departure_time = departure.time
                else:
                    continue
                # schedule_relationship is ENUM
                row = [entity_id, _timestamp, trip_id, start_time, start_date, trip_schedule_relationship, arrival_delay,arrival_time,departure_delay,
                       route_id, vehicle_id, departure_time, stop_id, schedule_relationship]
                # print(row)
                save_to_file(row, _timestamp)


def save_to_file(_content, _timestamp):
    file_path = path.join(DATA_SAVE_PATH, str(_timestamp) + ".csv")
    if not path.exists(file_path):
        with open(file_path, "w") as f:
            header = "entity_id, _timestamp, trip_id, start_time, start_date, trip_schedule_relationship,\
             arrival_delay,arrival_time,departure_delay,route_id, vehicle_id, departure_time, stop_id, \
             schedule_relationship\n"
            f.write(header)

    with open(file_path,"a+") as f:
        wr = csv.writer(f)
        wr.writerow(_content)


if __name__ == '__main__':
    MY_COLLECTION = db_connect("realtime")
    TIMEOUT = 30.0 # in minutes
    INTERVAL = 300 # in seconds
    ENDTIME = datetime.now() + timedelta(minutes=TIMEOUT)
    while True:
        if datetime.now() >= ENDTIME:
            break
        fetch(TransportType.BUS)
        sleep(INTERVAL)
