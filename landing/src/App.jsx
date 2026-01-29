import './App.css'

function App() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">RIFT</div>
          <nav className="nav">
            <a onClick={() => scrollToSection('presentation')}>Présentation</a>
            <a onClick={() => scrollToSection('how-it-works')}>Comment ça marche</a>
            <a onClick={() => scrollToSection('demo')}>Démo</a>
            <a onClick={() => scrollToSection('download')}>Télécharger</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Rift — Défis en direct.<br />
            Paiements instantanés.<br />
            <span className="highlight">Kaspa inside.</span>
          </h1>
          <p className="hero-subtitle">
            Proposez un défi. Financez-le. Déclenchez-le en live.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => scrollToSection('demo')}>
              Voir la démo
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('download')}>
              Tester Rift
            </button>
          </div>
        </div>
      </section>

      {/* Why Rift Section */}
      <section id="presentation" className="section why-rift">
        <div className="container">
          <h2 className="section-title">Pourquoi Rift ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Paiements instantanés</h3>
              <p>Transactions ultra-rapides avec Kaspa, confirmées en millisecondes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Intégration Twitch/OBS</h3>
              <p>Overlay en temps réel pour vos streams sans configuration complexe</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Validation oracle neutre</h3>
              <p>Système de validation tiers pour garantir l'équité des défis</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Sécurisé & transparent</h3>
              <p>Open source, auditable, et conçu pour la confiance</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🎯</div>
              <h3>Proposer un défi</h3>
              <p>Un viewer propose un défi créatif ou amusant au streamer</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">💸</div>
              <h3>Financer en KAS</h3>
              <p>Les autres viewers contribuent avec des paiements Kaspa instantanés</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">✅</div>
              <h3>Valider & déclencher</h3>
              <p>Un validateur confirme la réalisation → récompense débloquée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="section demo-section">
        <div className="container">
          <h2 className="section-title">Voyez Rift en action</h2>
          <div className="video-container">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Rift Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="demo-note">
            ⚠️ Remplacez l'URL de la vidéo dans App.jsx avec votre vraie démo
          </p>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="section download-section">
        <div className="container">
          <h2 className="section-title">Télécharger / Tester</h2>
          <div className="download-content">
            <div className="download-buttons">
              <a href="#" className="btn btn-large btn-primary" download>
                📦 Télécharger Rift.zip
              </a>
              <a 
                href="https://github.com/votreusername/rift" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-large btn-secondary"
              >
                💻 Voir sur GitHub
              </a>
            </div>
            <div className="badge">
              <div className="badge-icon">🏆</div>
              <div className="badge-text">
                <strong>Kaspathon 2026</strong>
                <span>Participant officiel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            Projet open source pour le <strong>Kaspathon 2026</strong>
          </p>
          <div className="footer-links">
            <a href="https://github.com/votreusername/rift" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://discord.gg/kaspa" target="_blank" rel="noopener noreferrer">
              Discord Kaspa
            </a>
            <a href="https://twitter.com/KaspaCurrency" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
