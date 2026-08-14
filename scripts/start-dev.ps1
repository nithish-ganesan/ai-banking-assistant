$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"

function Test-PortListening($port) {
  $matches = netstat -ano | Select-String ":$port\s+.*LISTENING"
  return $null -ne $matches
}

function Import-DotEnv($path) {
  if (-not (Test-Path $path)) {
    return ""
  }

  $commands = @()
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $key, $value = $line.Split("=", 2)
    $key = $key.Trim()
    $value = $value.Trim().Trim('"').Trim("'")
    if ($key -match "^[A-Za-z_][A-Za-z0-9_]*$") {
      $escaped = $value.Replace("'", "''")
      $commands += "`$env:$key='$escaped'"
    }
  }

  return ($commands -join "; ")
}

if (-not (Test-Path (Join-Path $javaHome "bin\java.exe"))) {
  throw "Java 21 was not found at $javaHome. Update `$javaHome in this script to match your local JDK path."
}

$backendEnv = Import-DotEnv (Join-Path $backendDir ".env")
$frontendEnv = Import-DotEnv (Join-Path $frontendDir ".env")

if (Test-PortListening 8080) {
  Write-Host "Backend port 8080 is already listening."
} else {
  Start-Process -FilePath powershell.exe `
    -ArgumentList @("-NoProfile", "-Command", "$backendEnv; `$env:JAVA_HOME='$javaHome'; mvn.cmd spring-boot:run") `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput (Join-Path $backendDir "dev-backend.log") `
    -RedirectStandardError (Join-Path $backendDir "dev-backend.err") `
    -WindowStyle Hidden
  Write-Host "Starting backend on http://localhost:8080"
}

if (Test-PortListening 5173) {
  Write-Host "Frontend port 5173 is already listening."
} else {
  Start-Process -FilePath powershell.exe `
    -ArgumentList @("-NoProfile", "-Command", "$frontendEnv; if (-not `$env:VITE_API_BASE_URL) { `$env:VITE_API_BASE_URL='http://localhost:8080' }; npm.cmd run dev -- --host localhost") `
    -WorkingDirectory $frontendDir `
    -RedirectStandardOutput (Join-Path $frontendDir "dev-frontend.log") `
    -RedirectStandardError (Join-Path $frontendDir "dev-frontend.err") `
    -WindowStyle Hidden
  Write-Host "Starting frontend on http://localhost:5173"
}

Write-Host "Logs: backend/dev-backend.log, frontend/dev-frontend.log"
