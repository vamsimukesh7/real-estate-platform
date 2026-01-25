#!/bin/bash

# Start all microservices (Bash)

echo "🚀 Starting Real Estate Microservices..."

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "Starting $service_name on port $port..."
    (cd "$service_path" && npm run dev) &
    sleep 2
}

# Get the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Auth Service
start_service "Auth Service" "$BASE_DIR/services/auth-service" 5001

# Start Property Service
start_service "Property Service" "$BASE_DIR/services/property-service" 5002

# Start API Gateway
start_service "API Gateway" "$BASE_DIR/services/api-gateway" 5000

# Start Frontend
start_service "Frontend" "$BASE_DIR/frontend" 5173

echo ""
echo "✅ All services starting..."
echo ""
echo "Service URLs:"
echo "  - API Gateway:      http://localhost:5000"
echo "  - Auth Service:     http://localhost:5001"
echo "  - Property Service: http://localhost:5002"
echo "  - Frontend:         http://localhost:5173"
echo ""
echo "📖 Check MICROSERVICES_STARTUP.md for testing instructions"
echo ""
echo "To stop all services: Press Ctrl+C then run: pkill -f 'node.*dev'"
echo ""

# Wait for user interrupt
wait
