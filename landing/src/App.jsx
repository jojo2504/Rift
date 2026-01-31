import StaggeredMenu from './StaggeredMenu';
import riftLogo from './assets/rift_logo.png';
import twitchLogo from './assets/twitch-blacklogo.svg';
import kickLogo from './assets/kickstarter-kick-starter-crowdfunding-svgrepo-com.svg';
import youtubeLogo from './assets/youtube-168-svgrepo-com.svg';
import onlyfansLogo from './assets/onlyfans-2.svg';
import discordLogo from './assets/discord-svgrepo-com.svg';
import Ballpit from './Ballpit';
import RotatingText from './RotatingText';

const App = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '#home' },
    { label: 'How It Works', ariaLabel: 'Learn how it works', link: '#how-it-works' },
    { label: 'Demo', ariaLabel: 'View demo', link: '#demo' },
    { label: 'Early Access', ariaLabel: 'Join early access', link: '#download' }
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' }
  ];

  const styles = {
    app: {
      backgroundColor: '#F9FAFB',
      color: '#0B0B0B',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 clamp(15px, 4vw, 20px)',
    },
    hero: {
      padding: 'clamp(80px, 10vh, 120px) 0 clamp(40px, 5vh, 60px) 0',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F4FBF8 100%)',
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    },
    ballpitContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      zIndex: 0,
    },
    heroContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    heroLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    heroTitle: {
      fontSize: 'clamp(36px, 7vw, 72px)',
      fontWeight: '900',
      marginBottom: '0',
      lineHeight: '1.1',
      color: '#0B0B0B',
      textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.3em',
    },
    rotatingTextWrapper: {
      display: 'inline-flex',
      backgroundColor: '#12B886',
      color: '#ffffff',
      padding: '0.15em 0.4em',
      borderRadius: '12px',
      overflow: 'hidden',
    },
    highlight: {
      color: '#12B886',
    },
    heroSubtitle: {
      fontSize: 'clamp(17px, 3.5vw, 24px)',
      marginBottom: '0',
      color: '#6B7280',
      lineHeight: '1.7',
      maxWidth: '750px',
      padding: '0 20px',
      fontWeight: '500',
    },
    ctaContainer: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    heroInfo: {
      fontSize: '15px',
      color: '#6B7280',
      fontWeight: '500',
    },
    compatibleWith: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      marginTop: '40px',
      width: '100%',
    },
    compatibleLabel: {
      fontSize: '12px',
      color: '#9CA3AF',
      fontWeight: '500',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
    platformLogos: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(30px, 6vw, 50px)',
      flexWrap: 'wrap',
      maxWidth: '600px',
    },
    platformLogo: {
      height: '28px',
      width: 'auto',
      opacity: 0.6,
      transition: 'opacity 0.3s ease',
      filter: 'grayscale(100%) brightness(0.7)',
      cursor: 'default',
    },
    heroFooter: {
      fontSize: '14px',
      color: '#6B7280',
      fontWeight: '400',
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
      backgroundColor: '#12B886',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(18, 184, 134, 0.3)',
    },
    btnHero: {
      padding: 'clamp(12px, 3vw, 18px) clamp(25px, 6vw, 45px)',
      fontSize: 'clamp(14px, 3vw, 18px)',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      backgroundColor: '#12B886',
      color: '#ffffff',
      boxShadow: '0 6px 20px rgba(18, 184, 134, 0.35)',
      transition: 'all 0.3s ease',
    },
    btnSecondaryHero: {
      padding: 'clamp(12px, 3vw, 18px) clamp(25px, 6vw, 45px)',
      fontSize: 'clamp(14px, 3vw, 18px)',
      cursor: 'pointer',
      borderRadius: '10px',
      fontWeight: '600',
      backgroundColor: 'transparent',
      color: '#6B7280',
      border: '2px solid #6B7280',
      transition: 'all 0.3s ease',
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      color: '#12B886',
      border: '2px solid #12B886',
    },
    section: {
      padding: 'clamp(60px, 10vh, 100px) 0',
      minHeight: '60vh',
    },
    howItWorksSection: {
      padding: 'clamp(80px, 12vh, 120px) 0',
      backgroundColor: '#FFFFFF',
      minHeight: 'auto',
    },
    howItWorksContent: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '0 clamp(20px, 5vw, 40px)',
    },
    stepsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'clamp(40px, 6vw, 60px)',
      marginTop: 'clamp(50px, 8vh, 70px)',
    },
    stepCard: {
      textAlign: 'center',
      padding: '0 clamp(15px, 3vw, 20px)',
    },
    stepNumber: {
      width: 'clamp(50px, 10vw, 60px)',
      height: 'clamp(50px, 10vw, 60px)',
      borderRadius: '50%',
      backgroundColor: '#F4FBF8',
      color: '#12B886',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(20px, 4vw, 24px)',
      fontWeight: '700',
      margin: '0 auto clamp(20px, 4vh, 30px)',
      border: '2px solid #12B886',
    },
    stepTitle: {
      fontSize: 'clamp(18px, 4vw, 22px)',
      fontWeight: '700',
      color: '#0B0B0B',
      marginBottom: 'clamp(12px, 2.5vh, 16px)',
    },
    stepDescription: {
      fontSize: 'clamp(14px, 3vw, 16px)',
      color: '#6B7280',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: 'clamp(28px, 6vw, 38px)',
      marginBottom: 'clamp(30px, 8vw, 60px)',
      color: '#0B0B0B',
      fontWeight: '700',
    },
    liveSection: {
      padding: 'clamp(50px, 6vh, 80px) 0 clamp(120px, 15vh, 180px) 0',
      background: 'linear-gradient(180deg, #F4FBF8 0%, #FFFFFF 40%, #FFFFFF 100%)',
      minHeight: 'auto',
    },
    liveSectionContent: {
      maxWidth: '1000px',
      margin: '0 auto',
      textAlign: 'center',
      padding: '0 clamp(20px, 5vw, 40px)',
    },
    obsMockup: {
      backgroundColor: '#0B0B0B',
      borderRadius: '20px',
      padding: 'clamp(20px, 5vw, 40px)',
      marginTop: 'clamp(40px, 6vh, 60px)',
      marginBottom: 'clamp(50px, 8vh, 80px)',
      position: 'relative',
      boxShadow: '0 20px 60px rgba(11, 11, 11, 0.15)',
    },
    challengeCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: 'clamp(20px, 4vw, 30px)',
      maxWidth: '500px',
      margin: '0 auto',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    challengeTitle: {
      fontSize: 'clamp(18px, 4vw, 24px)',
      fontWeight: '700',
      color: '#0B0B0B',
      marginBottom: '20px',
    },
    progressBar: {
      width: '100%',
      height: '40px',
      backgroundColor: '#F9FAFB',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '15px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#12B886',
      width: '68%',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      color: '#ffffff',
      fontSize: '18px',
      transition: 'width 1s ease',
    },
    notificationContainer: {
      position: 'absolute',
      top: '-60px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    notification: {
      backgroundColor: '#12B886',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(18, 184, 134, 0.3)',
      animation: 'slideIn 0.3s ease',
    },
    liveMainText: {
      fontSize: 'clamp(16px, 4vw, 22px)',
      color: '#0B0B0B',
      marginBottom: 'clamp(35px, 5vh, 50px)',
      fontWeight: '500',
      lineHeight: '1.5',
      padding: '0 20px',
    },
    liveBullets: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      marginBottom: 'clamp(40px, 6vh, 60px)',
      padding: '0 20px',
    },
    liveBullet: {
      fontSize: 'clamp(14px, 3vw, 16px)',
      color: '#6B7280',
      fontWeight: '500',
    },
    liveCta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
    },
    liveCtaButton: {
      fontSize: '16px',
      color: '#12B886',
      fontWeight: '600',
      cursor: 'pointer',
    },
    liveCtaSubtext: {
      fontSize: '14px',
      color: '#6B7280',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
    },
    featureCard: {
      backgroundColor: '#ffffff',
      padding: '35px',
      borderRadius: '20px',
      textAlign: 'center',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '20px',
    },
    footer: {
      padding: 'clamp(50px, 8vh, 70px) 0',
      borderTop: '1px solid #E5E7EB',
      marginTop: 0,
      backgroundColor: '#FFFFFF',
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 'clamp(20px, 4vh, 30px)',
      textAlign: 'center',
    },
    footerCopyright: {
      fontSize: 'clamp(13px, 2.8vw, 14px)',
      color: '#9CA3AF',
      margin: 0,
      fontWeight: '400',
    },
    footerSocials: {
      display: 'flex',
      gap: 'clamp(25px, 5vw, 40px)',
      alignItems: 'center',
    },
    footerLink: {
      fontSize: 'clamp(13px, 2.8vw, 14px)',
      color: '#6B7280',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s ease',
    },
  };

  return (
    <div style={styles.app}>
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering={true}
        menuButtonColor="#1a1a1a"
        openMenuButtonColor="#1a1a1a"
        changeMenuColorOnOpen={true}
        colors={['#7EDCC5', '#12B886']}
        logoUrl={riftLogo}
        accentColor="#12B886"
        isFixed={true}
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
      />

      <section id="home" style={styles.hero}>
        <div style={styles.ballpitContainer}>
          <Ballpit
            count={85}
            gravity={0.008}
            friction={0.998}
            wallBounce={0.95}
            followCursor={false}
            colors={[0x6FD3B2, 0x5BC9A8, 0x85DEC0]}
            minSize={0.5}
            maxSize={2.2}
            ambientColor={0xFFFFFF}
            ambientIntensity={1.8}
            lightIntensity={400}
            materialParams={{
              metalness: 0,
              roughness: 0.15,
              clearcoat: 1,
              clearcoatRoughness: 0.08,
              transmission: 0.25,
              ior: 1.45,
              thickness: 0.8,
              opacity: 0.55,
              transparent: true,
              envMapIntensity: 2.5,
              reflectivity: 1
            }}
          />
        </div>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Turn Your Chat Into
              <span style={styles.rotatingTextWrapper}>
                <RotatingText
                  texts={['Live Challenges', 'Engagement', 'Revenue', 'Fun Content']}
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </span>
            </h1>
            
            <p style={styles.heroSubtitle}>
              Create challenge goals your viewers fund together.<br />
              When the bar is full, you do the challenge — live on stream.<br />
              Works instantly as an OBS overlay.
            </p>
            
            <div style={styles.ctaContainer}>
              <button style={styles.btnHero} onClick={() => scrollToSection('download')}>
                Download OBS Overlay
              </button>
              <button style={styles.btnSecondaryHero} onClick={() => alert('Demo coming soon!')}>
                Watch Demo
              </button>
            </div>
            
            <p style={styles.heroInfo}>
              Free • Setup in 2 minutes
            </p>
            
            <div style={styles.compatibleWith}>
              <span style={styles.compatibleLabel}>Compatible with</span>
              <div style={styles.platformLogos}>
                <img 
                  src={twitchLogo} 
                  alt="Twitch" 
                  style={styles.platformLogo} 
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} 
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
                <img 
                  src={kickLogo} 
                  alt="Kick" 
                  style={styles.platformLogo} 
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} 
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
                <img 
                  src={youtubeLogo} 
                  alt="YouTube" 
                  style={styles.platformLogo} 
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} 
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
                <img 
                  src={onlyfansLogo} 
                  alt="OnlyFans" 
                  style={styles.platformLogo} 
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} 
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
                <img 
                  src={discordLogo} 
                  alt="Discord" 
                  style={styles.platformLogo} 
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} 
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
              </div>
            </div>
            
            <p style={styles.heroFooter}>
              No login needed • No code • Zero performance impact
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" style={styles.howItWorksSection}>
        <div style={styles.container}>
          <div style={styles.howItWorksContent}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            
            <div style={styles.stepsContainer}>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>1</div>
                <h3 style={styles.stepTitle}>Add to OBS</h3>
                <p style={styles.stepDescription}>
                  Paste the overlay URL into OBS as a browser source. No plugins required.
                </p>
              </div>
              
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>2</div>
                <h3 style={styles.stepTitle}>Set Challenge</h3>
                <p style={styles.stepDescription}>
                  Configure your challenge goal and funding target via the dashboard.
                </p>
              </div>
              
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>3</div>
                <h3 style={styles.stepTitle}>Go Live</h3>
                <p style={styles.stepDescription}>
                  Your chat funds the goal. The overlay updates in real-time. You complete the challenge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" style={styles.liveSection}>
        <div style={styles.container}>
          <div style={styles.liveSectionContent}>
            <h2 style={styles.sectionTitle}>See It Happen Live</h2>
            
            <div style={styles.obsMockup}>
              <div style={styles.challengeCard}>
                <div style={styles.notificationContainer}>
                  <div style={styles.notification}>+€5 from chat</div>
                  <div style={styles.notification}>+1 sub</div>
                  <div style={styles.notification}>+€2</div>
                </div>
                
                <h3 style={styles.challengeTitle}>Hot Sauce Challenge 🌶️</h3>
                
                <div style={styles.progressBar}>
                  <div style={styles.progressFill}>68%</div>
                </div>
              </div>
            </div>
            
            <p style={styles.liveMainText}>
              Your chat contributes. The goal fills. The challenge unlocks.
            </p>
            
            <div style={styles.liveBullets}>
              <div style={styles.liveBullet}>🔴 Happens live on stream</div>
              <div style={styles.liveBullet}>⚡ Real-time updates in OBS</div>
              <div style={styles.liveBullet}>🎉 You do the challenge when it's full</div>
            </div>
            
            <div style={styles.liveCta}>
              <div style={styles.liveCtaButton}>🟢 Try It Live — Free</div>
              <div style={styles.liveCtaSubtext}>Takes less than 2 minutes to add to OBS</div>
            </div>
          </div>
        </div>
      </section>

      <section id="download" style={styles.section}>
        <div style={styles.container}>
          <div style={{maxWidth: '700px', margin: '0 auto', textAlign: 'center'}}>
            <h2 style={styles.sectionTitle}>Add Live Challenges to OBS</h2>
            <p style={{fontSize: 'clamp(17px, 3.5vw, 20px)', marginBottom: 'clamp(35px, 6vh, 50px)', fontWeight: '500', color: '#6B7280', lineHeight: '1.6', padding: '0 20px'}}>
              A browser source overlay that connects your stream to community-funded challenge goals.
            </p>
            <button style={{...styles.btn, ...styles.btnPrimary, padding: 'clamp(16px, 3.5vw, 20px) clamp(35px, 7vw, 45px)', fontSize: 'clamp(16px, 3.5vw, 20px)'}} onClick={() => alert('Early access registration coming soon!')}>
              Join Early Access
            </button>
            <p style={{fontSize: 'clamp(13px, 2.8vw, 15px)', marginTop: 'clamp(18px, 4vw, 24px)', color: '#9CA3AF', fontWeight: '400'}}>
              Free to use • Works with OBS Studio • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerContent}>
            <div style={styles.footerSocials}>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.footerLink}
                onMouseEnter={(e) => e.currentTarget.style.color = '#12B886'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Twitter
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.footerLink}
                onMouseEnter={(e) => e.currentTarget.style.color = '#12B886'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                GitHub
              </a>
            </div>
            <p style={styles.footerCopyright}>© 2026 Rift</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
