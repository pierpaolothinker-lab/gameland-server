param(
    [Parameter(Mandatory = $true)]
    [string]$Summary,
    [string]$Repo = "server",
    [string]$Branch = "",
    [string]$Task = "manual-memory-update",
    [string]$Validation = "not-run",
    [string]$Risks = "",
    [string]$Decision = "",
    [string]$RoadmapNote = "",
    [switch]$RunSnapshot,
    [switch]$RunBackup
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$memoryDir = Join-Path $repoRoot "docs\project-memory"
$journalPath = Join-Path $memoryDir "journal.md"
$implementationPath = Join-Path $memoryDir "implementation-log.md"
$decisionsPath = Join-Path $memoryDir "decisions.md"
$roadmapPath = Join-Path $memoryDir "roadmap-status.md"

if (-not (Test-Path $journalPath)) { throw "journal.md not found at $journalPath" }
if (-not (Test-Path $implementationPath)) { throw "implementation-log.md not found at $implementationPath" }

$date = Get-Date -Format "yyyy-MM-dd"
$dateTime = Get-Date -Format "yyyy-MM-dd HH:mm"

if ([string]::IsNullOrWhiteSpace($Branch)) {
    try {
        $Branch = (& git -C $repoRoot branch --show-current).Trim()
    }
    catch {
        $Branch = "unknown"
    }
}

$journalBlock = @"

## $date
- [$dateTime] $Summary
- Repo: $Repo
- Branch: $Branch
"@

if (-not [string]::IsNullOrWhiteSpace($Risks)) {
    $journalBlock += "- Risks/Notes: $Risks`n"
}

Add-Content -Path $journalPath -Value $journalBlock

$implBlock = @"

## $dateTime - $Task
- Repo: $Repo
- Branch: $Branch
- Summary: $Summary
- Validation: $Validation
"@

if (-not [string]::IsNullOrWhiteSpace($Risks)) {
    $implBlock += "- Risks/Notes: $Risks`n"
}

Add-Content -Path $implementationPath -Value $implBlock

if (-not [string]::IsNullOrWhiteSpace($Decision) -and (Test-Path $decisionsPath)) {
    $decisionsRaw = Get-Content $decisionsPath -Raw
    $matches = [regex]::Matches($decisionsRaw, "DEC-(\d+)")
    $nextNumber = 1

    if ($matches.Count -gt 0) {
        $max = ($matches | ForEach-Object { [int]$_.Groups[1].Value } | Measure-Object -Maximum).Maximum
        $nextNumber = $max + 1
    }

    $decId = "DEC-{0:D3}" -f $nextNumber
    $decisionBlock = @"

## $decId - $Task
- Date: $date
- Decision: $Decision
- Rationale: added via update-memory command
- Impact: to be refined in follow-up if needed
"@
    Add-Content -Path $decisionsPath -Value $decisionBlock
}

if (-not [string]::IsNullOrWhiteSpace($RoadmapNote) -and (Test-Path $roadmapPath)) {
    Add-Content -Path $roadmapPath -Value "`n- [$dateTime] Update note: $RoadmapNote"
}

if ($RunSnapshot) {
    & (Join-Path $PSScriptRoot "capture-project-snapshot.ps1")
}

if ($RunBackup) {
    & (Join-Path $PSScriptRoot "backup-project-memory.ps1")
}

Write-Output "Project memory updated at $dateTime"
