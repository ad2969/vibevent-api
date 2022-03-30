FROM node:12-alpine

WORKDIR /test

COPY package.json ./

RUN npm install --silent

RUN npm install -g dredd --silent

COPY . .

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait

RUN chmod +x /wait

RUN chmod +x ./compile_blueprints.sh

RUN chmod +x ./run_tests.sh

CMD /wait && npm run start

# CMD tail -f /dev/null