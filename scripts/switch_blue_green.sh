#!/usr/bin/env bash
# ==============================================================================
# CareHealth Point – Blue/Green Zero-Downtime Traffic Router
# Course: DevOps & Automation Lab (ENSP461)
# Usage: ./switch_blue_green.sh [green|blue]
# ==============================================================================

set -e

NAMESPACE="carehealth"
TARGET_VERSION=${1:-"green"}

echo "=========================================================="
echo " CareHealth Point – Blue/Green Traffic Switching Engine"
echo " Target Version: ${TARGET_VERSION^^}"
echo "=========================================================="

if [[ "$TARGET_VERSION" != "green" && "$TARGET_VERSION" != "blue" ]]; then
    echo "ERROR: Target must be either 'green' or 'blue'."
    echo "Usage: $0 [green|blue]"
    exit 1
fi

echo "--> Step 1: Checking status of ${TARGET_VERSION} deployment pods..."
kubectl rollout status deployment/carehealth-backend-${TARGET_VERSION} -n ${NAMESPACE} --timeout=60s

echo "--> Step 2: Routing live traffic to '${TARGET_VERSION}'..."
kubectl patch service carehealth-backend-active-service \
  -n ${NAMESPACE} \
  -p '{"spec":{"selector":{"version":"'${TARGET_VERSION}'"}}}'

echo "--> Step 3: Verifying active endpoints..."
kubectl get endpoints carehealth-backend-active-service -n ${NAMESPACE}

echo "=========================================================="
echo " SUCCESS: Traffic successfully switched to ${TARGET_VERSION^^} environment!"
echo " In case of rollback, execute:"
if [[ "$TARGET_VERSION" == "green" ]]; then
    echo "   ./switch_blue_green.sh blue"
else
    echo "   ./switch_blue_green.sh green"
fi
echo "=========================================================="
