// server.js
const express = require('express');
const { startWhaleTracker, stopWhaleTracker, getLogMessages, clearLogMessages } = require('./whaleTracker');
const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json
app.use(express.static('public')); // Serve static files

// Serve ABI files
app.use('/abis', express.static('abis'));

let isTracking = false;
let listener = null; // Holds the event listener

app.post('/start-tracking', (req, res) => {
    if (!isTracking) {
        const { rpcURL, contractAddress, contractABI, transferThreshold } = req.body;

        // Start the whale tracker and set up the listener
        listener = startWhaleTracker(
            rpcURL, 
            contractAddress, 
            contractABI, 
            transferThreshold,
            (message) => {
                console.log(message); // Handle log messages
            }
        );

        isTracking = true;
        res.json({ message: 'Whale tracker started' });
    } else {
        res.json({ message: 'Whale tracker is already running' });
    }
});

app.post('/stop-tracking', (req, res) => {
    if (isTracking && listener) {
        stopWhaleTracker(listener); // Function to stop the tracker, e.g., remove the event listener
        isTracking = false;
        res.json({ message: 'Whale tracker stopped' });
    } else {
        res.json({ message: 'Whale tracker is not running' });
    }
});

app.get('/get-logs', (req, res) => {
    const logs = getLogMessages();
    clearLogMessages(); // Optionally clear messages after sending
    res.json({ logs });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
