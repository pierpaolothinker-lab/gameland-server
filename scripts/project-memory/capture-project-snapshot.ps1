param(
    [string]$OutputFile = "C:\Users\ingpi\Documents\code\gameland-server\docs\project-memory\snapshot.json"
)

$ErrorActionPreference = "Stop"

$serverRepo = "C:\Users\ingpi\Documents\code\gameland-server"
$appRepo = "C:\Users\ingpi\Documents\code\gameland-app"

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

$payload = [ordered]@{
    timestamp = (Get-Date).ToString("s")
    server = [ordered]@{
        branch = Get-GitOutput -Repo $serverRepo -GitArgs @("branch", "--show-current")
        status = Get-GitOutput -Repo $serverRepo -GitArgs @("status", "--short")
        last_commits = Get-GitOutput -Repo $serverRepo -GitArgs @("log", "--oneline", "-10")
    }
    app = [ordered]@{
        branch = Get-GitOutput -Repo $appRepo -GitArgs @("branch", "--show-current")
        status = Get-GitOutput -Repo $appRepo -GitArgs @("status", "--short")
        last_commits = Get-GitOutput -Repo $appRepo -GitArgs @("log", "--oneline", "-10")
    }
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -Path $OutputFile -Encoding UTF8
Write-Output "Snapshot written to $OutputFile"
