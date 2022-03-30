#!/bin/bash

if [ -z $1 ]
then
    echo "Tag not found! Pushing to docker repository 'latest'..."
    docker tag event_discovery_api [REDACTED]
    docker push [REDACTED]:latest
elif [ $1 == production ]
then # production should also use the "latest" tag
    echo "Production tag used! Pushing to docker repository 'latest'..."
    docker tag event_discovery_api [REDACTED]:latest
    docker push [REDACTED]:latest
else
    echo "Pushing to docker repository '$1'..."
    docker tag event_discovery_api [REDACTED]:$1
    docker push [REDACTED]:$1
fi
