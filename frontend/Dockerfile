# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine as production-stage

WORKDIR /app

RUN npm install -g serve

COPY --from=build-stage /app/dist /app/dist

# Use serve to host the production-ready build
CMD ["serve", "-s", "dist", "-l", "3000"]
