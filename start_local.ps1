param(
    [switch]$SkipWeb = $true,
    [switch]$SkipApi = $false,
    [switch]$SkipMySql = $false,
    [switch]$StartAdmin = $false
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $root 'api'
$webDir = Join-Path $root 'web'
$adminDir = Join-Path $root 'admin_panel'
$mysqlDataDir = 'D:\eximhub\mysql_data'
$mysqldPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
$mysqlAdminPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqladmin.exe'

function Test-MySqlAlive {
    try {
        & $mysqlAdminPath -h 127.0.0.1 -u root ping | Out-Null
        return $true
    } catch {
        return $false
    }
}

Write-Host 'Starting EximHub local stack...' -ForegroundColor Cyan

if (-not $SkipMySql) {
    if (-not (Test-MySqlAlive)) {
        Write-Host 'Starting MySQL...' -ForegroundColor Yellow
        Start-Process -FilePath $mysqldPath -ArgumentList "--console --datadir=$mysqlDataDir --port=3306 --bind-address=127.0.0.1" | Out-Null
        Start-Sleep -Seconds 5
    }

    if (-not (Test-MySqlAlive)) {
        throw 'MySQL did not start successfully.'
    }

    Write-Host 'MySQL is running.' -ForegroundColor Green
}

Write-Host 'Ensuring database schema...' -ForegroundColor Yellow
Push-Location $apiDir
try {
    npm.cmd run setup-db
} finally {
    Pop-Location
}

if (-not $SkipApi) {
    Write-Host 'Starting API server...' -ForegroundColor Yellow
    Start-Process -FilePath node.exe -ArgumentList 'server.js' -WorkingDirectory $apiDir | Out-Null
    Write-Host 'API launch requested.' -ForegroundColor Green
}

if (-not $SkipWeb) {
    Write-Host 'Starting web app...' -ForegroundColor Yellow
    Start-Process -FilePath npm.cmd -ArgumentList 'run dev' -WorkingDirectory $webDir | Out-Null
    Write-Host 'Web app launch requested.' -ForegroundColor Green
}

if ($StartAdmin) {
    Write-Host 'Starting admin panel...' -ForegroundColor Yellow
    Start-Process -FilePath npm.cmd -ArgumentList 'run dev' -WorkingDirectory $adminDir | Out-Null
    Write-Host 'Admin panel launch requested.' -ForegroundColor Green
}

Write-Host 'EximHub local startup completed.' -ForegroundColor Cyan
