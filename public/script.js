document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatHistory = document.getElementById("chat-history");
    const modelSelect = document.getElementById("model-select");
    const ollamaEndpoint = "http://localhost:11434/api/generate";

    // Disables the send button
    function disableSendButton() {
        sendBtn.disabled = true;
        sendBtn.style.opacity = "0.6";
        sendBtn.style.cursor = "not-allowed";
    }

    // Enables the send button
    function enableSendButton() {
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        sendBtn.style.cursor = "pointer";
    }

    // Removes <think>...</think> tags from responses
    function cleanResponse(str) {
        return str.replace(/<think>[\s\S]*?<\/think>/gi, '');
    }

    // Uses marked.js for proper Markdown rendering
    function formatMarkdown(text) {
        return marked.parse(text);
    }

    // Append a new user or AI message to the chat
    function appendMessage(role, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", role === "user" ? "user-message" : "ai-message");

        // Render Markdown
        messageDiv.innerHTML = formatMarkdown(text);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Show the "Thinking..." message
    function showThinking() {
        const thinkingDiv = document.createElement("div");
        thinkingDiv.classList.add("thinking-message");
        thinkingDiv.id = "thinking-message";
        thinkingDiv.innerText = "Thinking...";
        chatHistory.appendChild(thinkingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Hide the "Thinking..." message
    function hideThinking() {
        const thinkingDiv = document.getElementById("thinking-message");
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
    }

    // Update the *last* AI message in the chat with Markdown
    function updateLastAIMessage(text) {
        const aiMessages = document.querySelectorAll(".ai-message");
        if (!aiMessages.length) return;
        aiMessages[aiMessages.length - 1].innerHTML = formatMarkdown(text);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Send a user message and handle the AI response
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        console.log("User message (raw):", message);
        const selectedModel = modelSelect.value;

        // Append user message
        appendMessage("user", message);
        chatInput.value = "";

        // Disable the send button
        disableSendButton();

        // Show "Thinking..." message
        showThinking();

        // Prepare a new AI message container
        appendMessage("ai", "");

        let aiResponse = "";
        try {
            const response = await fetch(ollamaEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: message,
                    stream: true,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Error: status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let buffer = "";

            // Hide "Thinking..." before response starts
            hideThinking();

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    let lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const json = JSON.parse(line);

                                if (json.response) {
                                    console.log("AI Response (decoded):", json.response);
                                    aiResponse += json.response;

                                    // Update last AI message with new tokens
                                    updateLastAIMessage(cleanResponse(aiResponse));
                                }

                                if (json.done) {
                                    console.log("AI Response Completed");
                                    done = true;
                                    break;
                                }
                            } catch (err) {
                                console.error("Failed to parse AI chunk:", line, err);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            appendMessage("ai", `**Error:** ${err.message}`);
        } finally {
            // Re-enable send button after AI response is completed
            enableSendButton();
        }
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
