param(
    [string]$EnvFile = (Join-Path $PSScriptRoot '..\api\.env'),
    [string]$OutputFile = (Join-Path $PSScriptRoot 'exports\eximhub_db.sql')
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

$envMap = Get-EnvMap -Path $EnvFile
$dbHost = if ($envMap.ContainsKey('DB_HOST')) { $envMap['DB_HOST'] } else { '127.0.0.1' }
$dbUser = if ($envMap.ContainsKey('DB_USER')) { $envMap['DB_USER'] } else { 'root' }
$dbPass = if ($envMap.ContainsKey('DB_PASS')) { $envMap['DB_PASS'] } else { '' }
$dbName = if ($envMap.ContainsKey('DB_NAME')) { $envMap['DB_NAME'] } else { 'eximhub_db' }

$mysqldumpPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe'

if (-not (Test-Path $mysqldumpPath)) {
    throw "mysqldump not found at $mysqldumpPath"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputFile) | Out-Null

$args = @(
    "--host=$dbHost"
    "--user=$dbUser"
    "--single-transaction"
    "--skip-lock-tables"
    "--routines"
    "--triggers"
    "--default-character-set=utf8mb4"
    "--databases"
    $dbName
)

if ($dbPass -ne '') {
    $args = @("--password=$dbPass") + $args
}

$header = @(
    "-- EximHub database snapshot"
    "-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
    "-- Source env: $EnvFile"
    ""
)

Set-Content -Path $OutputFile -Value $header -Encoding utf8

& $mysqldumpPath @args | Add-Content -Path $OutputFile -Encoding utf8

Write-Host "Database export written to $OutputFile" -ForegroundColor Green
