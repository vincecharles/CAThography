# Build script for CAThography backend
param(
    [string]$Environment = "development",
    [switch]$Clean,
    [switch]$Test,
    [switch]$Lint,
    [switch]$Build,
    [switch]$Help
)

function Show-Help {
    Write-Host "CAThography Backend Build Script"
    Write-Host "Usage: .\build.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Environment <env>    Set environment (development/production) [default: development]"
    Write-Host "  -Clean               Clean build artifacts"
    Write-Host "  -Test                Run tests"
    Write-Host "  -Lint               Run linting"
    Write-Host "  -Build              Build the application"
    Write-Host "  -Help               Show this help message"
}

if ($Help) {
    Show-Help
    exit 0
}

# Set environment variables
$env:NODE_ENV = $Environment

# Clean build artifacts
if ($Clean) {
    Write-Host "Cleaning build artifacts..."
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
    }
    if (Test-Path "coverage") {
        Remove-Item -Recurse -Force "coverage"
    }
    Write-Host "Clean complete."
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Run linting
if ($Lint) {
    Write-Host "Running linting..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Linting failed!"
        exit 1
    }
}

# Run tests
if ($Test) {
    Write-Host "Running tests..."
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed!"
        exit 1
    }
}

# Build application
if ($Build) {
    Write-Host "Building application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit 1
    }
}

Write-Host "Build process completed successfully!" 