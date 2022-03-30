# Event Discovery API
Event API for Prototype APP, built and written (almost) entirly by @ad2969

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

> Kebab-case is used for all **database** naming conventions and API URIs. We will adopt the default naming convention for Docker **containers**, which is to utilize snake_case format. For all JSON-related variable names, snakeCase will be used to minimalize the need of conversions.

> Documentation on the API is currently done on APIARY([REDACTED])

#### Terminology

- REPOSITORY (docker) vs REPO (github) - read more here([REDACTED])

#### Environment Definitions

Anything labelled **prod** is to be used for deploying to production - be EXTREMELY careful when handling anthing production-related, as it will directly affect the customers of the app.

Anything labelled **stage** (databases, containers, etc) are created to be used for developer testing purposes. Making changes will not affect the production branch. It is always recommended to test new changes on stage before taking it to production.

Anything that is intended for local development should simply be labelled **local**

Read more about environment definitions here([REDACTED])

### Prerequisites

- Node.js v13 (npm v6) (Download [here](https://nodejs.org/en/download/))
- EsLint v6.8 (Setup Instructions [here](https://eslint.org/))
- MongoDB v4.2 (Download [here](https://docs.mongodb.com/manual/administration/install-community/))
- (optional) Docker (Download [here](https://www.docker.com/products/docker-desktop))

### Installation and Running

1. Clone the repo:

    ```
    $ git clone [REDACTED]
    ```

2. Install the packages:

    ```
    $ cd event-discovery-api
    ```

    and

    ```
    $ npm install
    ```

3. Setup the [environmental files](#environmental-files)

<hr />

#### Local

4. Download and setup MongoDB
    - ##### MacOS
        You need to have XCode and Homebrew installed
        
        Run the following:

        ```
        $ brew tap mongodb/brew
        ```

        ```
        $ brew install mongodb-community@4.2
        ```

    - #### Windows
        Download and install MongoDB v4.2 from their [web](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#install-mongodb-community-edition) (follow instructions and use the default download location)


5. Make sure MongoDB is running locally
    - #### MacOS
        Start MongoDB by running:
        
        ```
        $ brew services start mongodb-community@4.2
        ```

    - #### Windows
        Start the MongoDB App manually, or through the CLI by running:

        ```
        $ C:\Program Files\MongoDB\Server\4.2\bin\mongo.exe
        ```

        To create a database, run the following:

        ```
        $ cd C:\
        ```

        ```
        $ md "\data\db"
        ```

        Then:

        ```
        $ "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"
        ```

6. Start the local server by running the following in the repo directory:

   ```
   $ npm start
   ```

   > By default, MongoDB should run on port *27017*. The api-server itself can be accesible on port *3000*.

<hr />

#### Docker

4. Download and setup docker on your local computer

    - Create a Docker account then download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

    - Make sure you have [docker-compose](https://docs.docker.com/compose/install/) installed by running:
    
    ```
    $ docker-compose --version
    ```

5. Install the mongoDB Image on docker by running:
    
    ```
    $ docker pull mongo
    ```

6. Start the server on docker by running the following in the repo directory:

    ```
    $ npm run api-up local
    ```

   This will launch two docker container instances:
   - container running `api-server` (id: *event_discovery_api*, port: *3000*)
   - container running `mongo` image (id: *mongodb*, port: *27017*)
   
   ports will default as above unless specified otherwise in the environmental files

   Furthermore, you can run `$ npm run api-up` without specifying the "API_ENV", which will automatically connect the API to mongodb's external STAGE database. Do take caution, as this would involve dealing with a live database that might be used by others at the same time.

<hr />

7. If starting on a local empty database, you can choose to autofill the database with template data found in `/container_test/assets`. Do this by running:

    ```
    $ npm run initdb
    ```
    or 
    ```
    $ npm run docker:initdb
    ```
    if you are using docker to host the database.
    
    If correctly set up, the console output should print `# document(s) imported sucessfully`.


### Scripts

`$ npm start` - Runs the API using [nodemon](https://nodemon.io/), which allows hot-reloading (useful for development)

`$ npm run server` - Runs the API using node

`$ npm run api-up [API_ENV]` - Spins up the api in a Docker container, accepts an additional argument for API_ENV (local, stage, production).

`$ rpm run deploy [API_ENV]` - Builds and pushes a Docker container to our AWS ECR repository (details in [deployment](#deployment)), accepts an additional argument for API_ENV (stage, production)

`$ npm run test` - Spins up docker containers that are used to run integration tests for the API (located in `container-test`)

`$ npm run ci-up [CI_SERVICE]` - Spins up individual docker containers used to run integration tests for the API, accepts an additional argument for CI_SERVICE (test, api). 'api' spins up a local test API, while 'test' runs the tests on that API. As opposed to `$ npm run test`, this is useful for debugging.

`$ npm run lint` - Run ESlint on the repo to detect errors & warnings

`$ npm run lint-fix` - Run ESlint on the repo and automatically fix any errors

`$ npm run docker:build` - Build a Docker image with the tag 'event-discovery-api_backend'

`$ npm run docker:deploy [API_ENV]` - Builds and pushes the docker container to our Docker repository, acceptsan additional argument for API_ENV (local, stage, production)

`$ npm run docker:initdb` - **If running mongoDB on docker**, inserts template data into DB from file 'container_test/assets`

`$ npm run initdb` - **If running mongoDB locally**, inserts template data into DB from file 'container_test/assets`

`$ npm run docs` - Opens a local render of the API Blueprint documentation using aglio

`$ npm run docs-compile` - Manually compiles the blueprint files into apiary.apib, which is used to to render the online docs. By default, this is already done during pre-commit

> Note that the 'initdb' scripts will clear the current mongodb database before inserting the template data


## Development

Development is recommended to be done on a system where [eslint](https://eslint.org/) is installed, and using [VSCode](https://code.visualstudio.com/)

### Postman

A shared Postman workplace is available to help test the different endpoints. Contact any of the lead/backend developers to receive an invite into the workspace.

Because of the need to authenticate the source of the API calls, you will need to obtain an `Authorization` token to be used by postman. This can be done by accessing the Cognito custom login link, which will return a authentication code that can, again, be used to obtain the different Cognito tokens.

### Linting

Linters are put into place to exercise good and consistent coding style, regardless of developer. Editing lint rules and such can be done by changing the `.eslintrc.js` file, which is not recommended until approved by lead developers of the team.

Lint checks will run during a *pre-commit*, meaning that they will throw an error and abort the commit if the style checks detect an error (warnings will not prevent a commit)

> :exclamation: Further good coding practices can be addressed by reading this([REDACTED]) document on the **TEAMS** page

### Environmental Files

Multiple dotenv (`.env.*`) files are locataed in root, and each will contain different variables associated with the api environment you are able to run the application on (local, stage, production). You will need to choose one of them, but be very careful with touching **prod**. By default, the app assumes that it will run on our `stage` environment and use mongoDB test users.

Read more about user permissions and teams here([REDACTED])

### Files and Services

**Database Schemas** are located in `src/models/*.js`

Custom **Routes** are located in `src/routes.js`, and are formatted as below:
```
[ METHOD, PATH, ROUTE_GROUP/CONTROLLER, FUNCTION, AUTHENTICATE_TOKEN, PERMISSION ]
```

The corresponding **Requests** to the routes are located in  `src/controllers/*.js`, named according their assigned *ROUTE_GROUP*

Validation for endpoints are located in `src/validators`, where validation is conducted using [express-validator](https://express-validator.github.io/docs/)

Any miscellaneous functions are located in `src/utils`, where `src/utils/index.js` compiles all the functions and exports them for easy importing

### Permissions

Each route has the option to be protected by a permission string, which is used to check if a user has the required permissions to access the resource. A user's permissions are defined by the **role** they are assigned to (eg: `DEVELOPER`, `USER`). Each **role** contains a collection of string permissions that are defined in the `roles` collection in the DB. This collection should not be able to be changed by any other than developers themselves.

## Testing and Documentation

API Endpoints are designed and documented using [apiary](https://apiary.io/). Run the following script to render a local copy of the API using blueprint renderer [aglio](https://github.com/danielgtaylor/aglio)
```
npm run docs
```

In addition to Apiary, the endpoints can be tested using API testing framework [dredd](https://dredd.org/en/latest/). To add extra tests, first make sure you have docker installed. Then, make changes to the blueprints located in `api-blueprints/` by adding requests and responses (or adding the necessary endpoints). Test the new endpoints and requests by running the following script:
```
npm run test
```

Using the current API-B documentation, this script will spin up separate Docker containers for the API and database to tests the different endpoints for structure and return values. The logs can be viewed on the console, and will also be logged on the Apiary web application. Contact one of the lead developers for access to the account.

## Deployment

To update new versions of the app, run the following:
```
npm run deploy [API_ENV]
```
to create a dockerized container of the API and push it to the AWS ECR (elastic container registry) repository, which stores docker images of the API repo. In order to do this, you need to obtain the **AWS ACCESS KEY & SECRET**, place them in the AWS `config` and `credential` files (located in `~/.aws`) and login by running the following:
```
$ $(aws ecr get-login --no-include-email --region us-east-1)
```

Release versioning will follow concepts specified by Tom Preston-Werner's [semver](https://semver.org/)

### API

As of now, deployment of the API is handled by an AWS FARGATE Instance that accepts requests through a public IPv4 DNS link - the instance is running on a cluster under the [REDACTED] AWS account.

### MongoDB

The NoSQL database is hosted on MongoDB Atlas - under the *event-discovery-api* cluster.

To gain access to any of the Docker Repository, AWS or MongoDB, contact one of the lead devs.

## Contributing
Contributions are only accepted from members of the team ([REDACTED]). Instructions to start contributing are as follows:

1. Clone the remote repo into a local environment
2. Setup the repo (instructions [here](#getting-started))
3. Draft out endpoint changes/additions to the api blueprints
4. After confirmation on the altered blueprints, make the appropriate edits and additions in a new branch (with a unique title in *kebab-case*
5. Submit pull requests with a detailed commit message of what additions were made
--> Pull requests will be accepted after being reviewed and after the appropriate tests are conducted
6. After merging to master, deploy the API to **stage** by running `npm run deploy stage`
7. Only deploy to **prod** stage after stage has been tested

### Built With

* [Express](https://expressjs.com/) - Application Framework
* [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM)
* [Node](https://nodejs.org/) - Javascript Runtime Environment
