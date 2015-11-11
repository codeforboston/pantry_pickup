#!/bin/bash

apt-get update
apt-get install -y python-pip python-dev build-essential

pip install -r /support/requirements.txt

npm install -g supervisor
