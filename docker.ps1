# Docker operations script for CAThography
param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    [switch]$Down,
    [switch]$Logs,
    [switch]$Help
)

function Show-Help {
    Write-Host "CAThography Docker Operations Script"
    Write-Host "Usage: .\docker.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Action <action>     Docker action (up/down/logs) [default: up]"
    Write-Host "  -Build              Build containers"
    Write-Host "  -Down               Stop and remove containers"
    Write-Host "  -Logs              Show container logs"
    Write-Host "  -Help              Show this help message"
}

if ($Help) {
    Show-Help
    exit 0
}

function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Start-DockerDesktop {
    $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopPath) {
        Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerDesktopPath
        
        # Wait for Docker to start (max 60 seconds)
        $timeout = 60
        $timer = [Diagnostics.Stopwatch]::StartNew()
        
        Write-Host "Waiting for Docker to start..." -ForegroundColor Yellow
        
        while (-not (Test-DockerRunning) -and $timer.Elapsed.TotalSeconds -lt $timeout) {
            Start-Sleep -Seconds 2
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
        
        if (Test-DockerRunning) {
            Write-Host "`nDocker is now running!" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "`nTimeout waiting for Docker to start." -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "Docker Desktop executable not found at expected location." -ForegroundColor Red
        Write-Host "Please start Docker Desktop manually and try again." -ForegroundColor Red
        return $false
    }
}

# Check if Docker is running
if (-not (Test-DockerRunning)) {
    Write-Host "Docker is not running." -ForegroundColor Red
    
    $startDocker = Read-Host "Do you want to start Docker Desktop now? (Y/N)"
    if ($startDocker -eq "Y" -or $startDocker -eq "y") {
        $started = Start-DockerDesktop
        if (-not $started) {
            Write-Error "Docker is not running. Please start Docker Desktop."
            exit 1
        }
    }
    else {
        Write-Error "Docker is not running. Please start Docker Desktop."
        exit 1
    }
}

# Execute Docker commands based on the provided action
switch ($Action.ToLower()) {
    "up" {
        if ($Build) {
            Write-Host "Running docker-compose up with build..." -ForegroundColor Cyan
            docker-compose up -d --build
        } 
        else {
            Write-Host "Running docker-compose up..." -ForegroundColor Cyan
            docker-compose up -d
        }
    }
    "down" {
        Write-Host "Running docker-compose down..." -ForegroundColor Cyan
        docker-compose down
    }
    "logs" {
        Write-Host "Showing docker-compose logs..." -ForegroundColor Cyan
        docker-compose logs -f
    }
    "restart" {
        Write-Host "Restarting docker-compose services..." -ForegroundColor Cyan
        docker-compose restart
    }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host "Supported actions: up, down, logs, restart" -ForegroundColor Yellow
        exit 1
    }
}

exit 0