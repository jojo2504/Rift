# 🎮 Rift - OBS Donation Overlay for Kaspa

Stream challenges powered by Kaspa cryptocurrency donations. Viewers donate to unlock challenges, streamers complete them live, and oracles validate completion before releasing funds.

![Rift Demo](https://via.placeholder.com/800x400?text=Rift+Demo+Screenshot)

## ✨ Features

- **⚡ Real-time Updates** - Kaspa's 1-second blocks = instant donation tracking
- **🎯 Challenge System** - Viewers fund specific challenges with progress bars
- **📱 QR Codes** - Mobile-friendly donation with auto-generated QR codes
- **🔐 Oracle Validation** - Neutral third-party validates challenge completion
- **🎨 OBS Ready** - Beautiful overlay via Browser Source (no plugin install!)
- **💸 Transparent** - All donations held until streamer proves completion

## 🚀 For Streamers

### Quick Setup (2 minutes)

1. **Add overlay to OBS:**
   - Add Browser Source in OBS
   - URL: `https://your-rift-app.com/obs-overlay.html?defi=CHALLENGE_ID`
   - Dimensions: 800x300
   - Done!

2. **Create challenges:**
   - Open admin panel
   - Set challenge name and goal
   - Copy overlay URL

3. **Go live and earn!**

📖 **Full guide:** [OBS Setup Guide](docs/OBS_SETUP_GUIDE.md)

### Demo

Test it locally:
```bash
git clone https://github.com/jojo2504/Rift.git
cd Rift
npm install
node server.js
```

Open OBS → Add Browser Source → URL: `http://localhost:8080/obs-overlay.html?defi=piment`

Simulate donation: `http://localhost:8080/simulate-donation/piment?amount=100`

## 🛠️ For Developers

### Tech Stack

- **Backend:** Node.js, Express, WebSockets
- **Frontend:** Vanilla JS (overlay), React (landing page)
- **Blockchain:** Kaspa (KaspaJS)
- **Streaming:** OBS Browser Source
- **Real-time:** WebSocket for live updates

### Project Structure

```
Rift/
├── server.js              # Main backend server
├── obs-overlay.html       # OBS browser source overlay
├── admin.html             # Challenge management
├── landing/               # Marketing website (React)
├── docs/
│   ├── OBS_SETUP_GUIDE.md      # Streamer instructions
│   ├── DEPLOYMENT_GUIDE.md     # Hosting guide
│   └── PACKAGING_GUIDE.md      # Distribution options
└── deploy.sh              # Quick deployment script
```

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Access points
# - Overlay: http://localhost:8080/obs-overlay.html?defi=piment
# - Admin: http://localhost:8080/admin.html
# - API: http://localhost:8080/simulate-donation/piment?amount=100
```

### API Endpoints

```javascript
// Simulate donation (testing)
GET /simulate-donation/:defiId?amount=50

// Validate challenge (oracle)
POST /valider/:defiId

// Refuse challenge (oracle)
POST /refuser/:defiId
```

### WebSocket Events

```javascript
// Server → Client
{ type: 'all_challenges', challenges: {...} }
{ type: 'update', defiId: 'piment', amount: 500, goal: 1000, completed: false }
{ type: 'challenge_validated', defiId: 'piment' }
{ type: 'challenge_refused', defiId: 'piment' }
```

## 📦 Deployment

### Quick Deploy

```bash
./deploy.sh
```

Choose from:
1. **Local** - Test on localhost
2. **Heroku** - One-click cloud deploy
3. **Railway** - Alternative hosting
4. **VPS** - Full control self-hosting

📖 **Full guide:** [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

### Environment Variables

```env
PORT=8080
NODE_ENV=production
KASPA_WALLET_ADDRESS=kaspa:your_address_here
ADMIN_PASSWORD=secure_password
```

## 🎨 Customization

### Custom Overlay Styles

Edit [obs-overlay.html](obs-overlay.html):
- Change colors, fonts, animations
- Adjust dimensions for your stream layout
- Add custom sound effects on donations

### Challenge Types

Extend [server.js](server.js) to add:
- Time-based challenges
- Multi-tier goals
- Stretch goals
- Team challenges

## 🔐 Security

- **Admin Panel:** Add authentication before production
- **HTTPS:** Required for WebSocket security (wss://)
- **Rate Limiting:** Prevent donation spam
- **Input Validation:** Sanitize all user inputs

⚠️ **Important:** Never expose admin endpoints without authentication!

## 🤝 Contributing

We welcome contributions! Areas needing help:
- [ ] Actual Kaspa blockchain integration (replace simulation)
- [ ] Multi-language support (currently French)
- [ ] Twitch chat bot integration
- [ ] Mobile app for viewers
- [ ] Advanced analytics dashboard
- [ ] Theme marketplace for overlays

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- **Kaspa Community** - For the blazing-fast blockchain
- **OBS Project** - For the powerful streaming platform
- **Streamers** - For testing and feedback

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/jojo2504/Rift/issues)
- **Discord:** [Join our server](#)
- **Twitter:** [@RiftStream](#)
- **Email:** support@rift.app

## 🗺️ Roadmap

### v1.0 (Current)
- [x] Basic overlay with progress bar
- [x] WebSocket real-time updates
- [x] Admin panel
- [x] Simulated donations

### v1.1 (Next)
- [ ] Real Kaspa blockchain integration
- [ ] Twitch authentication
- [ ] Challenge templates
- [ ] Sound alerts

### v2.0 (Future)
- [ ] Multi-streamer campaigns
- [ ] NFT rewards for donors
- [ ] Mobile app
- [ ] Plugin marketplace

---

**Made with ❤️ for streamers and the Kaspa community**

[⬆ Back to top](#-rift---obs-donation-overlay-for-kaspa)
