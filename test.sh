# By default, running the CI will run the api
service=${1:-api}

if [ $service = api ]
then
    # Spin up just the API Docker container
    docker-compose --project-name ci_event_discovery -f docker-compose.test.yml -f docker-compose.ci.yml up $service
    # Spin down all the Docker containers after exiting
    docker-compose --project-name ci_event_discovery -f docker-compose.test.yml down
else
    # Spin up just the TEST Docker containers
    docker-compose --project-name ci_event_discovery -f docker-compose.test.yml -f docker-compose.ci.yml up $service
fi

echo "Exiting ci container:  $service...."
