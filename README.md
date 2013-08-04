Pantry Pickup
=============

[pantrypickup.com](http://pantrypickup.com/)

Combining city data with a list of specific needs from food pantries will allow
citizens to most effectively make useful and needed donations assisted by the
Pantry Pick-Up App.

Getting Started
===============

**Prerequisites**: PantryPickup is a node.js app sitting on top of a MongoDB
database. The script for initializing the database is written in Python. You'll
need to install those three things first. After installing those, you need to
initialize your database with the pantries and install any application-specific
dependencies.

Initializing the DB
-------------------

Starting from the root directory of this project:

    cd files
    ./pantry_import.py

This script has a few dependencies (e.g., `pymongo`); if your system is missing
any of these, you'll need to install them (via `easy_install` or your python
package manager) first.

Installing Node Dependencies
----------------------------

Starting from the root directory of this project:

    npm install

Running PantryPickup
--------------------

Starting from the root directory of this project:

    npm start

This executes `node lib/app.js`. If you're using node-supervisor, node-
inspector, or any other similar tool, you'll want to pass in `lib/app.js` as the
entry point into the app.

The default database is `mongodb://localhost/pantry_pickup`. To use a different database, run the app with a DATABASE environment variable, e.g.:

    DATABASE=mongodb://localhost/other_db node lib/app.js

Or create a [config](http://lorenwest.github.io/node-config/latest/) file for
your host and add it to your system's gitignore.


Deploying PantryPickup
======================

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


Contributing to PantryPickup
============================

PantryPickup is a fledgling app at the moment and is definitely welcoming
contributions. The best way to contribute right now is to take a look at the
[open issues](https://github.com/codeforboston/pantry_pickup/issues?state=open)
and look for something interesting that's not yet assigned to anyone else.
Please post a comment on the issue to let us know you're interested, and then
[fork the repository](http://gun.io/blog/how-to-github-fork-branch-and-pull-
request/).

If you have any questions at all, please get in touch with us.

[Liam Morley](https://twitter.com/carpeliam) &bull; [Harlan Weber](https://twitter.com/whereshj)