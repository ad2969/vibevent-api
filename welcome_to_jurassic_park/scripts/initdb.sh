# CLEAR MONGODB DATABASE
mongo event-discovery-api --eval "db.dropDatabase();"

# IMPORT DATA INTO MONGODB DATABASE
mongoimport --db event-discovery-api --collection roles --file ../container_test/assets/__roles.json --jsonArray

mongoimport --db event-discovery-api --collection categories --file ../container_test/assets/categoriesData.json --jsonArray

mongoimport --db event-discovery-api --collection events --file ../container_test/assets/eventData.json --jsonArray
mongoimport --db event-discovery-api --collection events --file ../container_test/assets/locationEventData.json --jsonArray
mongoimport --db event-discovery-api --collection events --file ../container_test/assets/organizationEventData.json --jsonArray

mongoimport --db event-discovery-api --collection users --file ../container_test/assets/userData.json --jsonArray
mongoimport --db event-discovery-api --collection users --file ../container_test/assets/organizationUserData.json --jsonArray