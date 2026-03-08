param(
    [string]$OutputRoot = "C:\Users\ingpi\Documents\code\gameland-server\backups\project-memory"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $OutputRoot $timestamp
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$serverRepo = "C:\Users\ingpi\Documents\code\gameland-server"
$appRepo = "C:\Users\ingpi\Documents\code\gameland-app"
$memoryDir = Join-Path $serverRepo "docs\project-memory"

Copy-Item -Path $memoryDir -Destination $backupDir -Recurse -Force

function Get-GitOutput {
    param(
        [string]$Repo,
        [string[]]$GitArgs
    )

    try {
        $raw = & git -C $Repo @GitArgs 2>&1
        $output = @($raw | ForEach-Object { $_.ToString() })

        if ($LASTEXITCODE -ne 0) {
            return @("[git-error] git $($GitArgs -join ' ')") + $output
        }

        return $output
    }
    catch {
        return @("[git-exception] git $($GitArgs -join ' ')", $_.Exception.Message)
    }
}

$serverStatus = Get-GitOutput -Repo $serverRepo -GitArgs @("status", "--short")
$serverLog = Get-GitOutput -Repo $serverRepo -GitArgs @("log", "--oneline", "-20")
$appStatus = Get-GitOutput -Repo $appRepo -GitArgs @("status", "--short")
$appLog = Get-GitOutput -Repo $appRepo -GitArgs @("log", "--oneline", "-20")

$serverStatus | Set-Content -Path (Join-Path $backupDir "server-git-status.txt") -Encoding UTF8
$serverLog | Set-Content -Path (Join-Path $backupDir "server-git-log.txt") -Encoding UTF8
$appStatus | Set-Content -Path (Join-Path $backupDir "app-git-status.txt") -Encoding UTF8
$appLog | Set-Content -Path (Join-Path $backupDir "app-git-log.txt") -Encoding UTF8

# Retention: keep last 30 backups
$folders = Get-ChildItem -Path $OutputRoot -Directory | Sort-Object Name -Descending
$toRemove = $folders | Select-Object -Skip 30
foreach ($folder in $toRemove) {
    Remove-Item -Path $folder.FullName -Recurse -Force
}

Write-Output "Backup completed: $backupDir"
