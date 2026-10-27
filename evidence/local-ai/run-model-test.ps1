$ErrorActionPreference = 'Stop'
$configArgs = @()
Get-Content (Join-Path $PSScriptRoot 'config.toml') | ForEach-Object {
    if ($_.Trim() -and -not $_.Trim().StartsWith('#')) { $configArgs += @('-c', $_) }
}
$task = 'You are testing local coding capability in an isolated copy of PharmRx frontend utilities. Read README.txt and inspect the first 5 lines of frontend/src/workspace-data.mjs and local-ai-regression.test.mjs. Run node --test --test-isolation=none frontend/src/workspace-data.test.mjs local-ai-regression.test.mjs to reproduce a deliberately injected stock calculation regression. The isolation option avoids a Windows sandbox child-process EPERM error while preserving the sandbox. Fix the source calculation so available stock subtracts reservations. Run the same tests again and report the actual pass/fail counts. Modify only frontend/src/workspace-data.mjs inside this test-project directory. Do not access parent directories, original project files, databases, networks, or install packages. Use shell and editing tools; do not merely suggest a patch. Keep replies brief and act directly.'
'' | & codex exec --ignore-user-config @configArgs --skip-git-repo-check --ephemeral -C (Join-Path $PSScriptRoot 'test-project') --json -o (Join-Path $PSScriptRoot 'model-test-result.txt') $task 1> (Join-Path $PSScriptRoot 'model-test-events.log') 2> (Join-Path $PSScriptRoot 'model-test-error.log')
$LASTEXITCODE | Set-Content (Join-Path $PSScriptRoot 'model-test-exit-code.txt')
exit $LASTEXITCODE
