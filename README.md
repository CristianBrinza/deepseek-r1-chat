# deepseek-r1-chat
A lightweight chat interface for interacting with **DeepSeek R1** via **Ollama**, built by **Cristian Brinza**.

## About
<p><strong>DeepSeek R1 Chat</strong> is a minimalistic yet powerful chat interface designed for seamless interaction with the <strong>DeepSeek R1</strong> model via Ollama. It enables efficient message streaming, Markdown rendering, and enhanced user experience for AI-driven conversations.</p>

## Getting Started

<p>Before using this chat interface, ensure that <strong>Ollama</strong> is installed and running. You can check the <a rel="noopener" target="_new" style="--streaming-animation-state: var(--batch-play-state-1); --animation-rate: var(--batch-play-rate-1);"><span style="--animation-count: 8; --streaming-animation-state: var(--batch-play-state-2);">Ollama</span><span style="--animation-count: 9; --streaming-animation-state: var(--batch-play-state-2);"> documentation</span></a> for installation instructions.</p>
## Check Ollama Logs

### Check if Ollama is running:
```sh
ollama list
```

### Check Listening Ports for Ollama
Use the following command to check which ports are being used by running processes:
```sh 
lsof -i -P -n | grep ollama
```

### Check if Ollama is Running and Its Process
```sh 
ps aux | grep ollama
```

###Check if Ollama is running correctly
```sh 
curl -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model": "deepseek-r1:14b", "prompt": "Hello", "stream": false}'
```


## Usage
<ol><li><strong>Start Ollama</strong><br>Ensure Ollama is running before launching the chat.</li><li><strong>Run the Chat Interface</strong><br>Open the project in your browser and start interacting with <strong>DeepSeek R1</strong>.</li><li><strong>Troubleshooting</strong><br>If responses are not generating, check the logs using the commands above.</li></ol>
