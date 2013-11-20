#!/usr/bin/env python

# Takes in a CSV file which contains the following fields:
# Address, City, Zip, lat, lng
# uses the Address + City + Zip fields to geocode the address, and writes it to the lat/lng fields. Writes a new file called filename.geocoded.csv with the new data



import csv
from geopy import geocoders
from pprint import pprint
import time

FILENAME = 'pantry'
g = geocoders.GoogleV3()

with open(FILENAME+'.geocoded.csv', 'w') as new_f:
  with open(FILENAME+'.csv', 'rb') as f:
    reader = csv.reader(f)
    writer = csv.writer(new_f)
    for i, row in enumerate(reader):
      OID, Source, Site_Name, Address, City, Zip, ZipTxt, Hours, HoursJSON, gcalJSON, website, phone, email, old_lat, old_lng = row
      print "~~~~~"
      print Address, City, Zip
      try:
        place, (new_lat, new_lng) = g.geocode(Address + ", " + City + " " + str(Zip).zfill(5))

        print "old: ", old_lat, old_lng
        print "new: ", new_lat, new_lng

        writer.writerow([OID, Source, Site_Name, Address, City, Zip, ZipTxt, Hours, HoursJSON, gcalJSON, website, phone, email, new_lat, new_lng])
      except Exception as e:
        print "FAILED", e
        writer.writerow(row)

      time.sleep(1) #rate limit

