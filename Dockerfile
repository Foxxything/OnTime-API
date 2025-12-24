# Use a small Node LTS base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files (only if your dist build needs runtime deps)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built app
COPY dist ./dist

# Copy env file (if you need it inside container)
COPY .env .env

# Expose the port your app listens on
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]