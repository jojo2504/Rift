# Projet : Rift

## Contexte
Rift est une application pour streamers permettant aux viewers de proposer et financer des défis en direct avec des paiements en Kaspa. Les fonds sont bloqués tant qu’un validateur tiers (oracle humain) ne confirme pas que le défi a été accompli. Le tout est affiché en temps réel via un overlay OBS.

## But
- Mettre en avant la vitesse de Kaspa (transactions en millisecondes)
- Rendre l’expérience interactive et gamifiée pour les viewers
- Ajouter une couche de validation neutre (type Polymarket)
- Utilisation minimale d’outils côté streamer/viewer (juste OBS et navigateur)

## Modules prévus
- 🎯 Générateur/gestionnaire de défis
- 💸 Paiement en KAS avec QR code
- 👁️ Overlay pour OBS (progression live)
- 🧑‍⚖️ Interface de validation oracle
- 📡 WebSocket entre backend et overlay

## Contraintes
- Pas de smart contract (Kaspa n’en a pas)
- Oracle off-chain simulé pour le MVP
- Tout doit être open source et documenté

## Outils/API
- KaspaJS
- Twitch API / tmi.js (chat bot)
- Supabase (temps réel + DB)
- Vercel ou Netlify pour l’overlay
