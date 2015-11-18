Poo Pickup
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

    pip install -r requirements.txt
    cd files
    ./pantry_import.py

This script has a few dependencies (e.g., `pymongo`); install them with `pip install -r requirements.txt`

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

Getting Started: Docker Edition
==========

If you would like to isolate this project from an existing install, or
if you'd prefer not to fiddle with dependencies, you can use Docker to
build and run PantryPickup.

Install [Docker Toolbox](https://www.docker.com/toolbox).

If you have never used Docker before, you will need to run:

```sh
    docker-machine create -d virtualbox dev
    docker-machine start dev
```

From the root directory of this project, run:

```sh
    eval $(docker-machine env dev)
    docker-compose build
    docker-compose up
```

The application should now be running. To view it on OS X:

```sh
    open http://$(docker-machine ip dev):3001
```
    
Where 3001 is the port configured in your config/common.env file. On other platforms, run `docker-machine ip dev` to determine the IP address of the VM, then open your browser to http://**IP address**:3001.

A similar process applies if you want to connect directly to other services. For example, you can connect to the Mongo server from a local Mongo client by running `mongo $(docker-machine ip dev)/pantry_pickup`

If you think you'll be doing this sort of thing frequently, you can add a hostname to your /etc/hosts file:

```sh
    echo "$(docker-machine ip dev) docker-dev" | sudo tee -a /etc/hosts
```

Once you've done that, you can use `docker-dev` wherever you'd use the IP. You can do `mongo docker-dev/pantry_pickup`, browse to `http://docker-dev:3001/`, etc.

Port Forwarding
----------

If you want to be able to connect to, e.g., `localhost:3001` instead of using the VM's IP address **and** you're using the VirtualBox driver (the `-d` option to `docker-machine`), do this:

    VBoxManage controlvm dev natpf1 "pantrypickup,tcp,127.0.0.1,3001,,3001"
   


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
