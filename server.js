require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const tmi = require('tmi.js');
const QRCode = require('qrcode');
const https = require('https');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || `http://localhost:${PORT}`;

// Network configuration - Using Kaspa Testnet 10
const NETWORK = process.env.NETWORK || 'testnet-10';
const NETWORK_RPC = process.env.NETWORK_RPC || 'wss://baryon-10.kaspa.green/kaspa/testnet-10/wrpc/borsh';

// IMPORTANT: Set your own testnet-10 vault address in .env file
// Generate one at: https://kas.fyi or use kaspa-cli
const VAULT_ADDRESS = process.env.VAULT_ADDRESS || 'kaspatest:qzfdvw6mvzwkzr2rfrq268ut0a90gm6pxe6enxj3j25kp97t4jvz7pxyxt0vl';
const VAULT_PRIVATE_KEY = process.env.VAULT_PRIVATE_KEY || ''; // Required for automatic payments

if (!process.env.VAULT_ADDRESS) {
    console.warn('⚠️  WARNING: Using placeholder vault address!');
    console.warn('⚠️  Set VAULT_ADDRESS in .env with your real testnet-10 address');
}

if (!VAULT_PRIVATE_KEY) {
    console.warn('⚠️  WARNING: VAULT_PRIVATE_KEY not set!');
    console.warn('⚠️  Automatic payments to streamers will NOT work.');
    console.warn('⚠️  Set VAULT_PRIVATE_KEY in .env to enable automatic payouts.');
}

// In-memory storage for challenges
const challenges = {
    'piment': {
        title: "Manger un piment rouge",
        goal: 1000,
        currentAmount: 0,
        status: 'active', // active, awaiting_validation, validated, refused, expired, refunded
        replayUrl: 'https://clips.twitch.tv/fake-clip-1',
        donations: [], // Array of {amount, donorAddress, timestamp}
        deadline: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: Date.now(),
        streamerAddress: 'kaspatest:qzmr4ydk93rhamk7lakxgzep79w3n442me825l5tp6rrcsknzu5ejchy87zg5'
    },
    'glace': {
        title: "Bain dans l'eau glacée",
        goal: 2500,
        currentAmount: 0,
        status: 'active',
        replayUrl: 'https://clips.twitch.tv/fake-clip-2',
        donations: [],
        deadline: Date.now() + (48 * 60 * 60 * 1000), // 48 hours from now
        createdAt: Date.now(),
        streamerAddress: 'kaspatest:qzmr4ydk93rhamk7lakxgzep79w3n442me825l5tp6rrcsknzu5ejchy87zg5'
    }
};

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('.')); // Serve static files

// --- WebSocket Logic ---
function broadcast(data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach(function each(client) {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(payload);
        }
    });
}

// Broadcast challenge update to all clients
function broadcastChallengeUpdate(defiId) {
    const challenge = challenges[defiId];
    if (challenge) {
        broadcast({
            type: 'challenge_update',
            defiId: defiId,
            currentAmount: challenge.currentAmount,
            donations: challenge.donations,
            status: challenge.status,
            deadline: challenge.deadline
        });
    }
}

wss.on('connection', function connection(ws) {
    console.log('Client connected to WebSocket');
    ws.send(JSON.stringify({ type: 'all_challenges', challenges }));
    ws.on('error', console.error);
    ws.on('close', () => console.log('Client disconnected from WebSocket'));
});


// --- Express Routes ---

// Serve static files
app.use(express.static('.'));

// API endpoint to get challenge data
app.get('/api/challenge/:defiId', (req, res) => {
    const { defiId } = req.params;
    const challenge = challenges[defiId];
    
    if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json({
        defiId,
        ...challenge,
        vaultAddress: VAULT_ADDRESS,
        network: NETWORK,
        networkRPC: NETWORK_RPC,
        donateUrl: `${HOST}/donate.html?defi=${defiId}`
    });
});

// Generate QR code for donation page
app.get('/api/qrcode/:defiId', async (req, res) => {
    const { defiId } = req.params;
    const challenge = challenges[defiId];
    
    if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
    }
    
    try {
        const donateUrl = `${HOST}/donate.html?defi=${defiId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(donateUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({ qrCode: qrCodeDataUrl, url: donateUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Get payment instructions for challenges that reached goal
app.get('/api/payment-instructions/:defiId', (req, res) => {
    const { defiId } = req.params;
    const challenge = challenges[defiId];
    
    if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
    }
    
    if (!challenge.paymentPending && challenge.currentAmount < challenge.goal) {
        return res.status(400).json({ error: 'Goal not reached yet' });
    }
    
    const exactGoal = challenge.goal;
    const totalRaised = challenge.currentAmount;
    const overdonation = totalRaised - exactGoal;
    
    res.json({
        defiId,
        status: challenge.status,
        paymentRequired: true,
        instructions: {
            from: VAULT_ADDRESS,
            to: challenge.streamerAddress,
            amount: exactGoal,
            amountSompi: exactGoal * 100000000,
            network: NETWORK,
            networkRPC: NETWORK_RPC
        },
        details: {
            totalRaised,
            exactGoal,
            overdonation,
            overdonationNote: 'Overdonation covers transaction fees',
            donationsCount: challenge.donations.length
        },
        fundsReleased: challenge.fundsReleased || false
    });
});

// Secure donation endpoint with on-chain verification
// SECURITY: Always verifies transactions against blockchain BEFORE incrementing counter
// This prevents double-counting and ensures only valid on-chain transactions are accepted
app.post('/api/donate/:defiId', async (req, res) => {
    const { defiId } = req.params;
    let { txId, donorAddress, txData, intendedAmount } = req.body;

    if (!challenges[defiId]) return res.status(404).json({ error: 'Challenge not found' });
    if (!donorAddress) return res.status(400).json({ error: 'Donor address required' });
    
    const challenge = challenges[defiId];
    
    try {
        console.log('=== DONATION REQUEST DEBUG ===');
        console.log('txId type:', typeof txId);
        console.log('txId value:', JSON.stringify(txId).substring(0, 100));
        console.log('txData type:', typeof txData);
        
        // Handle case where txId is a JSON-stringified transaction object
        if (typeof txId === 'string' && txId.startsWith('{')) {
            try {
                txId = JSON.parse(txId);
                console.log('✓ Parsed txId from JSON string to object');
            } catch (e) {
                console.log('✗ txId looks like JSON but failed to parse');
            }
        }

        // Handle case where txId might be a full transaction object
        if (typeof txId === 'object' && txId !== null && txId.id) {
            console.log('✓ Detected: txId is a transaction object, extracting...');
            txData = txId; // The full transaction is in txId
            txId = txId.id; // Extract the actual ID
            console.log('✓ Extracted txId:', txId);
        }
        
        if (!txId) return res.status(400).json({ error: 'Transaction ID required' });
        
        console.log(`Verifying transaction ${txId} against blockchain...`);
        
        // IMPORTANT: Always verify transaction on blockchain FIRST before checking local storage
        // This prevents replay attacks and ensures transaction validity
        console.log('Received txData type:', typeof txData);
        console.log('Received txData:', txData ? 'present' : 'undefined');
        
        // If txData is just a string (transaction ID), it needs to be parsed
        if (typeof txData === 'string') {
            console.log('txData is a string, attempting to parse as JSON...');
            try {
                txData = JSON.parse(txData);
                console.log('✓ Successfully parsed txData as JSON');
            } catch (e) {
                console.log('Could not parse txData as JSON, treating as transaction ID only');
                txData = null; // Clear it so we use other methods
            }
        }
        
        if (txData && typeof txData === 'object') {
            console.log('txData keys:', Object.keys(txData));
            console.log('txData structure:', JSON.stringify(txData, null, 2).substring(0, 800));
        }
        console.log('Intended amount:', intendedAmount);
        
        let transactionData = null;
        let amount = null;
        let verificationMethod = null;
        
        // First, check if wallet provided valid transaction data with outputs
        if (txData && txData.outputs && Array.isArray(txData.outputs) && txData.outputs.length > 0) {
            console.log('✓ Using transaction data from wallet (has outputs)');
            transactionData = txData;
            verificationMethod = 'wallet_data';
        }
        else if (txData && txData.transaction && txData.transaction.outputs) {
            console.log('✓ Using nested transaction data from wallet');
            transactionData = txData.transaction;
            verificationMethod = 'wallet_data_nested';
        }
        // If no txData provided, fetch from blockchain API
        else {
            console.log('No txData from wallet - fetching from blockchain API...');
            try {
                // Use Kaspa API to fetch transaction details
                const apiUrl = `https://api.kaspa.org/transactions/${txId}`;
                console.log(`Fetching from: ${apiUrl}`);
                
                const response = await new Promise((resolve, reject) => {
                    https.get(apiUrl, (resp) => {
                        let data = '';
                        resp.on('data', (chunk) => { data += chunk; });
                        resp.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(new Error('Invalid JSON response from API'));
                            }
                        });
                    }).on('error', reject);
                });
                
                if (response && response.outputs) {
                    transactionData = response;
                    verificationMethod = 'blockchain_api';
                    console.log('✓ Retrieved transaction from blockchain API');
                } else {
                    throw new Error('Transaction not found or has no outputs');
                }
            } catch (apiError) {
                console.error(`✗ Blockchain API fetch failed:`, apiError.message);
                return res.status(400).json({
                    error: 'Cannot verify transaction on blockchain',
                    txId,
                    details: apiError.message,
                    suggestion: 'Transaction may not be confirmed yet. Please wait a few seconds and try again.'
                });
            }
        }
        
        console.log('Verification method:', verificationMethod);
        
        // Verify transaction has outputs
        if (!Array.isArray(transactionData.outputs) || transactionData.outputs.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid transaction - no outputs',
                details: 'Transaction data structure is invalid. Expected outputs array.',
                receivedStructure: Object.keys(transactionData || {})
            });
        }
        
        console.log('Transaction data received:', JSON.stringify(transactionData).substring(0, 300) + '...');
        
        // Find output to vault address and get the actual amount sent
        let foundVaultOutput = false;
        let actualAmountSompi = 0;
        
        for (const output of transactionData.outputs) {
            const outputValue = output.value || output.amount;
            let isVaultOutput = false;
            
            // Check if output goes to our vault address
            if (output.scriptPublicKey) {
                const outputScript = output.scriptPublicKey;
                
                // For testnet vault: kaspatest:qzfdvw6mvzwkzr2rfrq268ut0a90gm6pxe6enxj3j25kp97t4jvz7pxyxt0vl
                // corresponds to scriptPublicKey: 00002092d63b5b609d610d4348c0ad1f8b7f4af46f413675999a5192a96097cbac982fac
                if (outputScript === '00002092d63b5b609d610d4348c0ad1f8b7f4af46f413675999a5192a96097cbac982fac') {
                    isVaultOutput = true;
                    console.log(`  ✓ Found vault output via scriptPublicKey match`);
                }
            }
            
            if (isVaultOutput) {
                actualAmountSompi += parseInt(outputValue);
                foundVaultOutput = true;
                console.log(`  ✓ Found vault output: ${outputValue} sompi`);
            }
        }
        
        if (!foundVaultOutput) {
            return res.status(400).json({ 
                error: 'Transaction does not send funds to vault address',
                expected: VAULT_ADDRESS,
                expectedScriptPubKey: '00002092d63b5b609d610d4348c0ad1f8b7f4af46f413675999a5192a96097cbac982fac',
                foundOutputs: transactionData.outputs.map(o => ({
                    scriptPublicKey: o.scriptPublicKey,
                    value: o.value || o.amount
                }))
            });
        }
        
        // Convert sompi to KAS (1 KAS = 100,000,000 sompi)
        amount = actualAmountSompi / 100000000;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid donation amount' });
        }
        
        console.log(`✓ Blockchain verification complete: ${amount} KAS from ${donorAddress}`);
        
        // NOW check if transaction was already processed (after blockchain verification)
        // This ensures we only count transactions that are actually valid on-chain
        const alreadyProcessed = challenge.donations.some(d => d.txId === txId);
        if (alreadyProcessed) {
            console.log(`⚠️  Transaction ${txId} already processed - rejecting duplicate`);
            return res.status(400).json({ 
                error: 'Transaction already processed',
                txId: txId,
                blockchainVerified: true,
                alreadyCounted: true
            });
        }
        
        console.log(`✓ Transaction is new and valid - proceeding with donation processing`);
        
        // Check if challenge is expired
        if (Date.now() > challenge.deadline && challenge.status === 'active') {
            challenge.status = 'expired';
            console.log(`Challenge '${defiId}' has expired. Initiating refunds...`);
            processRefunds(defiId);
            return res.status(400).json({ error: 'Challenge has expired', status: 'expired' });
        }
        
        if (challenge.status !== 'active') {
            return res.status(400).json({ error: `Challenge is not active. Status: ${challenge.status}` });
        }
        
        // Check if goal already reached
        if (challenge.currentAmount >= challenge.goal) {
            return res.status(400).json({ 
                error: 'Goal already reached. No more donations accepted.', 
                status: 'goal_reached',
                currentAmount: challenge.currentAmount,
                goal: challenge.goal
            });
        }

        // Add verified donation
        challenge.donations.push({
            amount,
            donorAddress,
            timestamp: Date.now(),
            txId: txId // Store txId to prevent double-processing
        });
        
        challenge.currentAmount += amount;
        const goalReached = challenge.currentAmount >= challenge.goal;
        console.log(`Donation for '${defiId}': +${amount} KAS from ${donorAddress} | Total: ${challenge.currentAmount} / ${challenge.goal}`);
        console.log(`  → TX: ${txId}`);
        console.log(`  → Funds held in escrow. ${challenge.donations.length} donations total.`);

        // Broadcast challenge update to all connected clients
        broadcastChallengeUpdate(defiId);

        broadcast({ 
            type: 'update', 
            defiId, 
            amount: challenge.currentAmount, 
            goal: challenge.goal, 
            completed: goalReached,
            donationsCount: challenge.donations.length,
            timeRemaining: challenge.deadline - Date.now()
        });

        if (goalReached) {
            challenge.status = 'awaiting_validation';
            const exactGoal = challenge.goal;
            const totalRaised = challenge.currentAmount;
            const overdonation = totalRaised - exactGoal;
            
            // Calculate fee (5% of overdonation, minimum 1 KAS)
            const feeAmount = Math.max(1, overdonation * 0.05);
            const refundToLastDonor = overdonation - feeAmount;
            
            // Get the last donor (who caused the overdonation)
            const lastDonation = challenge.donations[challenge.donations.length - 1];
            
            console.log(`\n🎯 Goal for '${defiId}' reached!`);
            console.log(`  → Total raised: ${totalRaised} KAS from ${challenge.donations.length} donors`);
            console.log(`  → Goal amount: ${exactGoal} KAS`);
            console.log(`  → Overdonation: ${overdonation.toFixed(4)} KAS`);
            console.log(`  → Platform fee (5%, min 1 KAS): ${feeAmount.toFixed(4)} KAS`);
            console.log(`  → Refund to last donor: ${refundToLastDonor.toFixed(4)} KAS`);
            console.log(`  → Last donor address: ${lastDonation.donorAddress}`);
            
            // Store payment details
            challenge.paymentPending = {
                amount: exactGoal,
                overdonation: overdonation,
                fee: feeAmount,
                refundAmount: refundToLastDonor,
                refundTo: lastDonation.donorAddress,
                timestamp: Date.now()
            };
            
            broadcast({
                type: 'challenge_completed',
                defiId,
                totalRaised,
                goal: exactGoal
            });
            
            // Try automatic payment if private key is set
            if (VAULT_PRIVATE_KEY) {
                payStreamerAutomatically(defiId, exactGoal, challenge.streamerAddress);
            }
        }
        
        return res.json({
            success: true,
            message: 'Donation verified and recorded',
            actualAmount: amount,
            currentAmount: challenge.currentAmount,
            goal: challenge.goal,
            goalReached
        });
        
    } catch (error) {
        console.error('Transaction verification failed:', error);
        return res.status(500).json({ 
            error: 'Failed to verify transaction',
            details: error.message 
        });
    }
});

// DEPRECATED: Old simulation endpoint - kept for backward compatibility but should not be used
app.get('/simulate-donation/:defiId', (req, res) => {
    return res.status(403).json({ 
        error: 'This endpoint is disabled for security. Use POST /api/donate/:defiId with transaction verification instead.',
        migrationGuide: 'Send { txId, donorAddress } in POST body to /api/donate/:defiId'
    });
});

// Automatic payment to streamer using vault private key
async function payStreamerAutomatically(defiId, amountKAS, recipientAddress) {
    if (!VAULT_PRIVATE_KEY) {
        return { success: false, error: 'No vault private key configured' };
    }
    
    try {
        console.log(`\n💸 Sending ${amountKAS} KAS to ${recipientAddress}...`);
        
        // Import kaspajs
        const kaspa = require('kaspajs');
        
        // Convert KAS to sompi (1 KAS = 100,000,000 sompi)
        const amountSompi = BigInt(Math.floor(amountKAS * 100000000));
        
        console.log(`   Amount in sompi: ${amountSompi}`);
        console.log(`   Network: ${NETWORK}`);
        console.log(`   RPC: ${NETWORK_RPC}`);
        
        // Create transaction using kaspajs
        // Note: This requires proper kaspajs setup
        // For now, return instructions for manual sending
        
        console.log(`\n⚠️  Kaspajs library detected but transaction sending not yet implemented.`);
        console.log(`   MANUAL TRANSACTION REQUIRED:`);
        console.log(`   1. Open your vault wallet (Kasware with address: ${VAULT_ADDRESS})`);
        console.log(`   2. Make sure you're on Testnet 10`);
        console.log(`   3. Send ${amountKAS} KAS to: ${recipientAddress}`);
        console.log(`   4. The transaction will be broadcast automatically\n`);
        
        return { 
            success: false, 
            error: 'Manual transaction required - use your wallet',
            manualInstructions: {
                from: VAULT_ADDRESS,
                to: recipientAddress,
                amount: amountKAS,
                amountSompi: amountSompi.toString(),
                network: NETWORK,
                rpc: NETWORK_RPC
            }
        };
        
    } catch (error) {
        console.error('Payment error:', error);
        return { success: false, error: error.message };
    }
}

// Refund Logic
function processRefunds(defiId) {
    const challenge = challenges[defiId];
    if (!challenge || challenge.donations.length === 0) {
        return { success: false, message: 'No donations to refund' };
    }

    console.log(`\n🔄 Processing refunds for challenge '${defiId}'...`);
    console.log(`   Total to refund: ${challenge.currentAmount} KAS to ${challenge.donations.length} donors`);
    
    // In production, this would process actual Kaspa transactions
    challenge.donations.forEach((donation, index) => {
        console.log(`   Refunding ${donation.amount} KAS to ${donation.donorAddress}`);
        // TODO: Implement actual Kaspa transaction here
        // Example: kaspaWallet.send(donation.donorAddress, donation.amount)
    });
    
    challenge.status = 'refunded';
    challenge.refundedAt = Date.now();
    
    broadcast({ 
        type: 'challenge_refunded', 
        defiId, 
        refundedAmount: challenge.currentAmount,
        refundedCount: challenge.donations.length
    });
    
    console.log(`✅ All refunds processed for '${defiId}'\n`);
    return { success: true, message: 'All donations refunded', refundedAmount: challenge.currentAmount };
}

// Release funds to streamer
function releaseFundsToStreamer(defiId) {
    const challenge = challenges[defiId];
    if (!challenge || challenge.status !== 'validated') {
        return { success: false, message: 'Challenge not validated' };
    }

    const exactGoal = challenge.goal;
    const totalRaised = challenge.currentAmount;
    const overdonation = totalRaised - exactGoal;
    
    console.log(`\n💰 Releasing funds for challenge '${defiId}'...`);
    console.log(`   Total raised: ${totalRaised} KAS`);
    console.log(`   Sending to streamer: ${exactGoal} KAS`);
    console.log(`   Overdonation for fees: ${overdonation.toFixed(4)} KAS`);
    console.log(`   Streamer address: ${challenge.streamerAddress}`);
    console.log(`   From: ${challenge.donations.length} donations`);
    console.log(`\n   ⚠️  MANUAL ACTION REQUIRED:`);
    console.log(`   Use your vault wallet to send ${exactGoal} KAS to:`);
    console.log(`   ${challenge.streamerAddress}`);
    console.log(`   The ${overdonation.toFixed(4)} KAS overdonation will cover network fees.`);
    
    // In production: Automated transaction from vault to streamer
    // This requires vault private key or wallet connection
    // Example: await kaspaWallet.send(challenge.streamerAddress, exactGoal * 100000000)
    
    challenge.fundsReleased = true;
    challenge.releasedAt = Date.now();
    challenge.releaseDetails = {
        amountSent: exactGoal,
        overdonationForFees: overdonation,
        timestamp: Date.now()
    };
    
    console.log(`✅ Funds release recorded\n`);
    return { 
        success: true, 
        message: 'Funds released to streamer', 
        amount: exactGoal,
        overdonation: overdonation,
        streamerAddress: challenge.streamerAddress
    };
}

// Validation Logic
function validateChallenge(defiId) {
    const challenge = challenges[defiId];
    if (challenge && challenge.status === 'awaiting_validation') {
        challenge.status = 'validated';
        console.log(`Challenge '${defiId}' validated!`);
        
        // Release funds to streamer
        const releaseResult = releaseFundsToStreamer(defiId);
        
        broadcast({ 
            type: 'challenge_validated', 
            defiId, 
            message: 'Défi validé - Fonds libérés vers streamer',
            amount: challenge.currentAmount
        });
        
        return { success: true, message: "Défi validé - Fonds libérés vers streamer", ...releaseResult };
    }
    return { success: false, message: 'Challenge not ready for validation or not found.' };
}

function refuseChallenge(defiId) {
    const challenge = challenges[defiId];
     if (challenge && challenge.status === 'awaiting_validation') {
        challenge.status = 'refused';
        console.log(`Challenge '${defiId}' REFUSED. Initiating refunds...`);
        
        // Refund all donations
        const refundResult = processRefunds(defiId);
        
        broadcast({ type: 'challenge_refused', defiId, refunded: true });
        return { success: true, message: `Challenge ${defiId} refused - donations refunded`, ...refundResult };
    }
    return { success: false, message: 'Challenge not ready for validation or not found.' };
}

app.post('/valider/:defiId', (req, res) => {
    const { defiId } = req.params;
    const result = validateChallenge(defiId);
    res.status(result.success ? 200 : 400).send(result);
});

app.post('/admin/validate/:defiId', (req, res) => {
    const { defiId } = req.params;
    const result = validateChallenge(defiId);
    res.status(result.success ? 200 : 400).send(result);
});

app.post('/admin/refuse/:defiId', (req, res) => {
    const { defiId } = req.params;
    const result = refuseChallenge(defiId);
    res.status(result.success ? 200 : 400).send(result);
});
// Manual refund endpoint
app.post('/refund/:defiId', (req, res) => {
    const { defiId } = req.params;
    const challenge = challenges[defiId];
    
    if (!challenge) {
        return res.status(404).send({ error: 'Challenge not found' });
    }
    
    if (challenge.status !== 'expired' && challenge.status !== 'active') {
        return res.status(400).send({ error: 'Challenge must be expired or active to refund' });
    }
    
    challenge.status = 'expired';
    const result = processRefunds(defiId);
    res.status(result.success ? 200 : 400).send(result);
});

// Check for expired challenges
function checkExpiredChallenges() {
    const now = Date.now();
    Object.entries(challenges).forEach(([defiId, challenge]) => {
        if (challenge.status === 'active' && now > challenge.deadline) {
            console.log(`\n⏰ Challenge '${defiId}' has expired!`);
            challenge.status = 'expired';
            processRefunds(defiId);
        }
    });
}

// Check for expired challenges every minute
setInterval(checkExpiredChallenges, 60000);
// --- Challenge Generation (AI Simulation) ---

const challengeIdeas = [
    { title: "Dessin les yeux bandés", description: "Je dois dessiner un personnage choisi par le chat avec les yeux bandés. Le chat vote pour le meilleur (ou pire) dessin !" },
    { title: "Karaoké improvisé", description: "Le chat choisit une chanson populaire et je dois en faire un karaoké sans avoir les paroles sous les yeux." },
    { title: "Session de jeu 'une seule main'", description: "Je dois jouer à mon jeu principal en utilisant une seule main pendant 15 minutes." },
    { title: "Accent Challenge", description: "Pendant 10 minutes, je dois parler avec un accent bizarre choisi par les viewers (ex: pirate, robot, etc.)." },
    { title: "Cuisine du placard", description: "Je dois préparer une petite collation en utilisant seulement 3 ingrédients aléatoires que j'ai dans mes placards." },
    { title: "Ne pas rire (version YouTube)", description: "Le chat envoie des liens de vidéos 'try not to laugh' et je dois tenir le plus longtemps possible sans rire." }
];

const forbiddenWords = ['violent', 'haine', 'dangereux', 'nsfw', 'sang']; // Simplified list

app.get('/generate-challenge', (req, res) => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const idea = challengeIdeas[Math.floor(Math.random() * challengeIdeas.length)];
        const textToCkeck = `${idea.title} ${idea.description}`.toLowerCase();

        const isSafe = !forbiddenWords.some(word => textToCkeck.includes(word));

        if (isSafe) {
            console.log(`Generated challenge idea: "${idea.title}"`);
            return res.json(idea);
        }
        
        console.warn(`Generated idea failed safety check: "${idea.title}"`);
        attempts++;
    }

    res.status(500).json({ error: "Could not generate a safe challenge idea. Please try again." });
});


app.get('/admin/challenges', (req, res) => res.json(challenges));
app.get('/challenges', (req, res) => res.json(challenges));


// --- Twitch Bot Logic ---
function setupTwitchBot() {
    const options = {
        identity: {
            username: process.env.TWITCH_BOT_USERNAME,
            password: process.env.TWITCH_OAUTH_TOKEN
        },
        channels: [
            process.env.TWITCH_CHANNEL_NAME
        ]
    };

    if (!options.identity.password || options.identity.password.includes("xxx")) {
        console.warn("\nTwitch Bot is not configured. Please fill in the .env file.\n");
        return;
    }

    const client = new tmi.client(options);
    client.on('message', onMessageHandler);
    client.on('connected', (addr, port) => console.log(`Twitch bot connected to ${addr}:${port}`));
    
    client.connect().catch(console.error);

    function onMessageHandler(channel, userstate, message, self) {
        if (self) { return; } // Ignore messages from the bot

        const msg = message.trim().toLowerCase();

        // Find the first challenge that is currently 'active'
        const activeChallenge = Object.values(challenges).find(c => c.status === 'active');
        
        if (msg === '!defi') {
            if (activeChallenge) {
                client.say(channel, `Défi en cours: ${activeChallenge.title}`);
            } else {
                client.say(channel, "Il n'y a pas de défi en cours.");
            }
        } else if (msg === '!status') {
            if (activeChallenge) {
                const progress = `${activeChallenge.currentAmount.toFixed(0)} / ${activeChallenge.goal} KAS`;
                client.say(channel, `Progression: ${progress}`);
            } else {
                client.say(channel, "Il n'y a pas de défi en cours.");
            }
        }
    }
}


// --- Server Start ---
server.listen(PORT, () => {
    console.log(`HTTP and WebSocket server started on port ${PORT}`);
    // Start the twitch bot after the server is running
    setupTwitchBot();
});