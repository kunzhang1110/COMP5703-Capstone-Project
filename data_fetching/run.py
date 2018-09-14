"""
This module fetches Public Transport - Realtime Trip Updates
"""
import json

from enum import Enum
import csv
from os import path
from time import sleep
from datetime import datetime, timedelta
import requests
from db_handler import *

import importlib.util
from google.transit import gtfs_realtime_pb2

GTFS_API_KEY = "vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2"
REAL_TIME_URL = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/"
DATA_SAVE_PATH = "./data"

TIME_ZONE = "Australia/Sydney"

FIELDNAMES = ["entity_id", "timestamp", "trip_id", "start_time", "start_date", "trip_schedule_relationship",
              "stop_sequence", "arrival_delay", "arrival_time", "departure_delay",
              "route_id", "vehicle_id", "departure_time", "stop_id", "stop_schedule_relationship"]


class TransportType(Enum):
    """Transport type for url"""
    BUS = "buses"
    LIGHTRAIL = "lightrail"
    FERRY = "ferries"


def get_response(_transport_type):
    print("Fetching: " + _transport_type.value + "...")
    headers = {
        'Connection': 'close',  # close connection after response
        'Api-User-Agent': 'Example/1.0',
        'Authorization': 'apikey vTeeyq2hCQQRHF8sEey4hyWaNXz7ffWqEBh2'
    }
    url = REAL_TIME_URL + _transport_type.value
    try:
        response = requests.get(url, headers=headers)
        print("Responding:", response.status_code)
        if response.status_code != 200:
            raise Exception('Responding Error')
    except Exception:
        print("Requesting error: ")
    else:
        return response


def save_response(_response):
    all_rows = []
    entity_original_size = 0

    feed_message = gtfs_realtime_pb2.FeedMessage()
    feed_message.ParseFromString(_response.content)
    timestamp = feed_message.header.timestamp
    for entity in feed_message.entity:
        entity_rows = entity_flatten(entity, timestamp)
        try:
            entity_original_size += len(entity.trip_update.stop_time_update)
        except:
            pass
        for row in entity_rows:
            all_rows.append(row)

    save_to_db(all_rows)
    #save_to_file(all_rows, timestamp)
    entity_saved_size = len(all_rows)
    print("Original Data Size: " + str(entity_original_size))
    print("Saved Data Size: " + str(entity_saved_size))
    print("Data saved: " + str(timestamp))


def entity_flatten(_entity, _timestamp):
    entity_rows = []
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
            stop_time_updates = trip_update.stop_time_update
            for update in stop_time_updates:
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
                row = [entity_id, _timestamp, trip_id, start_time, start_date,
                       trip_schedule_relationship, stop_sequence, arrival_delay,arrival_time,departure_delay,
                       route_id, vehicle_id, departure_time, stop_id, schedule_relationship]
                entity_rows.append(dict(zip(FIELDNAMES, row)))
    return entity_rows


def save_to_file(_all_rows, _timestamp):
    file_path = path.join(DATA_SAVE_PATH, str(_timestamp) + ".csv")
    with open(file_path, "a+", newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in _all_rows:
            writer.writerow(row)


def save_to_db(_all_rows):
    insert_all(_all_rows)


if __name__ == '__main__':
    #MY_COLLECTION = db_connect("realtime")
    TIMEOUT = 300.0 # in minutes
    INTERVAL = 15 # in seconds
    ENDTIME = datetime.now() + timedelta(minutes=TIMEOUT)
    while True:
        if datetime.now() >= ENDTIME:
            break
        save_response(get_response(TransportType.BUS))
        sleep(INTERVAL)
        # try:
        #     save_response(get_response(TransportType.BUS))
        # except:
        #     pass
        # else:
        #     sleep(INTERVAL)
