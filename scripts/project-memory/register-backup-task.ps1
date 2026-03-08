param(
    [string]$TaskName = "GamelandProjectMemoryBackup",
    [string]$Schedule = "HOURLY",
    [int]$Hours = 6
)

$scriptPath = "C:\Users\ingpi\Documents\code\gameland-server\scripts\project-memory\backup-project-memory.ps1"
$tr = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"$scriptPath\""

# Create or overwrite scheduled task
schtasks /Create /TN $TaskName /TR $tr /SC $Schedule /MO $Hours /F | Out-Null
Write-Output "Scheduled task registered: $TaskName every $Hours hour(s)"
