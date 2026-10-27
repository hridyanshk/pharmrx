$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$testRoot = Join-Path $PSScriptRoot 'test-project'
if (Test-Path $testRoot) { throw 'Test directory already exists; refusing to overwrite.' }
New-Item -ItemType Directory -Path (Join-Path $testRoot 'frontend/src') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'frontend/src/workspace-data.mjs'),(Join-Path $projectRoot 'frontend/src/workspace-data.test.mjs') -Destination (Join-Path $testRoot 'frontend/src')
Copy-Item -LiteralPath (Join-Path $projectRoot 'frontend/package.json') -Destination (Join-Path $testRoot 'frontend')
'Isolated copy of PharmRx frontend utilities. Run node --test frontend/src/workspace-data.test.mjs. No dependencies or database required. Modify files only in this test-project directory.' | Set-Content (Join-Path $testRoot 'README.txt')
Get-FileHash (Join-Path $projectRoot 'frontend/src/apothecary.css'),(Join-Path $projectRoot 'frontend/src/pharmacy-workspace.css'),(Join-Path $projectRoot 'frontend/src/workspace-data.mjs'),(Join-Path $projectRoot 'frontend/src/workspace-data.test.mjs') | Select-Object Path,Hash | ConvertTo-Json | Set-Content (Join-Path $PSScriptRoot 'original-hashes.json')
