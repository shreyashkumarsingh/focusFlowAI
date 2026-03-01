// client/src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import { LogIn, Mail, Lock, LayoutDashboard, Sun, Moon, Home } from 'lucide-react'; // Icons for the UI
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Call our Node.js Backend
      const { data } = await API.post('/auth/login', { email, password });
      
      // 2. Update the Global Auth State (and localStorage)
      login(data);
      
      console.log('Login successful!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.iconBg}>
            <LayoutDashboard color="white" size={28} />
          </div>
          <h1 style={styles.logoText}>FocusFlowAI</h1>
        </Link>
        <div style={styles.navRight}>
          <Link to="/" style={styles.backHomeLink}>
            <Home size={18} /> Back to Home
          </Link>
          <button
            onClick={toggleTheme}
            style={styles.themeToggle}
            title="Toggle Night Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>
        <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.cardIconBg}>
            <LogIn size={40} color="white" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to unlock AI-powered productivity insights</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Login to Dashboard
          </button>
        </form>
        
        <div style={styles.divider}></div>
        
        <p style={styles.signupPrompt}>
          Don't have an account? <Link to="/signup" style={styles.signupLink}>Create one</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
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
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  iconBg: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  themeToggle: {
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
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  backHomeLink: {
    textDecoration: 'none',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: '0.2s',
  } as React.CSSProperties,
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flex: 1,
    width: '100%', 
    backgroundColor: 'var(--bg-primary)', 
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(16, 185, 129, 0.1) 100%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  card: { 
    backgroundColor: 'var(--bg-secondary)',
    backdropFilter: 'blur(20px)',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
    width: '100%', 
    maxWidth: '450px',
    border: '2px solid var(--border)',
    position: 'relative',
    zIndex: 5,
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '35px' 
  },
  cardIconBg: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
  },
  title: { 
    fontSize: '28px', 
    fontWeight: '900', 
    color: 'var(--text-primary)', 
    margin: '15px 0 10px 0' 
  },
  subtitle: { 
    color: 'var(--text-secondary)', 
    fontSize: '15px',
    lineHeight: '1.5'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  inputGroup: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center' 
  },
  icon: { 
    position: 'absolute', 
    left: '15px', 
    color: 'var(--text-tertiary)',
    pointerEvents: 'none'
  },
  input: { 
    width: '100%', 
    padding: '14px 15px 14px 45px', 
    borderRadius: '10px', 
    border: '2px solid var(--border)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)', 
    fontSize: '16px', 
    outline: 'none',
    transition: '0.3s',
  },
  button: { 
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white', 
    padding: '14px', 
    borderRadius: '10px', 
    border: 'none', 
    fontSize: '16px', 
    fontWeight: '700', 
    cursor: 'pointer',
    transition: '0.3s',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
    marginTop: '10px'
  },
  error: { 
    color: 'var(--danger)', 
    backgroundColor: 'var(--bg-tertiary)',
    padding: '12px', 
    borderRadius: '8px', 
    fontSize: '14px', 
    textAlign: 'center',
    border: '2px solid var(--danger)'
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
    margin: '25px 0'
  },
  signupPrompt: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    margin: 0
  },
  signupLink: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '700',
    cursor: 'pointer'
  }
};

export default Login;