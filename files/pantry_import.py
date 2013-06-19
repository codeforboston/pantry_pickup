"""
    Super sloppy import script.

    Usage: Download document from Google drive as a csv. Filename set by FILENAME variable below.

    Writes results directly to MongoDB.

    WARNING: This script currently REPLACES the target collection.


"""


import csv
import random
import time
import datetime
import calendar
import urllib2
import simplejson as json

from pymongo import MongoClient
from pymongo import GEOSPHERE
from pymongo import ASCENDING

# Data source

FILENAME = 'pantry.csv'

# MongoDB connection settings

CON = MongoClient("localhost", 27017)
DB_NAME = 'pantry_pickup'
COLLECTION = 'pantries'


DAYS = {
    'Monday':"MO",
    'Tuesday':"TU",
    'Wednesday':"WE",
    'Thursday':"TH",
    'Friday':"FR",
    'Saturday':"SA",
    'Sunday':"SU"
}


def import_pantry(filename = FILENAME, db = CON[DB_NAME][COLLECTION]):

    # Deletes all records in target MongoDB collection
    db.remove()
    objs = []
    with open(filename, 'rb') as csvfile:
        obj = {}
        cr = csv.reader(csvfile, delimiter=',')  # read in file
        counter = 0
        for row in cr:
            if counter > 1:

                # Column mappings for CSV file.

                source = row[1]
                site_name = row[2]
                address = row[3]
                city = row[4]
                zipcode = row[5]
                hours = row[7]
                details = row[8]
                website = row[10]
                phone = row[11]
                email = row[12]
                lat = row[13]
                lng = row[14]
                if details:
                    # Parse 'json' values in the csv into actual json for writing
                    result = []
                    r = {}
                    details = details.replace('"','').split('\n')
                    for each in details:
                        fields = each.split(':')
                        name = fields[0].strip()
                        value = ':'.join(fields[1:]).replace(',','').strip()
                        for v in DAYS.keys():
                            if v in value:
                                value = v
                        if name in r:
                            result.append(r)
                            r = {}
                        elif name == 'repeatsOn':
                            value = value.replace("[","")
                            value = value.replace("]","")
                        r[name] = value

                # The below puts the hours of operation in a valid Google calendar form
                google_cal = []
                if result:
                    for each in result:
                        rule = {}
                        if "startsOn" in each:
                            s = datetime.datetime.strptime(each['startsOn'],"%m/%d/%Y")
                            h,m = each['start'].replace(';',':').split(':')
                            if h == '24':
                                h = 0
                            start = datetime.datetime(s.year,s.month,s.day, int(h),int(m)).isoformat()
                            start += '-04:00'
                            h,m = each['end'].replace(';',':').split(':')
                            if h == '24':
                                h = 0
                            end = datetime.datetime(s.year,s.month,s.day, int(h),int(m)).isoformat()
                            end += '-04:00'
                            rule['start'] = {'dateTime': start}
                            rule['end'] = {'dateTime':end}
                            r = "RRULE:"
                            if each.get('repeats', None) == "Weekly":
                                r += "FREQ=WEEKLY;BYDAY="
                            elif each.get('repeatsEvery', None) == '7':
                                r += "FREQ=WEEKLY;BYDAY="

                            else:
                                r+= "FREQ=MONTHLY;BYDAY="
                                z = calendar.monthcalendar(s.year, s.month)
                                wom = 0
                                for week in z:
                                    wom+=1
                                    try:
                                        dow = week.index(s.day)
                                        if z[0][dow] == 0:
                                            wom -= 1
                                    except:
                                        continue
                                    break
                                if wom in (4, 5):
                                    if "last" in hours:
                                        wom = -1
                                r += str(wom)
                            if each.get('repeatsOn', None):
                                day = DAYS[each['repeatsOn']]
                            elif each.get('repeatsBy', None):
                                day= DAYS[each['repeatsBy']]
                            r += day
                            rule['recurrence'] = [r]
                            rule['summary'] = site_name
                        google_cal.append(rule)

                obj = {
                        "source":source,
                        "site_name":site_name,
                        "address":address,
                        "city":city,
                        "zipcode":zipcode,
                        "hours": result,
                        "google_cal":google_cal,
                        "website":website,
                        "phone":phone,
                        "email":email,
                    }
                try:
                    obj['loc'] = {
                            "type":"Point",
                            "coordinates":[float(lng), float(lat)]
                        }
                except:
                    pass

                # random filler data
                food = ['apples','oranges','bread','cheese','moldy cheese','crusty bread','rice','beans',
                            'cow tounge',"chicken feet","snapper","cod","pasta","soup","raw chicken",
                            "meatloaf","ricotta","pesto","tomato sauce","potatoes","lettuce","carrots",
                            "blueberries","blackberries","onions","sunflower seeds"]
                policies = ["no open food","no pre-packaged food","no GMO!","Gluten-free","Atkins diet only",
                                "paleo-diet only","no peanuts","no soy","only pre-digested"]

                boolean = ["yes", "no"]
                obj['timestamp'] = time.time()
                obj['food_donations_accepted'] = True if random.choice(boolean) =='yes' else False
                obj['food_needs'] = random.sample(food,4)
                obj['cannot_accept'] = random.sample(food, 2)
                obj['volunteers_should_contact'] = True if random.choice(boolean) =='yes' else False
                obj['policies'] = random.sample(policies,2)

                # Write result to Mongo
                db.insert(obj, safe = True)
            counter +=1
    db.ensure_index([("loc", GEOSPHERE)])

if __name__ == '__main__':
    import_pantry()

