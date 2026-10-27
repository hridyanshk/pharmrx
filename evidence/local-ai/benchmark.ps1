$ErrorActionPreference = 'Stop'
$body = @{
    model = 'gemma4-local:12b-64k'
    messages = @(@{role='user'; content='Reply with exactly: LOCAL_MODEL_OK'})
    stream = $false
    think = $false
    options = @{num_predict=32}
} | ConvertTo-Json -Depth 5
$result = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:11435/api/chat -ContentType application/json -Body $body -TimeoutSec 240
$result | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $PSScriptRoot 'benchmark.json')
$allocation = Invoke-RestMethod http://127.0.0.1:11435/api/ps
$allocation | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $PSScriptRoot 'allocation.json')
[pscustomobject]@{
    reply = $result.message.content
    load_seconds = [math]::Round($result.load_duration/1e9,2)
    generation_tokens_per_second = if ($result.eval_duration) { [math]::Round($result.eval_count/($result.eval_duration/1e9),2) } else { 0 }
    total_seconds = [math]::Round($result.total_duration/1e9,2)
} | ConvertTo-Json
$allocation | ConvertTo-Json -Depth 6
