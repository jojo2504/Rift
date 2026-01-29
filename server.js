require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const tmi = require('tmi.js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8080;

// In-memory storage for challenges
const challenges = {
    'piment': {
        title: "Manger un piment rouge",
        goal: 1000,
        currentAmount: 0,
        status: 'active', // active, awaiting_validation, validated, refused
        replayUrl: 'https://clips.twitch.tv/fake-clip-1'
    },
    'glace': {
        title: "Bain dans l'eau glacée",
        goal: 2500,
        currentAmount: 0,
        status: 'active',
        replayUrl: 'https://clips.twitch.tv/fake-clip-2'
    }
};

// --- WebSocket Logic ---
function broadcast(data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach(function each(client) {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(payload);
        }
    });
}

wss.on('connection', function connection(ws) {
    console.log('Client connected to WebSocket');
    ws.send(JSON.stringify({ type: 'all_challenges', challenges }));
    ws.on('error', console.error);
    ws.on('close', () => console.log('Client disconnected from WebSocket'));
});


// --- Express Routes ---
app.get('/simulate-donation/:defiId', (req, res) => {
    const { defiId } = req.params;
    const amount = parseFloat(req.query.amount);

    if (!challenges[defiId]) return res.status(404).send({ error: 'Challenge not found' });
    if (isNaN(amount) || amount <= 0) return res.status(400).send({ error: 'Invalid amount' });
    
    const challenge = challenges[defiId];
    if (challenge.status !== 'active') return res.status(400).send({ error: `Challenge is not active. Status: ${challenge.status}`});

    challenge.currentAmount += amount;
    const goalReached = challenge.currentAmount >= challenge.goal;
    console.log(`Donation for '${defiId}': +${amount} KAS | Total: ${challenge.currentAmount} / ${challenge.goal}`);

    broadcast({ type: 'update', defiId, amount: challenge.currentAmount, goal: challenge.goal, completed: goalReached });

    if (goalReached) {
        challenge.status = 'awaiting_validation';
        console.log(`Goal for '${defiId}' reached! Moving to 'awaiting_validation'.`);
        broadcast({ type: 'new_validation_required', defiId, challenge });
    }
    res.send({ message: 'Donation simulated', defiId, ...challenge });
});

// Validation Logic
function validateChallenge(defiId) {
    const challenge = challenges[defiId];
    if (challenge && challenge.status === 'awaiting_validation') {
        challenge.status = 'validated';
        console.log(`Fonds débloqués vers streamer pour le défi '${defiId}'.`);
        broadcast({ type: 'challenge_validated', defiId, message: 'Fonds débloqués vers streamer' });
        return { success: true, message: "Fonds débloqués vers streamer" };
    }
    return { success: false, message: 'Challenge not ready for validation or not found.' };
}

function refuseChallenge(defiId) {
    const challenge = challenges[defiId];
     if (challenge && challenge.status === 'awaiting_validation') {
        challenge.status = 'refused';
        console.log(`Challenge '${defiId}' REFUSED.`);
        broadcast({ type: 'challenge_refused', defiId });
        return { success: true, message: `Challenge ${defiId} refused.` };
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
