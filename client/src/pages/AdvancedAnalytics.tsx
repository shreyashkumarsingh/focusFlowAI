// client/src/pages/AdvancedAnalytics.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { 
  AlertTriangle, Zap, Brain,
  Clock, Sun, Moon, ArrowLeft 
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Theme-aware colors
  const colors = {
    light: {
      bg: '#f0f4ff',
      bgSecondary: '#e9f5ff',
      bgTertiary: '#dbeafe',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      border: '#c7d2e0'
    },
    dark: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569'
    }
  };

  const themeColors = colors[theme];

  const styles = getStyles(themeColors);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await API.get('/ai/dashboard');
      setAiData(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>🤖 Analyzing your productivity patterns...</p>
        </div>
      </div>
    );
  }

  const procrastination = aiData?.analytics?.procrastination || {};
  const burnout = aiData?.analytics?.burnout || {};
  const focusPatterns = aiData?.analytics?.focusPatterns || {};
  const habits = aiData?.analytics?.habits || {};
  const memoryRetention = aiData?.analytics?.memoryRetention || {};
  const deadlineRisk = aiData?.analytics?.deadlineRisk || {};
  const knowledgeGaps = aiData?.analytics?.knowledgeGaps || {};
  const adaptiveExam = aiData?.analytics?.adaptiveExam || {};

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <h2 style={{ margin: 0 }}>🤖 AI Advanced Analytics</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={toggleTheme}
            style={{
              ...styles.navBtn,
              backgroundColor: theme === 'dark' ? '#3b82f6' : 'transparent',
              borderRadius: '6px',
              padding: '8px 12px'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Tabs */}
        <div style={styles.tabContainer}>
          {['overview', 'procrastination', 'burnout', 'focus', 'habits', 'resources', 'predictive', 'knowledge', 'exam'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabButton,
                borderBottomColor: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? '#3b82f6' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? '600' : '400'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>📊 Your AI Insights</h2>
            
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <Brain color="white" size={32} />
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>AI Score</p>
                  <p style={styles.statValue}>{Math.round(100 - (burnout?.risk_score || 0))}%</p>
                </div>
              </div>

              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <AlertTriangle color="white" size={32} />
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Burnout Risk</p>
                  <p style={styles.statValue}>{burnout?.risk_level || 'low'}</p>
                </div>
              </div>

              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <Zap color="white" size={32} />
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Procrastination</p>
                  <p style={styles.statValue}>{procrastination?.risk || 'low'}</p>
                </div>
              </div>

              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <Clock color="white" size={32} />
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Optimal Session</p>
                  <p style={styles.statValue}>{focusPatterns?.optimal_session_mins || 45}m</p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div style={styles.insightBox}>
              <h3 style={styles.insightTitle}>💡 Key Insights</h3>
              {burnout?.factors && burnout.factors.length > 0 ? (
                <ul style={styles.factorsList}>
                  {burnout.factors.map((factor: string, idx: number) => (
                    <li key={idx} style={styles.factorItem}>{factor}</li>
                  ))}
                </ul>
              ) : (
                <p style={styles.noData}>Great! No issues detected.</p>
              )}
              {burnout?.recovery_suggestion && (
                <div style={styles.suggestionBox}>
                  <p style={{margin: 0}}>💪 {burnout.recovery_suggestion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Procrastination Tab */}
        {activeTab === 'procrastination' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>⚠️ Procrastination Detection</h2>
            
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Risk Level: <strong style={{color: getColor(procrastination?.risk)}}>{procrastination?.risk?.toUpperCase()}</strong></h3>
                <p>Risk Score: {procrastination?.score || 0}/100</p>
              </div>

              {procrastination?.warnings && procrastination.warnings.length > 0 && (
                <div style={styles.warningsBox}>
                  <h4>⚠️ Warnings:</h4>
                  {procrastination.warnings.map((warning: string, idx: number) => (
                    <div key={idx} style={styles.warning}>{warning}</div>
                  ))}
                </div>
              )}

              {procrastination?.suggestion && (
                <div style={styles.suggestionBox}>
                  <p>{procrastination.suggestion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Burnout Tab */}
        {activeTab === 'burnout' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>🔥 Burnout Prevention</h2>
            
            <div style={styles.card}>
              <h3>Risk Assessment: <strong style={{color: getColor(burnout?.risk_level)}}>{burnout?.risk_level?.toUpperCase()}</strong></h3>

              {burnout?.metrics && (
                <div style={styles.metricsGrid}>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Completion Rate</span>
                    <span style={styles.metricValue}>{burnout.metrics.completion_rate}%</span>
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Est. Error</span>
                    <span style={styles.metricValue}>{burnout.metrics.avg_estimation_error}%</span>
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Work Intensity</span>
                    <span style={styles.metricValue}>{burnout.metrics.intensity_ratio}%</span>
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Total Hours</span>
                    <span style={styles.metricValue}>{burnout.metrics.total_hours}h</span>
                  </div>
                </div>
              )}

              {burnout?.recovery_suggestion && (
                <div style={styles.suggestionBox}>
                  <p style={{margin: 0, fontSize: '16px', fontWeight: '600'}}>{burnout.recovery_suggestion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Focus Patterns Tab */}
        {activeTab === 'focus' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>🎯 Focus Patterns</h2>
            
            <div style={styles.card}>
              <div style={styles.patternBox}>
                <h4>📅 Best Days for Focus</h4>
                <p style={styles.valueText}>{focusPatterns?.best_days?.join(', ') || 'Build history for insights'}</p>
              </div>

              <div style={styles.patternBox}>
                <h4>🕐 Most Productive Hours</h4>
                <p style={styles.valueText}>
                  {focusPatterns?.best_hours?.map((h: number) => `${h}:00`).join(', ') || 'Build history for insights'}
                </p>
              </div>

              <div style={styles.patternBox}>
                <h4>⏱️ Optimal Session Duration</h4>
                <p style={styles.valueText}>{focusPatterns?.optimal_session_mins || 45} minutes</p>
              </div>

              <div style={styles.insightBox}>
                <p style={styles.insightText}>{focusPatterns?.insight || 'Keep tracking to personalize insights!'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>🏆 Habits & Streaks</h2>
            
            <div style={styles.card}>
              {habits?.habits && habits.habits.length > 0 ? (
                <div style={styles.habitsList}>
                  {habits.habits.map((habit: any, idx: number) => (
                    <div key={idx} style={styles.habitItem}>
                      <div style={styles.habitName}>{habit.name}</div>
                      <div style={styles.habitValue}>{habit.value}</div>
                      <div style={{...styles.habitStrength, backgroundColor: getStrengthColor(habit.strength)}}>
                        {habit.strength.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>Complete more tasks to build habits 📚</p>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>📚 Recommended Resources</h2>
            
            <div style={styles.resourcesGrid}>
              {aiData?.recommendations?.resources?.map((resource: any, idx: number) => (
                <a 
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.resourceCard}
                >
                  <h4 style={{margin: '0 0 8px 0'}}>{resource.name}</h4>
                  <p style={{margin: 0, fontSize: '13px', color: 'var(--text-secondary)'}}>
                    {resource.reason}
                  </p>
                  <div style={{marginTop: '10px', fontSize: '12px', fontWeight: '600', color: '#3b82f6'}}>
                    {resource.relevance.toUpperCase()} →
                  </div>
                </a>
              )) || <p style={styles.noData}>Loading resources...</p>}
            </div>
          </div>
        )}

        {/* Predictive Intelligence Tab */}
        {activeTab === 'predictive' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>🧠 Predictive Intelligence</h2>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>📉 Deadline Risk Simulator</h3>
              <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Risk Level</span>
                  <span style={{ ...styles.metricValue, color: getColor(deadlineRisk?.risk_level) }}>
                    {(deadlineRisk?.risk_level || 'low').toUpperCase()}
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Miss Probability</span>
                  <span style={styles.metricValue}>{deadlineRisk?.miss_probability || 0}%</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Overloaded Days</span>
                  <span style={styles.metricValue}>{deadlineRisk?.overloaded_days || 0}</span>
                </div>
              </div>
              <p style={styles.noData}>{deadlineRisk?.message || 'No risk simulation available yet.'}</p>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>🧠 Forgetting-Curve Revision Planner</h3>
              <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Average Retention</span>
                  <span style={styles.metricValue}>{memoryRetention?.average_retention || 100}%</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Reviews Due Today</span>
                  <span style={styles.metricValue}>{memoryRetention?.reviews_due_today || 0}</span>
                </div>
              </div>

              {memoryRetention?.at_risk_topics?.length > 0 ? (
                <div style={styles.habitsList}>
                  {memoryRetention.at_risk_topics.map((topic: any, idx: number) => (
                    <div key={idx} style={styles.habitItem}>
                      <div style={styles.habitName}>{topic.title}</div>
                      <div style={styles.habitValue}>Retention: {topic.retention_score}%</div>
                      <div style={styles.habitValue}>Next Review: {topic.next_review_date}</div>
                      <div style={{ ...styles.habitStrength, backgroundColor: getColor(topic.urgency) }}>
                        {String(topic.urgency || 'low').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>{memoryRetention?.message || 'Complete tasks to generate review plans.'}</p>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Gaps Tab */}
        {activeTab === 'knowledge' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>🕸️ Knowledge Graph Gaps</h2>

            <div style={styles.card}>
              <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Coverage Score</span>
                  <span style={styles.metricValue}>{knowledgeGaps?.coverage_score || 0}%</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Missing Prerequisites</span>
                  <span style={styles.metricValue}>{knowledgeGaps?.missing_prerequisites?.length || 0}</span>
                </div>
              </div>

              {knowledgeGaps?.missing_prerequisites?.length > 0 ? (
                <div style={styles.habitsList}>
                  {knowledgeGaps.missing_prerequisites.map((gap: any, idx: number) => (
                    <div key={idx} style={styles.habitItem}>
                      <div style={styles.habitName}>{gap.target_concept}</div>
                      <div style={styles.habitValue}>Missing: {gap.missing_concept}</div>
                      <div style={styles.habitValue}>{gap.recommended_task}</div>
                      <div style={{ ...styles.habitStrength, backgroundColor: getColor(gap.priority) }}>
                        {String(gap.priority || 'medium').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>{knowledgeGaps?.message || 'No prerequisite gaps detected.'}</p>
              )}
            </div>
          </div>
        )}

        {/* Adaptive Exam Tab */}
        {activeTab === 'exam' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>📝 Adaptive Exam Generator</h2>

            <div style={styles.card}>
              <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Total Questions</span>
                  <span style={styles.metricValue}>{adaptiveExam?.questions?.length || 0}</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Total Marks</span>
                  <span style={styles.metricValue}>{adaptiveExam?.total_marks || 0}</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Duration</span>
                  <span style={styles.metricValue}>{adaptiveExam?.estimated_duration_mins || 0}m</span>
                </div>
              </div>

              {adaptiveExam?.questions?.length > 0 ? (
                <div style={styles.habitsList}>
                  {adaptiveExam.questions.map((q: any, idx: number) => (
                    <div key={idx} style={styles.habitItem}>
                      <div style={styles.habitName}>Q{q.id}: {q.concept}</div>
                      <div style={styles.habitValue}>{q.prompt}</div>
                      <div style={styles.habitValue}>⏱ {q.time_limit_mins} min · 🏅 {q.marks} marks</div>
                      <div style={{ ...styles.habitStrength, backgroundColor: getColor(q.difficulty === 'hard' ? 'high' : q.difficulty === 'medium' ? 'medium' : 'low') }}>
                        {String(q.difficulty || 'easy').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>{adaptiveExam?.message || 'No adaptive exam available yet.'}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const getColor = (level: string) => {
  const colors: Record<string, string> = {
    'critical': '#ef4444',
    'very-high': '#ef4444',
    'high': '#f59e0b',
    'moderate': '#f59e0b',
    'medium': '#f59e0b',
    'low': '#10b981'
  };
  return colors[level] || '#94a3b8';
};

const getStrengthColor = (strength: string) => {
  const colors: Record<string, string> = {
    'strong': '#10b981',
    'medium': '#f59e0b',
    'developing': '#3b82f6'
  };
  return colors[strength] || '#94a3b8';
};

const getStyles = (themeColors: any) => ({
  container: {
    backgroundColor: themeColors.bg,
    color: themeColors.textPrimary,
    minHeight: '100vh',
    fontFamily: 'inherit'
  },
  nav: {
    backgroundColor: themeColors.bgSecondary,
    borderBottom: `2px solid ${themeColors.border}`,
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky' as any,
    top: 0,
    zIndex: 100
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  navBtn: {
    backgroundColor: 'transparent',
    color: themeColors.textPrimary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  tabContainer: {
    display: 'flex',
    gap: '20px',
    borderBottom: `2px solid ${themeColors.border}`,
    marginBottom: '30px',
    overflow: 'x' as any
  },
  tabButton: {
    backgroundColor: 'transparent',
    color: themeColors.textSecondary,
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '12px 0',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.2s'
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 20px 0',
    color: themeColors.textPrimary
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    borderRadius: '12px',
    padding: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  statInfo: {
    flex: 1
  },
  statLabel: {
    fontSize: '12px',
    margin: '0 0 5px 0',
    opacity: 0.9,
    color: 'inherit'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
    color: 'inherit'
  },
  card: {
    backgroundColor: themeColors.bgSecondary,
    border: `1px solid ${themeColors.border}`,
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px'
  },
  cardHeader: {
    marginBottom: '20px',
    color: themeColors.textPrimary
  },
  insightBox: {
    backgroundColor: themeColors.bgTertiary,
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px'
  },
  insightTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: themeColors.textPrimary
  },
  insightText: {
    margin: 0,
    color: themeColors.textSecondary
  },
  factorsList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 15px 0'
  },
  factorItem: {
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeft: '4px solid #ef4444',
    margin: '8px 0',
    borderRadius: '4px',
    color: themeColors.textPrimary
  },
  warningsBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px'
  },
  warning: {
    padding: '8px 0',
    color: themeColors.textPrimary,
    fontSize: '14px'
  },
  suggestionBox: {
    backgroundColor: themeColors.bgTertiary,
    border: `2px solid ${themeColors.border}`,
    borderRadius: '8px',
    padding: '15px',
    marginTop: '15px',
    color: themeColors.textPrimary
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    margin: '20px 0'
  },
  metric: {
    backgroundColor: themeColors.bgTertiary,
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as any,
    gap: '8px',
    border: `1px solid ${themeColors.border}`
  },
  metricLabel: {
    fontSize: '12px',
    color: themeColors.textSecondary,
    fontWeight: '600'
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: themeColors.textPrimary
  },
  patternBox: {
    backgroundColor: themeColors.bgTertiary,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: `1px solid ${themeColors.border}`
  },
  valueText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '8px 0 0 0',
    color: '#3b82f6'
  },
  habitsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px'
  },
  habitItem: {
    backgroundColor: themeColors.bgTertiary,
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as any,
    gap: '8px',
    border: `1px solid ${themeColors.border}`
  },
  habitName: {
    fontWeight: '600',
    color: themeColors.textPrimary
  },
  habitValue: {
    fontSize: '14px',
    color: themeColors.textSecondary
  },
  habitStrength: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    textAlign: 'center' as any
  },
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px'
  },
  resourceCard: {
    backgroundColor: themeColors.bgSecondary,
    border: `1px solid ${themeColors.border}`,
    borderRadius: '8px',
    padding: '15px',
    textDecoration: 'none',
    color: themeColors.textPrimary,
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as any,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${themeColors.border}`,
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '15px',
    fontSize: '16px',
    color: themeColors.textSecondary
  },
  noData: {
    textAlign: 'center' as any,
    color: themeColors.textSecondary,
    padding: '20px',
    fontStyle: 'italic'
  }
});

export default AdvancedAnalytics;
