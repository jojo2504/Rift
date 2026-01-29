
const express = require('express');
const bodyParser = require('body-parser');
const { Wallet } = require('kaspajs');
const qrcode = require('qrcode');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory database
const challenges = {};

app.post('/challenge', async (req, res) => {
    try {
        const { challengeId, name, targetAmount } = req.body;

        if (!challengeId || !name || !targetAmount) {
            return res.status(400).json({ error: 'Missing required fields: challengeId, name, targetAmount' });
        }

        // Generate a new Kaspa address
        const wallet = new Wallet();
        const { address } = wallet.newAddress();

        // Generate QR code
        const qrcodeSvg = await qrcode.toString(address, { type: 'svg' });

        // Store challenge data
        challenges[challengeId] = {
            name,
            targetAmount,
            address,
            qrcodeSvg
        };

        res.json({
            challengeId,
            address,
            qrcodeSvg
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create challenge' });
    }
});

app.get('/challenge/:challengeId', (req, res) => {
    const { challengeId } = req.params;
    const challenge = challenges[challengeId];

    if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json(challenge);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
