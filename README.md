pantry_pickup
=============

pantrypickup.com

Combining city data with a list of specific needs from food pantries will allow citizens to most effectively make useful and needed donations assisted by the Pantry Pick-Up App. 

Running pantry_pickup
=====================

PantryPickup is a node.js app. To run it locally, please install node.js. Once node is installed, run:

    npm install
    node lib/app.js

The default database is `mongodb://localhost/pantry_pickup`. To use a different database, run the app with a DATABASE environment variable, e.g.:

    DATABASE=mongodb://localhost/other_db node lib/app.js


=====================

For automated deployments:

add to ~/.ssh/config

    #Pantry Pickup
    Host pantrypickup.com
    user ubuntu
    IdentityFile ~/.ssh/cfb

To deploy

    gem install capistrano
    gem install capistrano-node-deploy
    cap deploy
