#!/bin/bash

# start.sh
# When run from within the pantry_pickup container, perform all setup
# and run the application on port 3001.

if [ ! -d "/app" ]; then
    echo "Uh-oh! Application directory was not properly mounted."
    echo "Did you start the container with docker-compose up?"
    exit 1
fi

echo America/New_York > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata

python /app/files/pantry_import.py

cd /app
npm install --ignore-shrinkwrap

if [ -n "$MONGO_HOST" ]; then
    export DATABASE=mongodb://$MONGO_HOST/pantry_pickup
fi

if [ "$SERVER_MODE" = "development" ]; then
    npm run-script devstart
else
    npm start
fi
