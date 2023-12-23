async function getExchangeRate(tokenSymbol) {
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol}&vs_currencies=usd`;
        const response = await fetch(url);
        const data = await response.json();
        return data[tokenSymbol].usd;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    let isTracking = false;
    let logInterval;

    const consoleOutputDiv = document.getElementById('consoleOutput');
    const networkSelect = document.getElementById('network'); // Network dropdown
    const tokenSelect = document.getElementById('token'); // Token dropdown

    document.getElementById('trackerForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const startTrackingButton = document.getElementById('startTracking');
        const selectedNetwork = networkSelect.value; // Selected network
        const selectedToken = tokenSelect.value; // Selected token
        const usdEquivalent = parseFloat(document.getElementById('usdEquivalent').value);

        let rpcURL = 'https://gateway.tenderly.co/public/mainnet';
        if (selectedNetwork === 'cronos') {
            rpcURL = 'https://evm.cronos.org/';
        }

        let contractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
        let abiURL = '/abis/ethABI.json';
        let tokenSymbol = 'ethereum'; // Default to Ethereum

        if (selectedToken === 'eth') {
            contractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
            abiURL = '/abis/ethABI.json';
            tokenSymbol = 'ethereum'; // Default to Ethereum
        } else if (selectedToken === 'wbtc') {
            contractAddress = '...'; // Set WBTC Contract Address
            abiURL = '...'; // Set WBTC ABI URL
            tokenSymbol = 'bitcoin'; // CoinGecko ID for WBTC
        } else if (selectedToken === 'usdt') {
            contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Set WBTC Contract Address
            abiURL = '/abis/usdtABI.json'; // Set WBTC ABI URL
            tokenSymbol = 'tether'; // CoinGecko ID for WBTC
        }

        // Fetch the ABI
        const abiResponse = await fetch(abiURL);
        const contractABI = await abiResponse.json(); // Define contractABI here

        let exchangeRate = await getExchangeRate(tokenSymbol);
        let decimals = 18; 
        if (selectedToken === 'usdt' || selectedToken === 'usdc') {
            decimals = 6; // USDT and USDC use 6 decimal places
        }

        let transferThreshold = document.getElementById('threshold').value;

        if (exchangeRate && !isNaN(usdEquivalent) && usdEquivalent > 0) {
            let tokenAmountInStandardUnit = usdEquivalent / exchangeRate;
            // Assuming you are working with a token like Ethereum with 18 decimals
            // Convert the threshold from Ether to Wei
            tokenAmountInStandardUnit = tokenAmountInStandardUnit.toFixed(decimals);
            transferThreshold = ethers.utils.parseUnits(tokenAmountInStandardUnit.toString(), decimals);
        }

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
                document.getElementById('consoleOutput').innerHTML += `<p>${log}</p>`;
            });
        }
    }    
});
