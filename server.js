// server.js
const express = require('express');
const { startWhaleTracker } = require('./whaleTracker');
const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json
app.use(express.static('public')); // Serve static files

// Serve ABI files
app.use('/abis', express.static('abis'));

app.post('/start-tracking', (req, res) => {
    const { rpcURL, contractAddress, contractABI, transferThreshold } = req.body;

    // Start the whale tracker
    startWhaleTracker(
        rpcURL, 
        contractAddress, 
        contractABI, 
        transferThreshold,
        (message) => {
            console.log(message); // Handle log messages, maybe forward to client via WebSocket
        }
    );

    res.json({ message: 'Whale tracker started' });
});

let isTracking = false;

app.post('/start-tracking', (req, res) => {
    if (!isTracking) {
        const { rpcURL, contractAddress, contractABI, transferThreshold } = req.body;
        startWhaleTracker(
            rpcURL, 
            contractAddress, 
            contractABI, 
            transferThreshold,
            (message) => {
                console.log(message); // Handle log messages, maybe forward to client via WebSocket
            }
        );
        isTracking = true;
        res.json({ message: 'Whale tracker started' });
    } else {
        // Logic to stop the tracker
        isTracking = false;
        res.json({ message: 'Whale tracker stopped' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
