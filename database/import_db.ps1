param(
    [string]$EnvFile = (Join-Path $PSScriptRoot '..\api\.env'),
    [string]$InputFile = (Join-Path $PSScriptRoot 'exports\eximhub_db.sql')
)

$ErrorActionPreference = 'Stop'

function Get-EnvMap {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Env file not found: $Path"
    }

    $map = @{}
    foreach ($line in Get-Content $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }

        $parts = $trimmed -split '=', 2
        if ($parts.Count -eq 2) {
            $map[$parts[0].Trim()] = $parts[1].Trim()
        }
    }

    return $map
}

if (-not (Test-Path $InputFile)) {
    throw "SQL snapshot not found: $InputFile"
}

$envMap = Get-EnvMap -Path $EnvFile
$dbHost = if ($envMap.ContainsKey('DB_HOST')) { $envMap['DB_HOST'] } else { '127.0.0.1' }
$dbUser = if ($envMap.ContainsKey('DB_USER')) { $envMap['DB_USER'] } else { 'root' }
$dbPass = if ($envMap.ContainsKey('DB_PASS')) { $envMap['DB_PASS'] } else { '' }

$mysqlPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe'

if (-not (Test-Path $mysqlPath)) {
    throw "mysql client not found at $mysqlPath"
}

$args = @(
    "--host=$dbHost"
    "--user=$dbUser"
)

if ($dbPass -ne '') {
    $args = @("--password=$dbPass") + $args
}

Get-Content -Path $InputFile -Raw | & $mysqlPath @args

Write-Host "Database import completed from $InputFile" -ForegroundColor Green
