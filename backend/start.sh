#!/bin/sh

# Change to app directory
cd /app

# Create data directory if it doesn't exist
mkdir -p /app/data

# Initialize database if it doesn't exist
if [ ! -f "/app/data/dev.db" ]; then
  echo "Initializing database..."
  npx prisma db push --skip-generate
fi

# Start the application
npm start
