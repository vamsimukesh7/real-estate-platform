# Start all microservices (PowerShell)

Write-Host "🚀 Starting Real Estate Microservices..." -ForegroundColor Green

# Function to start a service in a new window
function Start-Service {
    param (
        [string]$ServiceName,
        [string]$Path,
        [int]$Port
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🔧 $ServiceName' -ForegroundColor Yellow; npm run dev"
}

# Get the base directory
$BaseDir = $PSScriptRoot

# Start Auth Service
Start-Service -ServiceName "Auth Service" -Path "$BaseDir\services\auth-service" -Port 5001
Start-Sleep -Seconds 2

# Start Property Service
Start-Service -ServiceName "Property Service" -Path "$BaseDir\services\property-service" -Port 5002
Start-Sleep -Seconds 2

# Start API Gateway
Start-Service -ServiceName "API Gateway" -Path "$BaseDir\services\api-gateway" -Port 5000
Start-Sleep -Seconds 2

# Start Frontend
Start-Service -ServiceName "Frontend" -Path "$BaseDir\frontend" -Port 5173

Write-Host ""
Write-Host "✅ All services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  - API Gateway:      http://localhost:5000" -ForegroundColor White
Write-Host "  - Auth Service:     http://localhost:5001" -ForegroundColor White
Write-Host "  - Property Service: http://localhost:5002" -ForegroundColor White
Write-Host "  - Frontend:         http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📖 Check MICROSERVICES_STARTUP.md for testing instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop services: Close each PowerShell window or press Ctrl+C" -ForegroundColor Yellow
