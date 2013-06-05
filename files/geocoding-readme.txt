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