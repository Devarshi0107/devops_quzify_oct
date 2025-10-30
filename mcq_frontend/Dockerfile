# ---------------------
# 1️⃣ BUILD STAGE
# ---------------------
FROM node:18-alpine AS builder 
# FROM node:18 AS builder//gettin er on 24aug


# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy rest of the frontend source code
COPY . .

# Build the app
RUN npm run build

# ---------------------
# 2️⃣ PRODUCTION STAGE
# ---------------------
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 in container
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]