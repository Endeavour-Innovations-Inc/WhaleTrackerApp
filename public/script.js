document.addEventListener('DOMContentLoaded', (event) => {
    let isTracking = false;
    let logInterval;

    const consoleOutputDiv = document.getElementById('consoleOutput');

    document.getElementById('trackerForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const startTrackingButton = document.getElementById('startTracking');

        if (isTracking) {
            // Stop the tracking logic
            clearInterval(logInterval); // Stop fetching logs
            const stopResponse = await fetch('/stop-tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const stopData = await stopResponse.json();
            consoleOutputDiv.textContent += '\n' + stopData.message;
            startTrackingButton.textContent = 'Start Tracking';
            isTracking = false;
        } else {
            // Start tracking logic
            const rpcURL = 'https://evm.cronos.org/';
            const contractAddress = '0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2';
            const thresholdValue = document.getElementById('threshold').value;
            
            // Fetch the ABI
            const abiResponse = await fetch('/abis/tonicABI.json');
            const contractABI = await abiResponse.json();

            const transferThreshold = thresholdValue; // Assuming you handle the conversion on the server

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

            // Start fetching logs
            logInterval = setInterval(fetchLogs, 5000); // Fetch logs every 5 seconds
        }
    });

    async function fetchLogs() {
        const response = await fetch('/get-logs');
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
            data.logs.forEach(log => {
                consoleOutputDiv.textContent += '\n' + log;
            });
        }
    }
});
