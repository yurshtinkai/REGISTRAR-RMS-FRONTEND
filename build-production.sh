#!/bin/bash

# Production Build Script for RMS Frontend
echo "🚀 Building RMS Frontend for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set production environment
export REACT_APP_API_URL=https://rms-back-bxkx.onrender.com
export REACT_APP_ENVIRONMENT=production
export NODE_ENV=production

# Verify environment variables
echo "🔍 Environment variables:"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_ENVIRONMENT: $REACT_APP_ENVIRONMENT"
echo "NODE_ENV: $NODE_ENV"

# Build the project
echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output in: ./build/"
echo "🌐 API URL: $REACT_APP_API_URL"
