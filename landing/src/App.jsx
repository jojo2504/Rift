import CardNav from './CardNav';
import riftLogo from './assets/rift.png';

const App = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    {
      label: "Features",
      bgColor: "#f0f9f7",
      textColor: "#0a0a0a",
      links: [
        { label: "Boosted Revenue", ariaLabel: "Revenue features", href: "#features" },
        { label: "Community Building", ariaLabel: "Community features", href: "#features" }
      ]
    },
    {
      label: "How It Works", 
      bgColor: "#e6f5f2",
      textColor: "#0a0a0a",
      links: [
        { label: "Challenge System", ariaLabel: "How challenges work", href: "#how-it-works" },
        { label: "Instant Payouts", ariaLabel: "Payment system", href: "#how-it-works" }
      ]
    },
    {
      label: "Get Started",
      bgColor: "#d9f0ec", 
      textColor: "#0a0a0a",
      links: [
        { label: "Download", ariaLabel: "Download Rift", href: "#download" },
        { label: "Documentation", ariaLabel: "View documentation", href: "#download" }
      ]
    }
  ];

  const styles = {
    app: {
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      margin: 0,
      padding: 0,
      paddingTop: '100px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    hero: {
      padding: '120px 0',
      background: 'linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)',
    },
    heroContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '60px',
      alignItems: 'center',
    },
    heroLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    heroTitle: {
      fontSize: '56px',
      fontWeight: '800',
      marginBottom: '20px',
      lineHeight: '1.2',
      color: '#0a0a0a',
    },
    highlight: {
      color: '#16a085',
    },
    heroSubtitle: {
      fontSize: '20px',
      marginBottom: '40px',
      color: '#555555',
      lineHeight: '1.6',
    },
    heroRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '40px',
    },
    platformsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      width: '100%',
      maxWidth: '500px',
    },
    platformLogo: {
      width: '100%',
      height: '80px',
      backgroundColor: '#f8fffe',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      border: '1.5px solid #e0e0e0',
      transition: 'all 0.3s ease',
      cursor: 'default',
      color: '#333',
    },
    platformText: {
      fontSize: '13px',
      color: '#666666',
      textAlign: 'center',
      marginTop: '20px',
      fontWeight: '500',
    },
    btn: {
      padding: '15px 30px',
      fontSize: '18px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '10px',
      margin: '0 10px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    btnPrimary: {
      backgroundColor: '#16a085',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(22, 160, 133, 0.25)',
    },
    btnHero: {
      padding: '18px 45px',
      fontSize: '18px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      backgroundColor: '#16a085',
      color: '#ffffff',
      boxShadow: '0 6px 20px rgba(22, 160, 133, 0.3)',
      transition: 'all 0.3s ease',
      width: '100%',
      maxWidth: '400px',
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      color: '#16a085',
      border: '2px solid #16a085',
    },
    section: {
      padding: '80px 0',
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '38px',
      marginBottom: '60px',
      color: '#0a0a0a',
      fontWeight: '700',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
    },
    featureCard: {
      backgroundColor: '#ffffff',
      padding: '35px',
      borderRadius: '16px',
      textAlign: 'center',
      border: '1.5px solid #e8e8e8',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '20px',
    },
    footer: {
      padding: '50px 0',
      borderTop: '1.5px solid #e8e8e8',
      marginTop: '80px',
      backgroundColor: '#f8fffe',
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerCopyright: {
      fontSize: '14px',
      color: '#666',
      margin: 0,
    },
    footerSocials: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center',
    },
    footerLink: {
      fontSize: '14px',
      color: '#666',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s ease',
    },
  };

  return (
    <div style={styles.app}>
      <CardNav
        logo={riftLogo}
        logoAlt="Rift Logo"
        items={navItems}
        baseColor="rgba(255, 255, 255, 0.95)"
        menuColor="#16a085"
        buttonBgColor="#16a085"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <div style={styles.heroLeft}>
              <h1 style={styles.heroTitle}>
                Turn Every Stream Into a <span style={styles.highlight}>Revenue Machine</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Empower your community to fund live challenges. Complete them, get paid instantly. 
                It's streaming monetization reimagined.
              </p>
              <button style={styles.btnHero} onClick={() => scrollToSection('download')}>
                Start Earning Today — Free
              </button>
            </div>
            
            <div style={styles.heroRight}>
              <div style={styles.platformsGrid}>
                <div style={styles.platformLogo}>
                  <span>🎥 YouTube</span>
                </div>
                <div style={styles.platformLogo}>
                  <span>🟣 Twitch</span>
                </div>
                <div style={styles.platformLogo}>
                  <span>⚡ Kick</span>
                </div>
                <div style={styles.platformLogo}>
                  <span>🔵 Facebook</span>
                </div>
                <div style={styles.platformLogo}>
                  <span>🎮 Discord</span>
                </div>
                <div style={styles.platformLogo}>
                  <span>💎 OnlyFans</span>
                </div>
              </div>
              <p style={styles.platformText}>
                Works with all major streaming platforms
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Creators Love Rift</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💰</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>Boosted Revenue</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Turn every stream moment into a monetization opportunity with community-funded challenges.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🤝</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>United Community</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Create unique engagement: your viewers actively participate in content and feel invested in your success.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎉</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>Guaranteed Fun</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Creative and spontaneous challenges that make every stream unforgettable and boost your audience retention.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>⚡</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>Simple Setup</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>OBS integration in 2 minutes. No complex configuration, you stream, we handle the rest.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{...styles.section, backgroundColor: '#f8fffe'}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>1. Your Viewers Launch a Challenge</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Your community proposes creative, funny, or epic challenges directly during your stream.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💸</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>2. The Community Funds It</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Viewers contribute together to create an attractive pool. The crazier it is, the more you earn!</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={{color: '#0a0a0a', fontSize: '22px', marginBottom: '12px', fontWeight: '600'}}>3. You Succeed, You Win</h3>
              <p style={{color: '#666', lineHeight: '1.6', fontSize: '15px'}}>Complete the challenge live and receive your payment instantly. Simple, fast, transparent.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="download" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Ready to Transform Your Streams?</h2>
          <div style={{textAlign: 'center'}}>
            <p style={{fontSize: '20px', marginBottom: '20px', fontWeight: '600', color: '#0a0a0a'}}>
              Join creators who are multiplying their revenue while creating more engaging content.
            </p>
            <p style={{fontSize: '16px', marginBottom: '40px', color: '#666'}}>
              Free Installation • OBS & Twitch Compatible • Instant Payouts
            </p>
            <button style={{...styles.btn, ...styles.btnPrimary, padding: '20px 40px', fontSize: '20px'}} onClick={() => alert('Download coming soon!')}>
              Download Rift (Coming Soon)
            </button>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerContent}>
            <p style={styles.footerCopyright}>© 2026 Rift. All rights reserved.</p>
            
            <div style={styles.footerSocials}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
                Twitter
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
