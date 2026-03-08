param(
    [string]$TaskName = "GamelandProjectMemoryBackup",
    [string]$Schedule = "HOURLY",
    [int]$Hours = 6
)

$scriptPath = Join-Path $PSScriptRoot "backup-project-memory.ps1"
$tr = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"$scriptPath\""

schtasks /Create /TN $TaskName /TR $tr /SC $Schedule /MO $Hours /F | Out-Null
Write-Output "Scheduled task registered: $TaskName every $Hours hour(s)"
