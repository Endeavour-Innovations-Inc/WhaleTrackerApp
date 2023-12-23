// whaleTracker.js
const ethers = require('ethers');

let logMessages = [];
let transferEventListener = null;

function addLogMessage(message) {
    logMessages.push(message);
}

async function startWhaleTracker(rpcURL, contractAddress, contractABI, transferThreshold) {
    const provider = new ethers.providers.JsonRpcProvider(rpcURL);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const name = await contract.name();
    addLogMessage('Whale tracker started!\nListening for large transfers on ' + name);

    // Define the listener function
    const listenerFunc = (from, to, amount, data) => {
        if(amount.gte(ethers.BigNumber.from(transferThreshold))) {
            const etherscanUrl = `https://etherscan.io/tx/${data.transactionHash}`;
            const logMessage = `New whale transfer for ${name}: <a href="${etherscanUrl}" target="_blank">${etherscanUrl}</a> Amount transferred: ${ethers.utils.formatUnits(amount, 18)} ETH`;
            addLogMessage(logMessage);
        }
    };

    // Assign the listener function to the transfer event
    contract.on('Transfer', listenerFunc);

    // Save the listener for future removal
    transferEventListener = { contract, listenerFunc };
}

function stopWhaleTracker() {
    if (transferEventListener) {
        // Remove the event listener
        transferEventListener.contract.removeListener('Transfer', transferEventListener.listenerFunc);
        transferEventListener = null;
        addLogMessage('Whale tracker stopped');
    }
}

function getLogMessages() {
    return logMessages;
}

function clearLogMessages() {
    logMessages = [];
}

module.exports = { startWhaleTracker, stopWhaleTracker, getLogMessages, clearLogMessages };
