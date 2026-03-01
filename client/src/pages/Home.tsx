// client/src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Rocket, Shield, BarChart3, Moon, Sun, Zap, Target, Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}>
      {/* Navigation */}
      <nav style={styles.nav()}>
        <div style={styles.logo}>
          <div style={styles.iconBg()}>
            <LayoutDashboard color="white" size={28} />
          </div>
          <h1 style={styles.logoText}>FocusFlowAI</h1>
        </div>
        <div style={styles.navRight}>
          <button
            onClick={toggleTheme}
            style={styles.themeToggle()}
            title="Toggle Night Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div style={styles.navLinks}>
            <Link to="/login" style={styles.loginLink()}>Login</Link>
            <Link to="/signup" style={styles.signupBtn()}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Gradient */}
      <section style={styles.hero()}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Master Your Focus with <span style={styles.highlightText}>AI Intelligence</span>
          </h1>
          <p style={styles.heroSubtitle}>
            🤖 Advanced ML algorithms predict burnout, optimize your workflow, and deliver personalized productivity insights tailored for students.
          </p>
          <div style={styles.heroBtns}>
            <Link to="/signup" style={styles.ctaPrimary()}>
              🚀 Build Your First Task
            </Link>
            <Link to="/login" style={styles.ctaSecondary()}>
              Welcome Back →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={styles.featuresSection(isDark)}>
        <h2 style={styles.sectionTitle}>Why Students Love FocusFlowAI</h2>
        
        <div style={styles.features}>
          <div style={styles.featureCard(isDark)}>
            <Zap color="white" size={32} />
            <h3>⚡ 90%+ Accurate Predictions</h3>
            <p>Neural networks analyze your patterns to predict task durations with industry-leading accuracy.</p>
          </div>

          <div style={styles.featureCard(isDark)}>
            <Brain color="white" size={32} />
            <h3>🧠 Burnout Prevention</h3>
            <p>AI detects stress patterns 2 weeks before burnout occurs. Stay healthy, not just productive.</p>
          </div>

          <div style={styles.featureCard(isDark)}>
            <Target color="white" size={32} />
            <h3>🎯 Smart Recommendations</h3>
            <p>Get personalized suggestions to optimize your workflow based on your unique study habits.</p>
          </div>

          <div style={styles.featureCard(isDark)}>
            <BarChart3 color="white" size={32} />
            <h3>📊 Real-time Analytics</h3>
            <p>Beautiful dashboards show your progress, streak records, and productivity trends instantly.</p>
          </div>

          <div style={styles.featureCard(isDark)}>
            <Rocket color="white" size={32} />
            <h3>🚀 Lightning Fast</h3>
            <p>Built with modern tech stack. API response time under 100ms. Smooth as butter.</p>
          </div>

          <div style={styles.featureCard(isDark)}>
            <Shield color="white" size={32} />
            <h3>🔒 Bank-Level Security</h3>
            <p>Your data is encrypted with JWT & bcrypt. Privacy first, always.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection(isDark)}>
        <div style={styles.statBox(isDark)}>
          <h2 style={styles.statNumber}>1000+</h2>
          <p>Students Using</p>
        </div>
        <div style={styles.statBox(isDark)}>
          <h2 style={styles.statNumber}>500K+</h2>
          <p>Tasks Completed</p>
        </div>
        <div style={styles.statBox(isDark)}>
          <h2 style={styles.statNumber}>85%</h2>
          <p>Burnout Prevention</p>
        </div>
        <div style={styles.statBox(isDark)}>
          <h2 style={styles.statNumber}>24/7</h2>
          <p>Cloud Deployed</p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection()}>
        <h2 style={styles.ctaTitle}>Ready to Transform Your Productivity?</h2>
        <p style={styles.ctaSubtitle}>Join thousands of students already using AI to stay focused and avoid burnout.</p>
        <div style={styles.ctaBtns}>
          <Link to="/signup" style={styles.ctaPrimaryLarge()}>Create Account</Link>
          <Link to="/login" style={styles.ctaSecondaryLarge()}>Login</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer(isDark)}>
        <p>© 2026 FocusFlowAI. Built for students, by developers. ❤️</p>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink()}>Privacy</a>
          <a href="#" style={styles.footerLink()}>Terms</a>
          <a href="#" style={styles.footerLink()}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  nav: (): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 10%',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-light)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }),
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBg: (): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  logoText: {
    fontSize: '24px',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'var(--primary)',
  } as React.CSSProperties,
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  themeToggle: (): React.CSSProperties => ({
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  }),
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  loginLink: (): React.CSSProperties => ({
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
  }),
  signupBtn: (): React.CSSProperties => ({
    textDecoration: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    cursor: 'pointer',
  }),
  hero: (): React.CSSProperties => ({
    textAlign: 'center',
    padding: '80px 20px 100px 20px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(79, 184, 245, 0.08) 100%)',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  heroContent: {
    maxWidth: '900px',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '900',
    marginBottom: '20px',
    lineHeight: '1.2',
    color: 'var(--text-primary)',
  },
  highlightText: {
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'var(--primary)',
    display: 'inline-block',
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    maxWidth: '700px',
    margin: '0 auto 30px',
    lineHeight: '1.6',
  },
  heroBtns: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  ctaPrimary: (): React.CSSProperties => ({
    textDecoration: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white',
    padding: '15px 35px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'inline-block',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.5)',
    border: 'none',
  }),
  ctaSecondary: (): React.CSSProperties => ({
    textDecoration: 'none',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border)',
    padding: '13px 33px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'inline-block',
  }),
  featuresSection: (isDark: boolean): React.CSSProperties => ({
    padding: '100px 10%',
    backgroundColor: isDark ? 'var(--bg-secondary)' : 'linear-gradient(180deg, #fef3c7 0%, #dbeafe 50%, #e9d5ff 100%)',
    backgroundAttachment: 'fixed',
  }),
  sectionTitle: {
    fontSize: '42px',
    fontWeight: '900',
    textAlign: 'center' as const,
    marginBottom: '60px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'var(--primary)',
    display: 'block',
  } as React.CSSProperties,
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  featureCard: (isDark: boolean): React.CSSProperties => ({
    padding: '40px 30px',
    borderRadius: '16px',
    backgroundColor: isDark ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.85)',
    border: isDark ? '2px solid var(--border)' : '2px solid rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(59, 130, 246, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  }),
  statsSection: (isDark: boolean): React.CSSProperties => ({
    padding: '80px 10%',
    backgroundColor: isDark ? 'var(--bg-primary)' : 'linear-gradient(180deg, #fecaca 0%, #fca5a5 50%, #fed7aa 100%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    backgroundAttachment: 'fixed',
  }),
  statBox: (isDark: boolean): React.CSSProperties => ({
    textAlign: 'center' as const,
    padding: '40px 20px',
    borderRadius: '12px',
    backgroundColor: isDark ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.8)',
    border: isDark ? '2px solid var(--border)' : '2px solid rgba(255, 255, 255, 0.9)',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
  }),
  statNumber: {
    fontSize: '42px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'var(--primary)',
    margin: '0 0 10px 0',
  } as React.CSSProperties,
  ctaSection: (): React.CSSProperties => ({
    padding: '100px 20px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    color: 'white',
  }),
  ctaTitle: {
    fontSize: '48px',
    fontWeight: '900',
    marginBottom: '20px',
    color: 'white',
  },
  ctaSubtitle: {
    fontSize: '18px',
    marginBottom: '40px',
    maxWidth: '600px',
    margin: '0 auto 40px',
  },
  ctaBtns: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  ctaPrimaryLarge: (): React.CSSProperties => ({
    textDecoration: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white',
    padding: '18px 40px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'inline-block',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  }),
  ctaSecondaryLarge: (): React.CSSProperties => ({
    textDecoration: 'none',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '16px 38px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'inline-block',
  }),
  footer: (isDark: boolean): React.CSSProperties => ({
    padding: '40px 10%',
    borderTop: '1px solid var(--border)',
    backgroundColor: isDark ? 'var(--bg-secondary)' : 'linear-gradient(180deg, #f0f9ff 0%, #f5f7ff 100%)',
    textAlign: 'center' as const,
    color: 'var(--text-secondary)',
    fontSize: '14px',
  }),
  footerLinks: {
    display: 'flex',
    gap: '30px',
    justifyContent: 'center',
    marginTop: '15px',
  },
  footerLink: (): React.CSSProperties => ({
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  }),
};

export default Home;
