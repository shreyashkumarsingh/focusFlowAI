// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import type { Task } from '../types';
import { Plus, Clock, Trash2, LayoutDashboard, Target, User, BarChart3, Calendar, Brain, Sparkles, Sun, Moon, ExternalLink } from 'lucide-react';
import FocusTimer from '../components/FocusTimer';
import Analytics from '../components/Analytics';
import AIInsights from '../components/AIInsights';

type ViewMode = 'tasks' | 'analytics' | 'ai-insights';
type FilterStatus = 'all' | 'todo' | 'in-progress' | 'completed';
type FilterCategory = 'all' | 'work' | 'personal' | 'health' | 'learning' | 'other';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'learning' | 'other'>('other');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string>('');
  const [predictingDuration, setPredictingDuration] = useState(false);
  const [dailyStudyGoalMinutes, setDailyStudyGoalMinutes] = useState(120);
  const [taskStreak, setTaskStreak] = useState(0);
  const [studyTimerStreak, setStudyTimerStreak] = useState(0);
  const [isStudyTimerActive, setIsStudyTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchTasks();
    loadStreakData();
    loadNotificationPreference();
  }, []);

  useEffect(() => {
    if (!notificationsEnabled || typeof window === 'undefined' || !('Notification' in window)) return;

    const reminderInterval = setInterval(() => {
      sendProductivityReminder();
    }, 30 * 60 * 1000);

    return () => clearInterval(reminderInterval);
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!isStudyTimerActive || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setIsStudyTimerActive(false);
          completeStudySession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudyTimerActive, remainingSeconds]);

  const loadStreakData = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setTaskStreak(data.taskStreak || 0);
      setStudyTimerStreak(data.studyTimerStreak || 0);
      setDailyStudyGoalMinutes(data.dailyStudyGoalMinutes || 120);
      setLastStreakDate(data.lastStudyStreakDate || null);
    } catch (err) {
      console.error('Failed to load streak data');
    }
  };

  const loadNotificationPreference = async () => {
    try {
      const { data } = await API.get('/users/preferences');
      setNotificationsEnabled(Boolean(data?.preferences?.notifications));
    } catch (err) {
      console.error('Failed to load notification preferences');
    }
  };

  const sendProductivityReminder = () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !notificationsEnabled) return;

    const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
    const reminderBody = pendingTasks > 0
      ? `You have ${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''}. Keep going!`
      : 'Great pace! Add your next task and keep the momentum.';

    if (Notification.permission === 'granted') {
      new Notification('FocusFlow Reminder', { body: reminderBody });
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('FocusFlow Reminder', { body: reminderBody });
        }
      });
    }
  };

  const updateStudyGoal = async (minutes: number) => {
    try {
      await API.put('/users/study-goal', { dailyStudyGoalMinutes: minutes });
    } catch (err) {
      console.error('Failed to save study goal');
    }
  };

  const startStudyTimer = () => {
    setRemainingSeconds(dailyStudyGoalMinutes * 60);
    setIsStudyTimerActive(true);
    setTimerCompleted(false);
  };

  const stopStudyTimer = () => {
    setIsStudyTimerActive(false);
    setRemainingSeconds(0);
    setTimerCompleted(false);
  };

  const completeStudySession = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Only add streak if not already added today
      if (lastStreakDate !== today) {
        const { data } = await API.put('/users/study-session-complete', {
          date: today
        });
        setStudyTimerStreak(data.studyTimerStreak || studyTimerStreak + 1);
        setLastStreakDate(today);
      }
      
      setTimerCompleted(true);
      setIsStudyTimerActive(false);
    } catch (err) {
      console.error('Failed to complete study session');
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData: any = { 
        title, 
        estimatedMinutes, 
        priority, 
        category,
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      };
      if (dueDate) taskData.dueDate = new Date(dueDate).toISOString();
      
      const { data } = await API.post('/tasks', taskData);
      setTasks([data, ...tasks]);
      setTitle('');
      setEstimatedMinutes(30);
      setPriority('medium');
      setCategory('other');
      setDueDate('');
      setTags('');
      setAiPrediction('');
      setShowAddForm(false);
    } catch (err) {
      alert('Error adding task');
    }
  };

  const predictTaskDuration = async () => {
    setPredictingDuration(true);
    setAiPrediction('');
    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: { estimatedMinutes, priority, category },
          history: tasks
        })
      });
      const data = await response.json();
      
      if (data.predicted_minutes) {
        const message = `🤖 AI Prediction: ${data.predicted_minutes} minutes (${data.confidence} confidence). ${data.suggestion}`;
        setAiPrediction(message);
        setEstimatedMinutes(data.predicted_minutes);
      }
    } catch (error) {
      setAiPrediction('AI prediction unavailable. Using your estimate.');
    } finally {
      setPredictingDuration(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      if (activeTaskId === id) setActiveTaskId(null);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const toggleStatus = async (task: Task) => {
    // Simple toggle: todo <-> completed, or in-progress -> completed
    const nextStatus = task.status === 'todo' ? 'completed' : 
                      task.status === 'completed' ? 'todo' : 'completed';
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { 
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? new Date() : null
      });
      setTasks(tasks.map(t => t._id === task._id ? data : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Ready to crush your goals today! 🚀",
      "Every task completed is a step closer to success! 🌟",
      "Focus, learn, achieve - you've got this! 💪",
      "Small progress is still progress. Keep going! ✨",
      "Your future self will thank you for starting today! 🎯",
      "Learning is a journey, not a destination! 📚",
      "Stay focused and watch your dreams come true! 🌈",
      "The expert in anything was once a beginner! 🎓"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getStudyTip = () => {
    const tips = [
      "Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. Your brain will thank you!",
      "Break large assignments into smaller tasks. It makes them less overwhelming and easier to track!",
      "Schedule your most challenging tasks for when you're most alert. Morning person or night owl?",
      "Take regular breaks to maintain high productivity. A short walk can refresh your mind!",
      "Review your notes within 24 hours of class - it dramatically improves retention!",
      "Try teaching the material to someone else (or even a rubber duck!) - it solidifies your understanding.",
      "Create a dedicated study space free from distractions. Your brain will associate it with focus!",
      "Use different colors to organize your notes and tasks - visual cues help memory!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      work: '#3b82f6',
      personal: '#10b981',
      health: '#ef4444',
      learning: '#f59e0b',
      other: '#6366f1'
    };
    return colors[cat] || '#94a3b8';
  };

  const getPriorityColor = (pri: string) => {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[pri] || '#94a3b8';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard color="#3b82f6" />
          <h2 style={{ margin: 0 }}>FocusFlowAI</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setViewMode('tasks')} 
            style={{
              ...styles.navBtn,
              color: viewMode === 'tasks' ? '#3b82f6' : '#64748b'
            }}
          >
            <LayoutDashboard size={18} /> Tasks
          </button>
          <button 
            onClick={() => setViewMode('ai-insights')} 
            style={{
              ...styles.navBtn,
              color: viewMode === 'ai-insights' ? '#8b5cf6' : '#64748b'
            }}
          >
            <Brain size={18} /> AI Insights
          </button>
          <button 
            onClick={() => setViewMode('analytics')} 
            style={{
              ...styles.navBtn,
              color: viewMode === 'analytics' ? '#3b82f6' : '#64748b'
            }}
          >
            <BarChart3 size={18} /> Analytics
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            style={styles.navBtn}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => navigate('/analytics')} 
            style={{
              ...styles.navBtn,
              backgroundColor: '#8b5cf6',
              color: 'white',
              borderRadius: '6px',
              padding: '8px 12px'
            }}
            title="Advanced AI Analytics"
          >
            <Brain size={18} /> AI Analytics
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

      <main style={styles.main}>
        {viewMode === 'analytics' ? (
          <Analytics />
        ) : viewMode === 'ai-insights' ? (
          <AIInsights tasks={tasks} />
        ) : (
          <>
            {/* Welcome Banner */}
            <div style={styles.welcomeBanner}>
              <div style={styles.welcomeContent}>
                <h1 style={styles.welcomeTitle}>
                  👋 Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p style={styles.welcomeSubtitle}>
                  {getMotivationalQuote()}
                </p>
              </div>
              <div style={styles.streakContainer}>
                <div style={styles.streakBadge}>
                  <div style={styles.streakIcon}>🔥</div>
                  <div>
                    <div style={styles.streakNumber}>{taskStreak}</div>
                    <div style={styles.streakLabel}>Task Streak</div>
                  </div>
                </div>
                <div style={styles.streakBadge}>
                  <div style={styles.streakIcon}>⏱️</div>
                  <div>
                    <div style={styles.streakNumber}>{studyTimerStreak}</div>
                    <div style={styles.streakLabel}>Study Goal Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Timer */}
            {activeTaskId && (
              <div style={{ marginBottom: '30px' }}>
                <FocusTimer 
                  taskId={activeTaskId} 
                  onComplete={() => {
                    setActiveTaskId(null);
                    fetchTasks();
                  }} 
                />
              </div>
            )}

            {/* Quick Stats with Progress */}
            <div style={styles.quickStats}>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div style={styles.statContent}>
                  <Target color="white" size={24} />
                  <div>
                    <p style={{...styles.statLabel, color: 'rgba(255,255,255,0.9)'}}>Total Tasks</p>
                    <p style={{...styles.statValue, color: 'white'}}>{tasks.length}</p>
                  </div>
                </div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <div style={styles.statContent}>
                  <Clock color="white" size={24} />
                  <div>
                    <p style={{...styles.statLabel, color: 'rgba(255,255,255,0.9)'}}>In Progress</p>
                    <p style={{...styles.statValue, color: 'white'}}>{tasks.filter(t => t.status === 'in-progress').length}</p>
                  </div>
                </div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <div style={styles.statContent}>
                  <div style={{...styles.checkCircle, backgroundColor: 'rgba(255,255,255,0.3)'}}>✓</div>
                  <div>
                    <p style={{...styles.statLabel, color: 'rgba(255,255,255,0.9)'}}>Completed</p>
                    <p style={{...styles.statValue, color: 'white'}}>{tasks.filter(t => t.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <div style={styles.statContent}>
                  <div style={styles.percentageCircle}>
                    <span style={styles.percentageText}>
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div>
                    <p style={{...styles.statLabel, color: 'rgba(255,255,255,0.9)'}}>Success Rate</p>
                    <p style={{...styles.statValue, color: 'white', fontSize: '16px'}}>Keep it up! 🎯</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tip Card */}
            {tasks.length > 0 && (
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>💡</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipTitle}>Pro Tip for Students</h3>
                  <p style={styles.tipText}>{getStudyTip()}</p>
                </div>
              </div>
            )}

            {/* Daily Study Goal Section */}
            <div style={styles.studyGoalCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={styles.studyGoalTitle}>📚 Daily Study Goal</h3>
                  <p style={styles.studyGoalDesc}>Set your daily study time target to build your Study Goal Streak</p>
                </div>
                <div style={styles.goalDisplay}>
                  <div style={styles.goalMinutes}>{dailyStudyGoalMinutes}</div>
                  <div style={styles.goalLabel}>minutes/day</div>
                </div>
              </div>
              <div style={styles.goalSlider}>
                <input 
                  type="range" 
                  min="15" 
                  max="480" 
                  step="15"
                  value={dailyStudyGoalMinutes}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setDailyStudyGoalMinutes(newValue);
                    updateStudyGoal(newValue);
                  }}
                  style={styles.slider}
                />
              </div>
              <p style={styles.goalHint}>💪 Complete your daily study goal to build your streak and unlock achievements!</p>
              
              {!isStudyTimerActive && !timerCompleted && (
                <button 
                  onClick={startStudyTimer}
                  style={styles.startTimerBtn}
                >
                  ⏱️ Start Study Session
                </button>
              )}
            </div>

            {/* Study Timer Display */}
            {(isStudyTimerActive || timerCompleted) && (
              <div style={styles.timerContainer}>
                {timerCompleted ? (
                  <div style={styles.completionMessage}>
                    <div style={styles.celebrationIcon}>🎉</div>
                    <h2 style={styles.completionTitle}>Congratulations! 🌟</h2>
                    <p style={styles.completionText}>You've completed your study goal for today!</p>
                    <div style={styles.streakUpdateText}>
                      <span style={styles.streakEmoji}>⏱️</span>
                      <span>Study Goal Streak: <strong>{studyTimerStreak}</strong></span>
                    </div>
                    <button 
                      onClick={() => setTimerCompleted(false)}
                      style={styles.doneBtn}
                    >
                      ✓ Done
                    </button>
                  </div>
                ) : (
                  <div style={styles.timerContent}>
                    <div style={styles.timerDisplay}>
                      <div style={styles.timerNumber}>{formatTime(remainingSeconds)}</div>
                      <div style={styles.timerLabel}>Study Time Remaining</div>
                    </div>
                    
                    <div style={styles.timerProgress}>
                      <div style={{
                        ...styles.progressBar,
                        width: `${((dailyStudyGoalMinutes * 60 - remainingSeconds) / (dailyStudyGoalMinutes * 60)) * 100}%`
                      }}></div>
                    </div>
                    
                    <p style={styles.timerHint}>Keep focus! You're building your Study Goal Streak 💪</p>
                    
                    <button 
                      onClick={stopStudyTimer}
                      style={styles.stopTimerBtn}
                    >
                      ⏹️ Stop Study Session
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Unified Task Toolbar: Add Task Button + Filters */}
            {!showAddForm && (
              <div style={styles.taskToolbar}>
                {/* Left Section: Add New Task Button */}
                <button onClick={() => setShowAddForm(true)} style={styles.addTaskBtn}>
                  <Plus size={20} /> Add New Task
                </button>

                {/* Right Section: Filters */}
                <div style={styles.toolbarFilters}>
                  {/* Status Filter */}
                  <div style={styles.filterChip}>
                    <span style={styles.filterLabel}>Status</span>
                    <div style={styles.filterButtons}>
                      {(['all', 'todo', 'in-progress', 'completed'] as FilterStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          title={`Filter by ${status === 'all' ? 'all statuses' : status}`}
                          style={{
                            ...styles.filterPill,
                            backgroundColor: filterStatus === status ? '#3b82f6' : 'var(--bg-tertiary)',
                            color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                            border: filterStatus === status ? 'none' : '1px solid var(--border)'
                          }}
                        >
                          {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={styles.filterDivider}></div>

                  {/* Category Filter */}
                  <div style={styles.filterChip}>
                    <span style={styles.filterLabel}>Category</span>
                    <div style={styles.filterButtons}>
                      {(['all', 'work', 'personal', 'health', 'learning', 'other'] as FilterCategory[]).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          title={`Filter by ${cat}`}
                          style={{
                            ...styles.filterPill,
                            backgroundColor: filterCategory === cat ? getCategoryColor(cat) : 'var(--bg-tertiary)',
                            color: filterCategory === cat ? 'white' : 'var(--text-secondary)',
                            border: filterCategory === cat ? 'none' : '1px solid var(--border)'
                          }}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Task Form - Shown when adding a new task */}
            {showAddForm && (
              <form onSubmit={addTask} style={styles.form}>
                <input 
                  style={styles.input} 
                  placeholder="Task title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
                
                <div style={styles.formRow}>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={styles.select}
                  >
                    <option value="work">💼 Work</option>
                    <option value="personal">🏠 Personal</option>
                    <option value="health">💪 Health</option>
                    <option value="learning">📚 Learning</option>
                    <option value="other">📌 Other</option>
                  </select>

                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={styles.select}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <input 
                    type="number" 
                    style={styles.numberInput} 
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    placeholder="Minutes"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={predictTaskDuration}
                    disabled={predictingDuration}
                    style={styles.aiPredictBtn}
                    title="Get AI duration prediction"
                  >
                    <Sparkles size={16} /> {predictingDuration ? 'Analyzing...' : 'AI Predict'}
                  </button>
                </div>

                {aiPrediction && (
                  <div style={styles.aiPredictionBox}>
                    {aiPrediction}
                  </div>
                )}

                <div style={styles.formRow}>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{ ...styles.input, flex: 2 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={styles.addBtn}>
                    <Plus size={20}/> Add Task
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Quick Access Panel - Shows when no tasks exist */}
            {tasks.length === 0 && !showAddForm && (
              <div style={styles.quickAccessPanel}>
                <div style={styles.quickAccessHeader}>
                  <h2 style={styles.quickAccessTitle}>🚀 Get Started with Study Resources</h2>
                  <p style={styles.quickAccessSubtitle}>Quick access to popular tools for students</p>
                </div>
                
                <div style={styles.resourceGrid}>
                  {/* ChatGPT Link */}
                  <a 
                    href="https://chatgpt.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                      <span style={{ fontSize: '32px' }}>💬</span>
                    </div>
                    <h3 style={styles.resourceTitle}>ChatGPT</h3>
                    <p style={styles.resourceDesc}>AI-powered assistant for homework & questions</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* Gemini Link */}
                  <a 
                    href="https://gemini.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'}}>
                      <span style={{ fontSize: '32px' }}>✨</span>
                    </div>
                    <h3 style={styles.resourceTitle}>Google Gemini</h3>
                    <p style={styles.resourceDesc}>Google's advanced AI assistant</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* YouTube Link */}
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                      <span style={{ fontSize: '32px' }}>🎥</span>
                    </div>
                    <h3 style={styles.resourceTitle}>YouTube</h3>
                    <p style={styles.resourceDesc}>Educational tutorials & study videos</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* Stack Overflow Link */}
                  <a 
                    href="https://stackoverflow.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'}}>
                      <span style={{ fontSize: '32px' }}>💻</span>
                    </div>
                    <h3 style={styles.resourceTitle}>Stack Overflow</h3>
                    <p style={styles.resourceDesc}>Q&A for programmers & developers</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* GitHub Link */}
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}>
                      <span style={{ fontSize: '32px' }}>🐙</span>
                    </div>
                    <h3 style={styles.resourceTitle}>GitHub</h3>
                    <p style={styles.resourceDesc}>Code repositories & project examples</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* Roadmap.sh Link */}
                  <a 
                    href="https://roadmap.sh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'}}>
                      <span style={{ fontSize: '32px' }}>🗺️</span>
                    </div>
                    <h3 style={styles.resourceTitle}>Roadmap.sh</h3>
                    <p style={styles.resourceDesc}>Developer roadmaps & career paths</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* Perplexity AI Link */}
                  <a 
                    href="https://www.perplexity.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'}}>
                      <span style={{ fontSize: '32px' }}>🤖</span>
                    </div>
                    <h3 style={styles.resourceTitle}>Perplexity AI</h3>
                    <p style={styles.resourceDesc}>AI-powered research & answers</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>

                  {/* Notion Link */}
                  <a 
                    href="https://www.notion.so" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.resourceCard}
                  >
                    <div style={{...styles.resourceIcon, background: 'linear-gradient(135deg, #000000 0%, #404040 100%)'}}>
                      <span style={{ fontSize: '32px' }}>📝</span>
                    </div>
                    <h3 style={styles.resourceTitle}>Notion</h3>
                    <p style={styles.resourceDesc}>Notes, wiki & project management</p>
                    <div style={styles.resourceLink}>
                      <ExternalLink size={16} /> Open
                    </div>
                  </a>
                </div>

                {/* Call to Action */}
                <div style={styles.ctaSection}>
                  <h3 style={styles.ctaTitle}>Ready to boost your productivity? 🎯</h3>
                  <button onClick={() => setShowAddForm(true)} style={styles.ctaButton}>
                    <Plus size={20} /> Create Your First Task
                  </button>
                  <p style={styles.ctaHint}>Add tasks to get personalized AI insights and track your progress</p>
                </div>
              </div>
            )}

            {/* Task List */}
            <div style={styles.taskList}>
              {filteredTasks.length === 0 && tasks.length > 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🔍</div>
                  <h3 style={styles.emptyTitle}>No tasks match your filter</h3>
                  <p style={styles.emptyText}>Try adjusting your filters to see more tasks</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task._id} style={{
                    ...styles.taskCard,
                    borderLeft: `5px solid ${getCategoryColor(task.category || 'other')}`,
                    opacity: task.status === 'completed' ? 0.7 : 1
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ 
                          margin: 0,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </h3>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: getPriorityColor(task.priority)
                        }}>
                          {task.priority}
                        </span>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: getCategoryColor(task.category || 'other')
                        }}>
                          {task.category || 'other'}
                        </span>
                      </div>
                      
                      <div style={styles.meta}>
                        <span><Clock size={14} /> Est: {task.estimatedMinutes}m</span>
                        <span>Spent: {task.actualMinutesSpent}m</span>
                        {task.dueDate && (
                          <span><Calendar size={14} /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div style={styles.tags}>
                          {task.tags.map((tag, idx) => (
                            <span key={idx} style={styles.tag}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        onClick={() => toggleStatus(task)}
                        style={{
                          ...styles.toggleStatusBtn,
                          backgroundColor: task.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.1)',
                          borderColor: task.status === 'completed' ? '#10b981' : 'var(--border)',
                          color: task.status === 'completed' ? '#10b981' : 'var(--text-secondary)'
                        }}
                        title={`Status: ${task.status}. Click to change`}
                      >
                        {task.status === 'completed' ? '✓' : '☐'}
                      </button>
                      <button 
                        onClick={() => setActiveTaskId(task._id)} 
                        style={{
                          ...styles.actionBtn,
                          color: task.status === 'completed' ? 'var(--text-tertiary)' : '#3b82f6',
                          opacity: task.status === 'completed' ? 0.5 : 1
                        }}
                        title="Start focus session"
                        disabled={task.status === 'completed'}
                      >
                        <Target size={18} />
                      </button>
                      <button 
                        onClick={() => deleteTask(task._id)} 
                        style={{...styles.actionBtn, color: '#ef4444'}}
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
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
  main: { 
    maxWidth: '1200px', 
    margin: '40px auto', 
    padding: '0 20px' 
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  welcomeContent: { flex: 1 },
  welcomeTitle: { fontSize: '28px', fontWeight: '800', margin: '0 0 10px 0', color: 'white' },
  welcomeSubtitle: { fontSize: '16px', margin: 0, color: 'rgba(255,255,255,0.9)' },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '2px solid rgba(255,255,255,0.3)'
  },
  streakIcon: { fontSize: '32px' },
  streakNumber: { fontSize: '24px', fontWeight: '800', color: 'white', margin: 0 },
  streakLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.9)', margin: 0 },
  streakContainer: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  studyGoalCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  studyGoalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: 'var(--text-primary)'
  },
  studyGoalDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  goalDisplay: {
    textAlign: 'center',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
    padding: '15px',
    minWidth: '120px'
  },
  goalMinutes: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  goalLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '5px 0 0 0'
  },
  goalSlider: {
    margin: '15px 0'
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--border)',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    cursor: 'pointer'
  },
  goalHint: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '15px 0 0 0',
    fontStyle: 'italic'
  },
  tipCard: {
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
    boxShadow: '0 4px 15px rgba(253, 203, 110, 0.3)'
  },
  tipIcon: { fontSize: '32px', flexShrink: 0 },
  tipContent: { flex: 1 },
  tipTitle: { margin: '0 0 8px 0', color: '#2d3436', fontSize: '18px', fontWeight: '700' },
  tipText: { margin: 0, color: '#2d3436', fontSize: '14px', lineHeight: '1.6' },
  quickStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { 
    color: 'white',
    padding: '25px', 
    borderRadius: '16px', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
    transition: 'transform 0.2s'
  },
  statContent: { display: 'flex', alignItems: 'center', gap: '15px' },
  statLabel: { fontSize: '13px', margin: '0 0 5px 0', fontWeight: '500' },
  statValue: { fontSize: '28px', fontWeight: '800', margin: 0 },
  percentageCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255,255,255,0.5)'
  },
  percentageText: { fontSize: '14px', fontWeight: '800', color: 'white' },
  checkCircle: { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '700' },
  taskToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '14px',
    marginBottom: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid var(--border)',
    flexWrap: 'wrap'
  },
  addTaskBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flex: 'none'
  },
  toolbarFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    flex: 1,
    minWidth: '400px',
    flexWrap: 'wrap'
  },
  filterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  },
  filterButtons: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  filterPill: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap'
  },
  filterDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'var(--border)'
  },
  form: { backgroundColor: 'var(--bg-secondary)', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border)' },
  formRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px', cursor: 'pointer', flex: 1, backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
  numberInput: { width: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
  addBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', flex: 1 },
  cancelBtn: { padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' },
  filters: { display: 'none' },
  filterGroup: { display: 'none' },
  filterBtn: { display: 'none' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: '0.2s', border: '1px solid var(--border)' },
  meta: { display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '14px', marginTop: '8px' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: 'white' },
  tags: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  tag: { fontSize: '12px', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: '0.2s', fontSize: '18px', fontWeight: '700' },
  toggleStatusBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
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
  emptyState: { 
    textAlign: 'center', 
    padding: '80px 20px', 
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  emptyIcon: { fontSize: '64px', marginBottom: '20px' },
  emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' },
  emptyText: { fontSize: '16px', color: '#64748b', margin: '0 0 30px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
  },
  aiPredictBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    border: 'none', 
    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', 
    color: 'white', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: '0.2s'
  },
  aiPredictionBox: {
    padding: '15px',
    backgroundColor: '#f0f9ff',
    border: '2px solid #3b82f6',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  quickAccessPanel: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '16px',
    padding: '40px 30px',
    marginBottom: '40px',
    border: '2px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  quickAccessHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  quickAccessTitle: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    color: 'var(--text-primary)'
  },
  quickAccessSubtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  resourceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '25px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  resourceIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  resourceTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '10px 0  5px 0',
    color: 'var(--text-primary)'
  },
  resourceDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 15px 0',
    lineHeight: '1.4'
  },
  resourceLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: '14px'
  },
  ctaSection: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    borderRadius: '12px',
    border: '2px dashed var(--border)'
  },
  ctaTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    color: 'var(--text-primary)'
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s'
  },
  ctaHint: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '15px 0 0 0'
  },
  startTimerBtn: {
    width: '100%',
    marginTop: '15px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
  },
  timerContainer: {
    backgroundColor: 'var(--bg-secondary)',
    border: '3px solid var(--border)',
    borderRadius: '16px',
    padding: '40px 30px',
    marginBottom: '30px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    animation: 'pulse 2s infinite'
  },
  timerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px'
  },
  timerDisplay: {
    textAlign: 'center'
  },
  timerNumber: {
    fontSize: '72px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: 'monospace',
    letterSpacing: '2px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  timerLabel: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginTop: '10px',
    fontWeight: '500'
  },
  timerProgress: {
    width: '100%',
    maxWidth: '400px',
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ec4899 0%, #f5576c 100%)',
    transition: 'width 1s linear',
    borderRadius: '4px'
  },
  timerHint: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
    fontStyle: 'italic'
  },
  stopTimerBtn: {
    padding: '12px 30px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    width: '100%'
  },
  completionMessage: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  celebrationIcon: {
    fontSize: '80px',
    animation: 'bounce 1s ease-in-out'
  },
  completionTitle: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-primary)'
  },
  completionText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  streakUpdateText: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 20px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginTop: '10px'
  },
  streakEmoji: {
    fontSize: '24px'
  },
  doneBtn: {
    padding: '12px 30px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    marginTop: '10px'
  }
};

export default Dashboard;