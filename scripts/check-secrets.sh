#!/bin/bash

# Script to check for exposed secrets in the codebase

echo "🔍 Checking for exposed secrets..."

# Check for Google API Keys pattern
echo "Checking for Google API Keys..."
if grep -r "AIza[0-9A-Za-z_-]\{35\}" --exclude-dir=.git --exclude-dir=node_modules --exclude="*.log" .; then
    echo "❌ WARNING: Possible Google API Key found!"
    exit 1
fi

# Check for other common secret patterns
echo "Checking for other secrets..."
patterns=(
    "-----BEGIN RSA PRIVATE KEY-----"
    "-----BEGIN PRIVATE KEY-----"
    "client_secret"
    "api_key.*=.*['\"][^'\"]*['\"]"
    "password.*=.*['\"][^'\"]*['\"]"
)

for pattern in "${patterns[@]}"; do
    if grep -r "$pattern" --exclude-dir=.git --exclude-dir=node_modules --exclude="*.log" --exclude=.env.example .; then
        echo "❌ WARNING: Possible secret found matching pattern: $pattern"
        exit 1
    fi
done

echo "✅ No secrets found in codebase!"