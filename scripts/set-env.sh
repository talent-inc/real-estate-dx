#!/bin/bash
# Script to set environment variables for development

# Load from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found"
    exit 1
fi

# Display loaded variables (without showing sensitive values)
echo "📋 Loaded environment variables:"
echo "  - DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "  - GOOGLE_API_KEY: ${GOOGLE_API_KEY:0:10}..."
echo "  - GEMINI_API_KEY: ${GEMINI_API_KEY:0:10}..."
echo "  - USE_DEV_DATA: $USE_DEV_DATA"
echo "  - PORT: $PORT"