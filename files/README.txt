Geocoding / data clean up readme
Contact Yuki for clarification


sheets:
source - copied from the google spreadsheet.
source-cleaned - source data with corrections and updates
    rows:
        address-original - address as taken from gdoc
        address-cleaned - cleaned address
        duplicate - 1 if a duplicate exists, blank otherwise
        Error/Notes - marked for errors, notes. "Meal" - Place serves meals, not a pantry. "POBox" - address is a PO Box. "Dropoff" - place is only a dropoff location, should only be displayed to donors.
geocoding-output - raw geocoding output from route4me.com. From RHoK weekend, will probably get replaced
geocoding-work - fixing geocoding vlookup against geocoding-output. will also probably get replaced wholesale when geocoding-output is updated.



Notes on mongo setup:
To ensure geo indexes on location fields run:
    db.pantries.ensureIndex({"loc":"2dsphere"})
(this should be a one time operation after creating the db)

To query for all locations within 10000000 meters of <40,-71>, ordered by proximity run:
    db.pantries.find({"loc":{ $near:{$geometry:{type:"Point",coordinates:[-71.0,40.0]}}, $maxDistance:10000000}})
