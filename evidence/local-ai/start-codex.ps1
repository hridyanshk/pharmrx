param([string]$Project = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path)
$ErrorActionPreference = 'Stop'
try {
    $null = Invoke-RestMethod 'http://127.0.0.1:11435/api/version' -TimeoutSec 2
} catch {
    $server = Start-Process -FilePath (Get-Command pwsh).Source -ArgumentList @('-NoProfile', '-File', ('"' + (Join-Path $PSScriptRoot 'serve.ps1') + '"')) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $PSScriptRoot 'ollama-out.log') -RedirectStandardError (Join-Path $PSScriptRoot 'ollama-error.log')
    $server.Id | Set-Content (Join-Path $PSScriptRoot 'server.pid')
    $ready = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 500
        try { $null = Invoke-RestMethod 'http://127.0.0.1:11435/api/version' -TimeoutSec 1; $ready = $true; break } catch {}
    }
    if (-not $ready) { throw 'Isolated Ollama server did not start. See ollama-error.log.' }
}
$configArgs = @()
Get-Content (Join-Path $PSScriptRoot 'config.toml') | ForEach-Object {
    if ($_.Trim() -and -not $_.Trim().StartsWith('#')) { $configArgs += @('-c', $_) }
}
& codex --ignore-user-config @configArgs -C $Project
exit $LASTEXITCODE
