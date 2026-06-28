#!/bin/bash
set -e

echo "Starting ValuHire deployment..."

# Ensure Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Pull latest code if this is a git repo
if [ -d ".git" ]; then
    echo "Pulling latest changes from git..."
    git pull origin main || echo "Git pull failed or not on main branch. Continuing anyway..."
fi

# Ensure .env exists
if [ ! -f .env ]; then
    echo "WARNING: .env file not found. Copying .env.example to .env..."
    cp .env.example .env
    echo "Please update .env with your actual production values and run this script again."
    exit 1
fi

echo "Pre-pulling language runner images to prevent execution timeouts..."
docker pull gcc:14
docker pull python:3.12-alpine
docker pull node:22-alpine
docker pull eclipse-temurin:22

echo "Building and starting Docker containers..."
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d --build
else
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d --build
fi

echo "Deployment successful!"
echo "Your backend is now running."
echo "API is exposed on port 4000."
