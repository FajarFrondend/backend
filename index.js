require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'));
const port = process.env.PORT || 3001;

// Konfigurasi CORS
const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

app.use(cors(corsOptions));

// Middleware untuk menangani preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, this is your backend running on Vercel!');
});

app.post('/submit', async (req, res) => {
    console.log('Received data:', req.body);

    try {
        const data = req.body;
        const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

        if (!googleAppsScriptUrl) {
            throw new Error('GOOGLE_APPS_SCRIPT_URL is not defined in environment variables');
        }

        console.log('Sending data to Google Apps Script:', JSON.stringify(data));

        const response = await fetch(googleAppsScriptUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('Response from Google Apps Script:', result);
            return res.json({ message: 'Data successfully sent to Google Apps Script', result });
        } else {
            const text = await response.text();
            console.error('Expected JSON, but received:', text);
            return res.status(500).json({ error: 'Received non-JSON response', details: text });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error forwarding data to Google Sheets', details: error.message });
    }
});

// Tangani semua rute lainnya yang tidak didefinisikan
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
