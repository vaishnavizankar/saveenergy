# Optimized for Node 22 and Low-RAM environments
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Build stage 
FROM base AS build-stage

# Receive build-time environment variables for Vite
ARG VITE_API_BASE_URL
ARG VITE_AWS_REGION
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_DOMAIN

# Pass them into the environment so 'npm run build' can use them
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AWS_REGION=$VITE_AWS_REGION
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_DOMAIN=$VITE_COGNITO_DOMAIN

COPY . .
# Run the vite build to create static assets
RUN npm run build

# Production runtime stage (Ultralight)
FROM node:22-alpine AS production
WORKDIR /app
# Install only the static server
RUN npm install -g serve
# Copy the compiled production assets from the build stage
COPY --from=build-stage /app/dist /app/dist
EXPOSE 3000
# Serve the app in static mode
CMD ["serve", "-s", "dist", "-l", "3000"]
