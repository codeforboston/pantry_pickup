# This scripts assumes a few things:
#  1. Your Docker Machine is called 'dev'
#  2. The MongoDB container is running, and it's called pantrypickup_mongo_1

vm_name=dev
container_name=pantrypickup_mongo_1
db_name=pantry_pickup

files_dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )


eval $(docker-machine env $vm_name)

if ! docker exec $container_name -- mongodump -d $db_name -o /dbdump>; then
    exit 1
fi

docker cp $container_name:/dbdump/$db_name $files_dir/dump
