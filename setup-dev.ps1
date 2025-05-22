# Development environment setup script for CAThography
param(
    [switch]$Force,
    [switch]$Help
)

function Show-Help {
    Write-Host "CAThography Development Environment Setup"
    Write-Host "Usage: .\setup-dev.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Force    Force reinstallation of dependencies"
    Write-Host "  -Help     Show this help message"
}

if ($Help) {
    Show-Help
    exit 0
}

# Check for required tools
function Test-Command {
    param($Command)
    return [bool](Get-Command -Name $Command -ErrorAction SilentlyContinue)
}

$requiredTools = @(
    @{Name = "Node.js"; Command = "node"; Version = "v18.0.0"},
    @{Name = "npm"; Command = "npm"; Version = "8.0.0"},
    @{Name = "Docker"; Command = "docker"; Version = "20.0.0"},
    @{Name = "Git"; Command = "git"; Version = "2.0.0"}
)

Write-Host "Checking required tools..."
foreach ($tool in $requiredTools) {
    if (-not (Test-Command $tool.Command)) {
        Write-Error "$($tool.Name) is not installed. Please install it first."
        exit 1
    }
}

# Create necessary directories
$directories = @(
    "backend/logs",
    "backend/data",
    "frontend/dist",
    "frontend/public"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Install dependencies
Write-Host "Installing dependencies..."

# Backend
Push-Location backend
try {
    if ($Force) {
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
        Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json
    }
    npm install
}
finally {
    Pop-Location
}

# Frontend
Push-Location frontend
try {
    if ($Force) {
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
        Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json
    }
    npm install
}
finally {
    Pop-Location
}

# Create .env files if they don't exist
$envFiles = @{
    "backend/.env" = @"
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cathography
JWT_SECRET=your-secret-key
"@
    "frontend/.env" = @"
VITE_API_URL=http://localhost:3000
"@
}

foreach ($envFile in $envFiles.GetEnumerator()) {
    if (-not (Test-Path $envFile.Key)) {
        Set-Content -Path $envFile.Key -Value $envFile.Value
        Write-Host "Created $($envFile.Key)"
    }
}

Write-Host "Development environment setup completed successfully!" -ForegroundColor Green 