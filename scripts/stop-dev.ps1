$ErrorActionPreference = "SilentlyContinue"

$ports = @(8080, 5173)
$pids = foreach ($port in $ports) {
  netstat -ano | Select-String ":$port\s+.*LISTENING" | ForEach-Object {
    ($_ -split "\s+")[-1]
  }
}

$pids | Sort-Object -Unique | ForEach-Object {
  if ($_ -match "^\d+$") {
    Stop-Process -Id ([int]$_) -Force
    Write-Host "Stopped process $_"
  }
}
