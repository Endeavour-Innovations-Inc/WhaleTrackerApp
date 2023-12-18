// whaleTracker.js
const ethers = require('ethers');

async function startWhaleTracker(rpcURL, contractAddress, contractABI, transferThreshold) {
    const provider = new ethers.providers.JsonRpcProvider(rpcURL);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const name = await contract.name();
    console.log('Whale tracker started!\nListening for large transfers on ' + name);

    contract.on('Transfer', (from, to, amount, data) => {
        if(amount >= transferThreshold) {
            console.log('New whale transfer for ' + name + ': https://cronoscan.com/tx/' + data.transactionHash);
            console.log('Amount transferred: ' + amount);
        }
    });
}

module.exports = { startWhaleTracker };
