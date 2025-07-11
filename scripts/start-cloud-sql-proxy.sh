#!/bin/bash

# Start Cloud SQL Proxy script

echo "Starting Cloud SQL Proxy..."

# Check if cloud-sql-proxy exists
if [ ! -f "./cloud-sql-proxy" ]; then
    echo "Error: cloud-sql-proxy not found. Please run the setup script first."
    exit 1
fi

# Start Cloud SQL Proxy
./cloud-sql-proxy \
    --credentials-file=./apps/api/google-cloud-key.json \
    --address=0.0.0.0 \
    --port=5432 \
    real-estate-dx:asia-northeast1:real-estate-db

# Note: The proxy will run in the foreground.
# To run in background, add & at the end of the command