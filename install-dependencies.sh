#!/bin/bash

# Install dependencies for all microservices (Bash)

echo "📦 Installing dependencies for all services..."
echo ""

services=(
    "services/auth-service:Auth Service"
    "services/property-service:Property Service"
    "services/api-gateway:API Gateway"
)

for service in "${services[@]}"; do
    IFS=':' read -r path name <<< "$service"
    echo "Installing $name..."
    cd "$path"
    npm install
    cd ../..
    echo "✅ $name dependencies installed"
    echo ""
done

echo "✨ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running"
echo "2. Run: ./start-services.sh"
echo "3. Open browser: http://localhost:5173"
echo ""
