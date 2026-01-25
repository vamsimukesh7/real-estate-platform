# Install dependencies for all microservices (PowerShell)

Write-Host "📦 Installing dependencies for all services..." -ForegroundColor Green
Write-Host ""

$services = @(
    @{Name = "Auth Service"; Path = "services\auth-service" },
    @{Name = "Property Service"; Path = "services\property-service" },
    @{Name = "API Gateway"; Path = "services\api-gateway" }
)

foreach ($service in $services) {
    Write-Host "Installing $($service.Name)..." -ForegroundColor Cyan
    Set-Location $service.Path
    npm install
    Set-Location ..\..
    Write-Host "✅ $($service.Name) dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "✨ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Ensure MongoDB is running"
Write-Host "2. Run: .\start-services.ps1"
Write-Host "3. Open browser: http://localhost:5173"
Write-Host ""
