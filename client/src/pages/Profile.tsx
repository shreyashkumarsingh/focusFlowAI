import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { User as UserIcon, Mail, Edit2, Save, Settings as SettingsIcon, LayoutDashboard, Sun, Moon } from 'lucide-react';
import type { UserPreferences } from '../types';

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    defaultPomodoroLength: 25,
    defaultBreakLength: 5,
    notifications: true,
    weekStartDay: 'monday'
  });

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setName(data.name);
      setBio(data.bio || '');
      setAvatar(data.avatar || '');
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await API.get('/users/preferences');
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to fetch preferences');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.put('/users/profile', { name, bio, avatar });
      
      // Update auth context
      if (user) {
        login({ ...user, name: data.name, bio: data.bio, avatar: data.avatar });
      }
      
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update profile';
      const detail = err?.response?.data?.detail;
      alert(detail ? `${message}: ${detail}` : message);
      console.error('Failed to update profile', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const { data } = await API.put('/users/preferences', newPrefs);
      setPreferences(data.preferences || { ...preferences, ...newPrefs });

      if (
        newPrefs.notifications === true &&
        typeof window !== 'undefined' &&
        'Notification' in window
      ) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('Notifications enabled', {
              body: 'You will now receive productivity reminders from FocusFlow.'
            });
          }
        } else if (Notification.permission === 'granted') {
          new Notification('Notifications enabled', {
            body: 'You will now receive productivity reminders from FocusFlow.'
          });
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update preferences';
      const detail = err?.response?.data?.detail;
      alert(detail ? `${message}: ${detail}` : message);
      console.error('Failed to update preferences', err?.response?.data || err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard color="#3b82f6" />
          <h2 style={{ margin: 0 }}>FocusFlowAI</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={styles.navBtn}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            style={{...styles.navBtn, color: '#3b82f6'}}
          >
            <UserIcon size={18} /> Profile
          </button>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              ...styles.navBtn,
              backgroundColor: theme === 'dark' ? '#3b82f6' : 'transparent',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <span style={{ color: '#64748b' }}>{user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.header}>
        <h1 style={styles.title}>Profile & Settings</h1>
      </div>

      {/* Profile Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <UserIcon size={24} color="#3b82f6" />
          <h2 style={styles.sectionTitle}>Profile Information</h2>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={styles.avatarImage} />
              ) : (
                <UserIcon size={48} color="#94a3b8" />
              )}
            </div>
            {editing && (
              <input
                type="text"
                placeholder="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                style={styles.input}
              />
            )}
          </div>

          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                style={editing ? styles.input : styles.inputDisabled}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.emailDisplay}>
                <Mail size={18} color="#94a3b8" />
                <span style={{ marginLeft: '10px' }}>{user?.email}</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                style={editing ? styles.textarea : styles.textareaDisabled}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
              />
              {editing && (
                <p style={styles.charCount}>{bio.length}/500 characters</p>
              )}
            </div>

            <div style={styles.buttonGroup}>
              {editing ? (
                <>
                  <button type="submit" style={styles.saveBtn} disabled={loading}>
                    <Save size={18} /> Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(true);
                  }}
                  style={styles.editBtn}
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Settings Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <SettingsIcon size={24} color="#3b82f6" />
          <h2 style={styles.sectionTitle}>Preferences</h2>
        </div>

        <div style={styles.settingsCard}>
          <div style={styles.settingItem}>
            <div>
              <p style={styles.settingLabel}>Theme</p>
              <p style={styles.settingDescription}>Choose your interface appearance</p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                ...styles.select,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          </div>

          <div style={styles.settingItem}>
            <div>
              <p style={styles.settingLabel}>Default Pomodoro Length</p>
              <p style={styles.settingDescription}>Focus session duration (minutes)</p>
            </div>
            <input
              type="number"
              value={preferences.defaultPomodoroLength}
              onChange={(e) => handleUpdatePreferences({ 
                defaultPomodoroLength: parseInt(e.target.value) 
              })}
              min="1"
              max="60"
              style={styles.numberInput}
            />
          </div>

          <div style={styles.settingItem}>
            <div>
              <p style={styles.settingLabel}>Default Break Length</p>
              <p style={styles.settingDescription}>Break duration (minutes)</p>
            </div>
            <input
              type="number"
              value={preferences.defaultBreakLength}
              onChange={(e) => handleUpdatePreferences({ 
                defaultBreakLength: parseInt(e.target.value) 
              })}
              min="1"
              max="30"
              style={styles.numberInput}
            />
          </div>

          <div style={styles.settingItem}>
            <div>
              <p style={styles.settingLabel}>Week Start Day</p>
              <p style={styles.settingDescription}>First day of your work week</p>
            </div>
            <select
              value={preferences.weekStartDay}
              onChange={(e) => handleUpdatePreferences({ 
                weekStartDay: e.target.value as 'sunday' | 'monday' 
              })}
              style={styles.select}
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>

          <div style={styles.settingItem}>
            <div>
              <p style={styles.settingLabel}>Notifications</p>
              <p style={styles.settingDescription}>Receive productivity reminders</p>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handleUpdatePreferences({ 
                  notifications: e.target.checked 
                })}
              />
              <span style={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 40px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    fontWeight: '600',
    transition: '0.2s',
    color: 'var(--text-secondary)'
  },
  logoutBtn: {
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '5px 12px',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    fontWeight: '600'
  },
  header: {
    padding: '40px 20px 20px 20px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-primary)'
  },
  section: {
    marginBottom: '40px',
    padding: '0 20px',
    maxWidth: '900px',
    margin: '0 auto 40px auto'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-primary)'
  },
  profileCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid var(--border)'
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)'
  },
  inputDisabled: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)'
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)'
  },
  textareaDisabled: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    resize: 'vertical'
  },
  charCount: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'right',
    margin: 0
  },
  emailDisplay: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    color: '#64748b'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelBtn: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  settingsCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    border: '1px solid var(--border)'
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '25px',
    borderBottom: '1px solid var(--border)'
  },
  settingLabel: {
    fontWeight: '600',
    margin: '0 0 5px 0',
    color: 'var(--text-primary)'
  },
  settingDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  select: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    cursor: 'pointer',
    minWidth: '120px'
  },
  numberInput: {
    width: '80px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    textAlign: 'center'
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '34px'
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#cbd5e1',
    transition: '0.4s',
    borderRadius: '34px'
  }
};

export default Profile;
