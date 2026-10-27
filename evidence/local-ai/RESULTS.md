# Local AI Coding Environment — Updated Results

**Date:** October 21, 2026  
**Hardware:** RTX 4060 Laptop GPU (8 GB VRAM), 16 GB RAM

> **Current status: The local coding smoke test passes.** Gemma through Codex inspected the fixture, reproduced two failures, edited the source, and reran all four tests successfully. The configured context is now **65,536 tokens**.

## What fixed the editing problem

Changed the isolated Codex configuration from the legacy `unelevated` Windows sandbox to **MXC**. The official compatibility probe returned `MXC_OK`, and a workspace file-write probe returned `MXC_WRITE_OK`. No administrator setup, Windows accounts, firewall changes, or ACL changes were needed.

Node's default test runner also executed under MXC without the previous `spawn EPERM` error. Earlier PowerShell quoting errors were addressed with explicit instructions to use the existing PowerShell shell directly.

## Current configuration

| Setting | Value |
| --- | --- |
| Ollama / Codex CLI | 0.40.7 / 0.163.0 |
| Base model | `gemma4:12b`, 11.9B, Q4_K_M, about 8.0 GB downloaded |
| Active alias | `gemma4-local:12b-64k` |
| Endpoint | `http://127.0.0.1:11435/v1` |
| Context / automatic compaction | 65,536 / 48,000 tokens |
| Windows sandbox | `mxc`, with workspace-write permissions |
| Flash Attention / KV cache | Enabled / `q8_0` |
| Parallel requests / loaded models | 1 / 1 |
| Batch size | 128 |
| Speculative decoding | Disabled |
| Host prompt-cache cap / checkpoints | 512 MiB / 2 |
| Idle unload | 5 minutes |
| Codex reasoning effort | `none` |
| Connectors / remote plugin catalog / web search | Disabled |

The native generation defaults are 2,048 tokens and temperature 0.2; Codex may override them. Existing normal Codex and Ollama settings remain unchanged. A backup of the previous configuration is in `config-32k-before-mxc.toml`.

## Verified results

| Check | Result |
| --- | --- |
| Official MXC startup probe | Passed: `MXC_OK` |
| MXC workspace write probe | Passed: `MXC_WRITE_OK` |
| 64K native inference | Passed: `LOCAL_64K_OK` |
| Allocated context reported by Ollama | 65,536 tokens |
| Short native generation benchmark | About 9.18 tokens/second |
| Reported runtime allocation | About 8.79 GB total; 5.79 GB VRAM |
| Local-model inspection | Passed |
| Local-model source editing | Passed |
| Local-model test cycle | 2 pass / 2 fail before repair; 4 pass / 0 fail after repair |
| Independent retest | 4 pass / 0 fail |
| Original source and CSS hash checks | All unchanged |

**Scope:** The benchmark is a short response with a 64K allocation. It does not prove throughput, retrieval quality, or memory use with a prompt that fills the entire 64K window. CPU offloading remains active, and background application memory is additional.

## Coding test method

The test used a copy of the real frontend utility module and tests. Only in that copy, subtraction in the available-stock calculation was deliberately changed to addition. One regression test was added. Gemma used Codex tools to read files, reproduce failures, replace addition with subtraction, and run the tests again. The agent exited successfully; its event log and final response record four passing tests.

The original project was not repaired or edited because it did not contain this injected defect. Backend/database tests were excluded because they mutate database data. This passing smoke test does not establish full application competence or unattended coding reliability.

## Remaining limitations and speed options

- The model still relies on CPU offloading. Larger context does not make generation faster.
- Earlier unguided runs had PowerShell errors and unreliable tool choices. Review generated edits and verify tests.
- Codex still emits model-catalog decoding/fallback metadata warnings. These did not prevent the successful workflow.
- Keep speculative decoding disabled: it was much slower in the initial measurement.
- An optional smaller Gemma 4 12B quantization, `gemma4:12b-it-qat`, is officially listed at about 7.2 GB. It could reduce offloading, but has not been downloaded or benchmarked here. A speed or quality improvement is not guaranteed.
- Aider and OpenCode provide alternative Ollama coding workflows. They do not increase physical VRAM or guarantee faster inference.

## Launch

From the project root:

```powershell
.\evidence\local-ai\start-codex.ps1
```

If automatic server startup fails, keep this running in one terminal, then launch Codex from another:

```powershell
.\evidence\local-ai\serve.ps1
```

## Evidence

| File | Purpose |
| --- | --- |
| [config.toml](config.toml), [serve.ps1](serve.ps1), [Modelfile](Modelfile) | Current settings |
| [benchmark-64k.json](benchmark-64k.json), [allocation-64k.json](allocation-64k.json) | 64K allocation and short inference test |
| [model-test-events.log](model-test-events.log) | Successful local-model workflow |
| [model-test-result.txt](model-test-result.txt) | Gemma's final test report |
| [preservation-check.json](preservation-check.json) | Original-file hash checks |
| [before-mxc-events.log](before-mxc-events.log) | Earlier failed workflow |
| [RESULTS.txt](RESULTS.txt) | Historical report with a current-status addendum |

## Official documentation and tools

- [Codex Windows sandbox and MXC](https://learn.chatgpt.com/docs/windows/windows-sandbox)
- [Ollama context length](https://docs.ollama.com/context-length)
- [Ollama memory and cache settings](https://docs.ollama.com/faq)
- [Ollama Codex integration](https://docs.ollama.com/integrations/codex)
- [Smaller Gemma 4 12B QAT model](https://ollama.com/library/gemma4:12b-it-qat)
- [Aider with Ollama](https://aider.chat/docs/llms/ollama.html)
- [OpenCode with Ollama](https://docs.ollama.com/integrations/opencode)
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp)
