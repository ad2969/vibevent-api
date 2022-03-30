#!/bin/bash

# By default, running the API will connect to stage backend
env=${1:-stage}

if [ $env == production ]
then # production environment
    docker-compose -f docker-compose.yml up
elif [ $env == local ]
then # local environment (with local mongodb)
    docker-compose -f docker-compose.local.yml up
else # stage environment (default)
    docker-compose -f docker-compose.stage.yml up
fi