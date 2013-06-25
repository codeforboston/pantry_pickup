require "capistrano/node-deploy"

set :application, "pantry-pickup"
set :repository,  "git@github.com:codeforboston/pantry_pickup.git"
set :user, "ubuntu"
set :scm, :git
set :deploy_to, "/home/ubuntu/pantry_pickup"
set :deploy_via, :remote_cache
set :app_command, "lib/app.js"
set :app_environment, "PORT=80 DATABASE=mongodb://localhost/pantry_pickup"
set :node_binary, "/usr/local/bin/supervisor"
set :ssh_options, { :forward_agent => true }

role :app, "pantrypickup.com"
