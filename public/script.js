// public/script.js

let isTracking = false;

document.getElementById('trackerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const startTrackingButton = document.getElementById('startTracking');
    const consoleOutputDiv = document.getElementById('consoleOutput');

    if (isTracking) {
        // Stop the tracking
        consoleOutputDiv.textContent += '\nStopping the tracker...';
        startTrackingButton.textContent = 'Start Tracking';
        isTracking = false;

        // Add logic here to actually stop the tracker on the server side if necessary
    } else {
        const rpcURL = 'https://evm.cronos.org/';
        const contractAddress = '0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2';
        const transferThreshold = document.getElementById('threshold').value;

        // Fetch the ABI
        const abiResponse = await fetch('/abis/tonicABI.json');
        const contractABI = await abiResponse.json();

        const response = await fetch('/start-tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rpcURL, contractAddress, contractABI, transferThreshold }),
        });

        const data = await response.json();
        consoleOutputDiv.textContent += '\n' + data.message;

        startTrackingButton.textContent = 'Stop Tracking';
        isTracking = true;
    }
});
