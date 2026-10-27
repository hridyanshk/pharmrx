$ErrorActionPreference = 'Stop'
# Process-local settings: no registry, services, startup items, or global env changes.
$env:OLLAMA_HOST = '127.0.0.1:11435'
$env:OLLAMA_CONTEXT_LENGTH = '65536'
$env:OLLAMA_FLASH_ATTENTION = '1'
$env:OLLAMA_KV_CACHE_TYPE = 'q8_0'
$env:OLLAMA_NUM_PARALLEL = '1'
$env:OLLAMA_MAX_LOADED_MODELS = '1'
$env:OLLAMA_KEEP_ALIVE = '5m'
$env:OLLAMA_NO_CLOUD = '1'
$env:LLAMA_ARG_CACHE_RAM = '512'
$env:LLAMA_ARG_CTX_CHECKPOINTS = '2'
& ollama serve
exit $LASTEXITCODE
