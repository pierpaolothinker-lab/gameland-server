param(
    [string]$AppRepoPath = "",
    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$serverRepo = $repoRoot

if ([string]::IsNullOrWhiteSpace($AppRepoPath)) {
    $AppRepoPath = Join-Path (Split-Path $serverRepo -Parent) "gameland-app"
}

if ([string]::IsNullOrWhiteSpace($OutputFile)) {
    $OutputFile = Join-Path $serverRepo "docs\project-memory\snapshot.json"
}

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

$payload = [ordered]@{
    timestamp = (Get-Date).ToString("s")
    server = [ordered]@{
        repo = $serverRepo
        branch = Get-GitOutput -Repo $serverRepo -GitArgs @("branch", "--show-current")
        status = Get-GitOutput -Repo $serverRepo -GitArgs @("status", "--short")
        last_commits = Get-GitOutput -Repo $serverRepo -GitArgs @("log", "--oneline", "-10")
    }
    app = [ordered]@{
        repo = $AppRepoPath
        branch = Get-GitOutput -Repo $AppRepoPath -GitArgs @("branch", "--show-current")
        status = Get-GitOutput -Repo $AppRepoPath -GitArgs @("status", "--short")
        last_commits = Get-GitOutput -Repo $AppRepoPath -GitArgs @("log", "--oneline", "-10")
    }
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -Path $OutputFile -Encoding UTF8
Write-Output "Snapshot written to $OutputFile"
