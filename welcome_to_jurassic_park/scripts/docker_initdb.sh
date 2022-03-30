# COPY TEMPLATE DATA
docker cp ./container_test/assets/__roles.json mongodb:/tmp/__roles.json

docker cp ./container_test/assets/categoriesData.json mongodb:/tmp/categoriesData.json

docker cp ./container_test/assets/eventData.json mongodb:/tmp/eventData.json
docker cp ./container_test/assets/locationEventData.json mongodb:/tmp/locationEventData.json
docker cp ./container_test/assets/organizationEventData.json mongodb:/tmp/organizationEventData.json

docker cp ./container_test/assets/userData.json mongodb:/tmp/userData.json
docker cp ./container_test/assets/organizationUserData.json mongodb:/tmp/organizationUserData.json

# ACCESS MONGODB BASH AND CLEAR DATABASE
docker exec -it mongodb mongo event-discovery-api --eval "db.dropDatabase();"
# ACCESS MONGODB BASH AND IMPORT DATA
docker exec -it mongodb mongoimport --db event-discovery-api --collection roles --file /tmp/__roles.json --jsonArray

docker exec -it mongodb mongoimport --db event-discovery-api --collection categories --file /tmp/categoriesData.json --jsonArray

docker exec -it mongodb mongoimport --db event-discovery-api --collection events --file /tmp/eventData.json --jsonArray
docker exec -it mongodb mongoimport --db event-discovery-api --collection events --file /tmp/locationEventData.json --jsonArray
docker exec -it mongodb mongoimport --db event-discovery-api --collection events --file /tmp/organizationEventData.json --jsonArray

docker exec -it mongodb mongoimport --db event-discovery-api --collection users --file /tmp/userData.json --jsonArray
docker exec -it mongodb mongoimport --db event-discovery-api --collection users --file /tmp/organizationUserData.json --jsonArray