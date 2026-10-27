Local Gemma coding environment — current status

The local coding smoke test PASSES with MXC and a 65,536-token context.
Read RESULTS.md for the full evidence, limitations, and official documentation.

Launch from the project root:
  .\evidence\local-ai\start-codex.ps1

If automatic server startup fails, keep this running in one terminal and run the
launcher in another:
  .\evidence\local-ai\serve.ps1

Current model: gemma4-local:12b-64k (shares gemma4:12b weights).
Endpoint: http://127.0.0.1:11435/v1
Context: 65536; compaction: 48000; Windows sandbox: mxc.
Flash Attention, q8_0 KV cache, one request/model, speculative decoding disabled,
512 MiB host prompt cache, two context checkpoints, five-minute idle unload.
Native Ollama generation defaults: 2048 tokens, temperature 0.2. Codex can override.
Codex thinking effort none; connectors, remote plugin catalog, web search disabled.

To recreate the alias in a separate PowerShell session while the server is running:
  $env:OLLAMA_HOST = '127.0.0.1:11435'
  ollama create gemma4-local:12b-64k -f .\evidence\local-ai\Modelfile

No existing project source, database, normal Codex config, global environment,
Windows ACLs, firewall rules, services, or system settings were changed.
The server settings are process-local; the launcher reads the local config file.

A short response measured about 9.18 tokens/second at a 64K allocation. Longer
prompts will behave differently. Partial CPU offloading remains active.
The earlier legacy-sandbox failures and 32K measurements are historical.
