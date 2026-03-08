param(
    [string]$AppRepoPath = "",
    [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$serverRepo = $repoRoot
$memoryDir = Join-Path $serverRepo "docs\project-memory"

if ([string]::IsNullOrWhiteSpace($AppRepoPath)) {
    $AppRepoPath = Join-Path (Split-Path $serverRepo -Parent) "gameland-app"
}

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $serverRepo "backups\project-memory"
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $OutputRoot $timestamp
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Copy-Item -Path $memoryDir -Destination $backupDir -Recurse -Force

function Get-GitOutput {
    param(
        [string]$Repo,
        [string[]]$GitArgs
    )

    if (-not (Test-Path $Repo)) {
        return @("[info] repository not found: $Repo")
    }

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
$appStatus = Get-GitOutput -Repo $AppRepoPath -GitArgs @("status", "--short")
$appLog = Get-GitOutput -Repo $AppRepoPath -GitArgs @("log", "--oneline", "-20")

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
