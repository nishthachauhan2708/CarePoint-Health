#!/usr/bin/env bash
# ==============================================================================
# CareHealth Point – Security Scan Script (Bandit SAST & Trivy Container Scan)
# Course: DevOps & Automation Lab (ENSP461)
# ==============================================================================
set -e

echo "=========================================================="
echo " 1. Running Bandit Static Application Security Testing (SAST)"
echo "=========================================================="
cd backend
python3 -m pip install bandit --quiet || true
python3 -m bandit -r app/ -ll -i || true
cd ..

echo ""
echo "=========================================================="
echo " 2. Scanning Container Images with Trivy"
echo "=========================================================="
if command -v trivy &> /dev/null; then
    echo "Scanning Backend Image..."
    trivy image --severity HIGH,CRITICAL --exit-code 0 carehealthpoint-backend:latest
    echo "Scanning Frontend Image..."
    trivy image --severity HIGH,CRITICAL --exit-code 0 carehealthpoint-frontend:latest
else
    echo "Trivy CLI not in PATH. Running via official Docker container..."
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image carehealthpoint-backend:latest || true
fi

echo ""
echo "=========================================================="
echo " [DONE] Security scanning complete."
echo "=========================================================="
