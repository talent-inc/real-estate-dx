#!/bin/bash

# Test Google Cloud connections

echo "=== Google Cloud Connection Test ==="
echo ""

# Test 1: Check if we're authenticated
echo "1. Checking Google Cloud authentication..."
/home/mtside01/google-cloud-sdk/bin/gcloud auth list
echo ""

# Test 2: Check current project
echo "2. Current project:"
/home/mtside01/google-cloud-sdk/bin/gcloud config get-value project
echo ""

# Test 3: Check Cloud SQL instance
echo "3. Cloud SQL instance status:"
/home/mtside01/google-cloud-sdk/bin/gcloud sql instances describe real-estate-db --format="table(name,state,ipAddresses[0].ipAddress)"
echo ""

# Test 4: Check Storage buckets
echo "4. Storage buckets:"
/home/mtside01/google-cloud-sdk/bin/gcloud storage buckets list --format="table(name,location,storageClass)"
echo ""

# Test 5: Check service account
echo "5. Service account permissions:"
/home/mtside01/google-cloud-sdk/bin/gcloud projects get-iam-policy real-estate-dx \
  --flatten="bindings[].members" \
  --filter="bindings.members:real-estate-app@" \
  --format="table(bindings.role)"
echo ""

echo "=== Test Complete ==="