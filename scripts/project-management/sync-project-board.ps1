param(
    [Parameter(Mandatory = $true)]
    [string]$PayloadPath,
    [switch]$DryRun,
    [switch]$DisableUpsertByTitle
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $PayloadPath)) {
    throw "Payload file not found: $PayloadPath"
}

$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    throw 'GITHUB_TOKEN is required'
}

$payload = Get-Content $PayloadPath -Raw | ConvertFrom-Json

if (-not $payload.projectId) {
    throw 'projectId is required in payload'
}

if (-not $payload.statusFieldId) {
    throw 'statusFieldId is required in payload'
}

if (-not $payload.statusOptions) {
    throw 'statusOptions map is required in payload'
}

function Get-StatusOptionId {
    param(
        [object]$StatusOptions,
        [string]$Status
    )

    if (-not $Status) {
        return $null
    }

    foreach ($prop in $StatusOptions.PSObject.Properties) {
        if ($prop.Name -eq $Status) {
            return [string]$prop.Value
        }
    }

    return $null
}

function Invoke-GithubGraphQL {
    param(
        [string]$Query,
        [hashtable]$Variables,
        [string]$OperationName = 'unnamed'
    )

    $body = @{
        query = $Query
        variables = $Variables
    } | ConvertTo-Json -Depth 15

    if ($DryRun) {
        Write-Output "[DRY-RUN][$OperationName]"
        Write-Output $body
        return @{}
    }

    $headers = @{
        Authorization = "Bearer $token"
        'Content-Type' = 'application/json'
        'User-Agent' = 'gameland-project-sync'
    }

    $response = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/graphql' -Headers $headers -Body $body

    if ($response.errors) {
        $errorJson = $response.errors | ConvertTo-Json -Depth 20
        throw "GraphQL request failed in operation '$OperationName': $errorJson"
    }

    return $response.data
}

$createDraftItemMutation = @"
mutation(`$projectId: ID!, `$title: String!, `$body: String) {
  addProjectV2DraftIssue(input: {
    projectId: `$projectId,
    title: `$title,
    body: `$body
  }) {
    projectItem {
      id
    }
  }
}
"@

$updateFieldMutation = @"
mutation(`$projectId: ID!, `$itemId: ID!, `$fieldId: ID!, `$optionId: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: `$projectId,
    itemId: `$itemId,
    fieldId: `$fieldId,
    value: { singleSelectOptionId: `$optionId }
  }) {
    projectV2Item {
      id
    }
  }
}
"@

$updateItemMutation = @"
mutation(`$projectId: ID!, `$itemId: ID!, `$title: String!, `$body: String!) {
  updateProjectV2DraftIssue(input: {
    projectId: `$projectId,
    itemId: `$itemId,
    title: `$title,
    body: `$body
  }) {
    draftIssue {
      title
    }
  }
}
"@

$listProjectItemsQuery = @"
query(`$projectId: ID!) {
  node(id: `$projectId) {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            __typename
            ... on DraftIssue {
              title
            }
            ... on Issue {
              title
            }
            ... on PullRequest {
              title
            }
          }
        }
      }
    }
  }
}
"@

$projectId = [string]$payload.projectId
$statusFieldId = [string]$payload.statusFieldId
$statusOptions = $payload.statusOptions
$useUpsertByTitle = -not $DisableUpsertByTitle

$existingItemsByTitle = @{}
if ($useUpsertByTitle -and -not $DryRun) {
    $listRes = Invoke-GithubGraphQL -OperationName 'list-project-items' -Query $listProjectItemsQuery -Variables @{
        projectId = $projectId
    }

    foreach ($node in $listRes.node.items.nodes) {
        $existingTitle = [string]$node.content.title
        $existingItemId = [string]$node.id
        if (-not [string]::IsNullOrWhiteSpace($existingTitle) -and -not [string]::IsNullOrWhiteSpace($existingItemId)) {
            if (-not $existingItemsByTitle.ContainsKey($existingTitle)) {
                $existingItemsByTitle[$existingTitle] = $existingItemId
            }
        }
    }
}

$index = 0
foreach ($item in $payload.items) {
    $index++
    $title = [string]$item.title
    $body = [string]$item.body
    $status = [string]$item.status
    $itemId = [string]$item.itemId

    if ([string]::IsNullOrWhiteSpace($title)) {
        throw "Item #$index has empty title"
    }

    Write-Output ([string]::Format('Processing item #{0}: {1}', $index, $title))

    if ([string]::IsNullOrWhiteSpace($itemId) -and $useUpsertByTitle -and -not $DryRun) {
        if ($existingItemsByTitle.ContainsKey($title)) {
            $itemId = [string]$existingItemsByTitle[$title]
            Write-Output "Found existing item by title: $title -> $itemId"
        }
    }

    if ([string]::IsNullOrWhiteSpace($itemId)) {
        $createRes = Invoke-GithubGraphQL -OperationName "create-item-$index" -Query $createDraftItemMutation -Variables @{
            projectId = $projectId
            title = $title
            body = $body
        }

        if (-not $DryRun) {
            $itemId = [string]$createRes.addProjectV2DraftIssue.projectItem.id
            if ([string]::IsNullOrWhiteSpace($itemId)) {
                throw "Create item failed for '$title': empty project item id"
            }
            Write-Output "Created item: $title -> $itemId"
        }
        else {
            Write-Output "[DRY-RUN] Create item prepared: $title"
        }
    }
    else {
        # Keep existing item and update only status to avoid creating duplicates.
        # Metadata mutation requires draftIssueId and is intentionally skipped here.
        Write-Output "Updated item reference: $itemId"
    }

    $item | Add-Member -NotePropertyName itemId -NotePropertyValue $itemId -Force

    if (-not [string]::IsNullOrWhiteSpace($status)) {
        $optionId = Get-StatusOptionId -StatusOptions $statusOptions -Status $status
        if ([string]::IsNullOrWhiteSpace($optionId)) {
            throw "Unknown status mapping '$status' for item '$title'"
        }

        if ($DryRun) {
            Write-Output "[DRY-RUN] Set status '$status' (optionId=$optionId)"
        }
        else {
            Invoke-GithubGraphQL -OperationName "set-status-$index" -Query $updateFieldMutation -Variables @{
                projectId = $projectId
                itemId = $itemId
                fieldId = $statusFieldId
                optionId = $optionId
            } | Out-Null
            Write-Output "Set status '$status' for item $itemId"
        }
    }
}

if (-not $DryRun) {
    $payload | ConvertTo-Json -Depth 15 | Set-Content -Path $PayloadPath -NoNewline
    Write-Output "Payload updated with itemId mappings: $PayloadPath"
}

Write-Output 'Project board sync completed.'
