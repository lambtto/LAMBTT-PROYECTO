FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
