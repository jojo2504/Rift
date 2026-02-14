# Rift

Plateforme de défis de streaming avec donations en Kaspa. Les spectateurs financent des défis, les streamers les réalisent, et les fonds sont libérés après validation.

## Architecture

```
Rift/
├── server.js              # Serveur principal (Express + WebSocket)
├── database.js            # SQLite (users, challenges, donations)
├── auth.js                # Authentification JWT
├── obs-overlay.html       # Overlay OBS
├── admin.html             # Panel admin
├── donation-app/          # App de donation (React + TypeScript)
├── landing/               # Landing page (React)
└── streamer-dashboard/    # Dashboard streamer (React)
```

## Installation

**Prérequis:** Node.js v16+, Git, compte Kaspa testnet-10

```bash
# 1. Cloner le repository
git clone https://github.com/jojo2504/Rift.git
cd Rift

# 2. Installer les dépendances du serveur
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres (voir section Configuration)

# 4. Démarrer le serveur
npm start
```

Serveur disponible sur `http://localhost:8080`

### Configuration

```env
# Serveur
PORT=8080
HOST=http://localhost:8080
NODE_ENV=development

# Kaspa Network (testnet-10)
NETWORK=testnet-10
NETWORK_RPC=wss://baryon-10.kaspa.green/kaspa/testnet-10/wrpc/borsh
VAULT_ADDRESS=kaspatest:votre_adresse_vault_testnet10
VAULT_PRIVATE_KEY=votre_clé_privée_pour_payouts_auto

# Authentification
JWT_SECRET=votre_secret_jwt_super_secure_256_bits_minimum
JWT_EXPIRATION=24h

# Sécurité
ADMIN_PASSWORD=mot_de_passe_admin_secure
```

### Frontend (dev)

```bash
cd landing && npm install && npm run dev        # Port 5173
cd donation-app && npm install && npm run dev   # Port 5174
cd streamer-dashboard && npm install && npm run dev  # Port 5175
```

## Configuration OBS

1. OBS → Sources → Source Navigateur
2. URL : `http://localhost:8080/obs-overlay.html?defi=ID_DU_DEFI`
3. Dimensions : 800x300

Test : `http://localhost:8080/simulate-donation/piment?amount=100`

## Stack Technique

**Backend:** Node.js, Express, WebSocket, SQLite3, JWT, bcrypt, KaspaJS, tmi.js
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
**Blockchain:** Kaspa Testnet-10 (1 bloc/sec)

## API

### Auth

```javascript
// Inscription
POST /auth/register
Body: { username: "streamer1", email: "user@example.com", password: "securepass" }
Response: { token: "jwt_token", user: {...} }

// Connexion
POST /auth/login
Body: { email: "user@example.com", password: "securepass" }
Response: { token: "jwt_token", user: {...} }

// Vérifier le token
GET /auth/verify
Headers: { Authorization: "Bearer jwt_token" }
Response: { user: {...} }
```

### Challenges

```javascript
// Récupérer tous les défis
GET /challenges
Response: { challenges: [...] }

// Récupérer un défi spécifique
GET /challenges/:challengeId
Response: { challenge: {...} }

// Créer un défi (authentifié)
POST /challenges
Headers: { Authorization: "Bearer jwt_token" }
Body: { title: "Défi fou", goal: 5000, deadline: timestamp, description: "..." }
Response: { challengeId: "abc123", challenge: {...} }

// Mettre à jour un défi (authentifié, propriétaire uniquement)
PUT /challenges/:challengeId
Headers: { Authorization: "Bearer jwt_token" }
Body: { title: "Nouveau titre", status: "active" }

// Supprimer un défi (authentifié, propriétaire uniquement)
DELETE /challenges/:challengeId
Headers: { Authorization: "Bearer jwt_token" }
```

### Donations

```javascript
// Simuler une donation (dev uniquement)
GET /simulate-donation/:defiId?amount=100
Response: { success: true, newTotal: 600, goal: 1000 }

// Obtenir les donations d'un défi
GET /donations/:challengeId
Response: { donations: [...] }
```

### Validation

```javascript
// Valider un défi (oracle/admin)
POST /valider/:defiId
Body: { oracleSignature: "..." }
Response: { success: true, status: "validated" }

// Refuser un défi et rembourser
POST /refuser/:defiId
Body: { reason: "Défi non réalisé" }
Response: { success: true, status: "refunded" }
```

## WebSocket

Connexion : `ws://localhost:8080`

**Serveur → Client:**

```javascript
// État initial de tous les défis
{
  type: 'all_challenges',
  challenges: {
    'piment': { title: '...', goal: 1000, currentAmount: 500, ... },
    'glace': { ... }
  }
}

// Mise à jour en temps réel d'un défi
{
  type: 'update',
  defiId: 'piment',
  amount: 750,
  goal: 1000,
  completed: false,
  percentage: 75
}

// Défi complété (objectif atteint)
{
  type: 'challenge_completed',
  defiId: 'piment'
}

// Défi validé par oracle
{
  type: 'challenge_validated',
  defiId: 'piment',
  payoutAddress: 'kaspatest:...',
  amount: 1000
}

// Défi refusé (remboursement)
{
  type: 'challenge_refused',
  defiId: 'piment',
  reason: 'Non réalisé'
}
```

## Personnalisation

Éditez [obs-overlay.html](obs-overlay.html) :

```html
<!-- Changer les couleurs -->
<style>
  .progress-bar-fill {
    background: linear-gradient(90deg, #6366f1, #8b5cf6); /* Violet */
  }
  .challenge-title {
    color: #fbbf24; /* Jaune or */
  }
</style>

<!-- Ajouter des effets sonores -->
<script>
  function playDonationSound() {
    const audio = new Audio('/sounds/cha-ching.mp3');
    audio.play();
  }
</script>

<!-- Animations personnalisées -->
<style>
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
</style>
```

## Sécurité

```javascript
// 1. Rate Limiting (ajouter dans server.js)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes par IP
});
app.use('/api/', limiter);

// 2. HTTPS obligatoire
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// 3. Helmet.js pour headers sécurisés
const helmet = require('helmet');
app.use(helmet());
```

**À faire en production :**
- HTTPS obligatoire
- Rate limiting
- Validation des inputs
- JWT secrets forts (256+ bits)
- CORS restrictif
- Backup DB

## Déploiement

### Automatique

```bash
chmod +x deploy.sh
./deploy.sh
```

### VPS

```bash
# 1. Se connecter au VPS
ssh user@your-vps-ip

# 2. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Cloner et installer
git clone https://github.com/jojo2504/Rift.git
cd Rift
npm install

# 4. Configurer PM2 pour auto-restart
sudo npm install -g pm2
pm2 start server.js --name rift
pm2 startup
pm2 save

# 5. Nginx reverse proxy
sudo nano /etc/nginx/sites-available/rift
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
```

```bash
docker build -t rift .
docker run -p 8080:8080 --env-file .env rift
```

## Contribution

```bash
# 1. Fork le projet sur GitHub

# 2. Cloner votre fork
git clone https://github.com/votre-username/Rift.git
cd Rift

# 3. Créer une branche feature
git checkout -b feature/nom-de-la-feature

# 4. Développer et tester
# ... vos modifications ...
npm test  # (quand tests seront implémentés)

# 5. Commit avec message descriptif
git commit -m "feat: ajoute support multilingue"
# Utiliser conventional commits : feat|fix|docs|style|refactor|test|chore

# 6. Push vers votre fork
git push origin feature/nom-de-la-feature

# 7. Ouvrir une Pull Request sur GitHub
```

## Licence

Licence Propriétaire Business - Tous droits réservés.

Ce logiciel est propriétaire. L'utilisation, la modification et la distribution sont soumises aux termes de la licence commerciale. Voir [LICENSE](LICENSE) pour les détails complets.

## Contact

- Issues : [GitHub Issues](https://github.com/jojo2504/Rift/issues)

