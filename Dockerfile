# Use node, alpine allows for compressed container size
FROM node:12-alpine

# Assign metadata labels
LABEL MAINTAINER ad2969 <clarenceadrian@alumni.ubc.ca>
LABEL ORGANIZATION [REDACTED]

# Set the working directory in the container and 'cd' into it
WORKDIR /app

# Copy and install packages
COPY package.json ./
RUN npm install --silent

# Copy the remaining files from root
COPY . .

# Expose port 3000 in the container
EXPOSE 3000

# Assign the command to run when starting the container
CMD ["node", "index.js"]
