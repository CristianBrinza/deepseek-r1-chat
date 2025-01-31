import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch'; // Ensure this is installed
import dotenv from 'dotenv';



dotenv.config();
export const PORT = process.env.PORT ;
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
export const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT;
export const AUTH_TOKEN = process.env.AUTH_TOKEN ;

const app = express();

// Middleware
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ limit: '10gb', extended: true }));
app.use(cors());


// Serve static files (public directory)
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// Root route - Serve the UI
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Status endpoint
app.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

//model
app.get('/model', (req: Request, res: Response) => {
    res.status(200).json({ OLLAMA_MODEL });
});


// Test environment variables
console.log('Environment Variables:', { PORT, OLLAMA_MODEL, OLLAMA_ENDPOINT, AUTH_TOKEN });

// API Chat Route
// Middleware to check token authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const requestToken = req.headers.authorization?.split("Bearer ")[1]; // Expecting "Bearer <TOKEN>"

    if (!requestToken || requestToken !== AUTH_TOKEN) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    next();
};

// API Chat Route (Requires Token)
app.post('/api/chat', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await fetch(OLLAMA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, prompt: message, stream: false }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error: ${response.statusText}, ${errorBody}`);
        }

        const result = await response.json();
        res.json({ response: result.response });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
