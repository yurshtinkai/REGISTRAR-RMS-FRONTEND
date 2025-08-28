#!/bin/bash

# Production Build Script for RMS Frontend
echo "🚀 Building RMS Frontend for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set production environment
export REACT_APP_API_URL=https://rms-back-ceuu.onrender.com
export REACT_APP_ENVIRONMENT=production

# Build the project
echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output in: ./build/"
echo "🌐 API URL: $REACT_APP_API_URL"
