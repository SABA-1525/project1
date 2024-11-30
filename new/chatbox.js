// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Serve the frontend
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI College Chatbot</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #f5f5f5;
            }
            h1 {
                margin: 20px;
                color: #007BFF;
            }
            .chatbox {
                width: 90%;
                max-width: 500px;
                height: 600px;
                border: 2px solid #007BFF;
                border-radius: 10px;
                background-color: #fff;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
            }
            .messages {
                flex: 1;
                padding: 10px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            .messages .user, .messages .bot {
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 5px;
                max-width: 80%;
            }
            .messages .user {
                align-self: flex-end;
                background-color: #007BFF;
                color: white;
            }
            .messages .bot {
                align-self: flex-start;
                background-color: #e0e0e0;
            }
            .input-area {
                display: flex;
                border-top: 1px solid #ddd;
            }
            .input-area input {
                flex: 1;
                padding: 10px;
                font-size: 16px;
                border: none;
                outline: none;
            }
            .input-area button {
                background-color: #007BFF;
                color: white;
                border: none;
                padding: 10px 20px;
                cursor: pointer;
                font-size: 16px;
            }
            .input-area button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <h1>College Chatbot</h1>
        <div class="chatbox">
            <div class="messages" id="messages"></div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Type your message here...">
                <button id="sendButton">Send</button>
            </div>
        </div>
        <script>
            const messagesDiv = document.getElementById("messages");
            const userInput = document.getElementById("userInput");
            const sendButton = document.getElementById("sendButton");

            const appendMessage = (text, sender) => {
                const messageDiv = document.createElement("div");
                messageDiv.className = sender;
                messageDiv.textContent = text;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            };

            const sendMessage = async () => {
                const userMessage = userInput.value.trim();
                if (!userMessage) return;

                appendMessage(userMessage, "user");
                userInput.value = "";

                try {
                    const response = await fetch("/chat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ message: userMessage })
                    });
                    const data = await response.json();
                    appendMessage(data.reply, "bot");
                } catch (error) {
                    appendMessage("Error: Unable to connect to the server.", "bot");
                }
            };

            sendButton.addEventListener("click", sendMessage);
            userInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        </script>
    </body>
    </html>
    `);
});

// OpenAI API Configuration
const openai = new OpenAIApi(
    new Configuration({
        apiKey: "YOUR_OPENAI_API_KEY", // Replace with your OpenAI API key
    })
);

// Handle chat requests
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        });
        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ reply: "An error occurred while processing your request." });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
