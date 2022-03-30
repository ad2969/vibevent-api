# Spin up all the Docker containers
docker-compose --project-name ci_event_discovery --file ../docker-compose.test.yml up --abort-on-container-exit --exit-code-from test
# Spin down all the Docker containers after exiting
docker-compose --project-name ci_event_discovery --file ../docker-compose.test.yml down

echo "Exiting tests...."
