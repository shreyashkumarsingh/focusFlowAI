import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import type { Statistics, BurnoutAnalysis, ProductivityInsights } from '../types';
import { TrendingUp, AlertTriangle, Clock, CheckCircle, Target, Lightbulb } from 'lucide-react';

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme colors
  const colors = {
    light: {
      bg: '#f0f4ff',
      card: '#ffffff',
      cardBg: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: '#3b82f6',
      warning: '#fffbeb',
      warningBorder: '#fef3c7'
    },
    dark: {
      bg: '#0f172a',
      card: '#1e293b',
      cardBg: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      accent: '#60a5fa',
      warning: '#1f2937',
      warningBorder: '#3f4f5f'
    }
  };

  const themeColors = colors[theme];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, burnoutRes, insightsRes] = await Promise.all([
        API.get('/stats/overview'),
        API.get('/stats/burnout'),
        API.get('/stats/insights')
      ]);
      
      setStats(statsRes.data);
      setBurnout(burnoutRes.data.fallback ? null : burnoutRes.data);
      setInsights(insightsRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={getStyles(themeColors).loading}>
        <div style={getStyles(themeColors).spinner}></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const styles = getStyles(themeColors);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Analytics Dashboard</h1>
        <p style={styles.subtitle}>AI-powered insights into your productivity</p>
      </div>

      {/* Overview Cards */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <Target color="#3b82f6" size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Total Tasks</p>
            <h3 style={styles.cardValue}>{stats?.overview.totalTasks || 0}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <CheckCircle color="#10b981" size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Completed</p>
            <h3 style={styles.cardValue}>{stats?.overview.completedTasks || 0}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <Clock color="#f59e0b" size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Focus Hours</p>
            <h3 style={styles.cardValue}>{stats?.overview.totalFocusHours || 0}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <TrendingUp color="#6366f1" size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Completion Rate</p>
            <h3 style={styles.cardValue}>{stats?.overview.completionRate || 0}%</h3>
          </div>
        </div>
      </div>

      {/* Burnout Analysis */}
      {burnout && (
        <div style={{
          ...styles.burnoutCard,
          borderLeft: `5px solid ${getRiskColor(burnout.risk_level)}`
        }}>
          <div style={styles.burnoutHeader}>
            <AlertTriangle color={getRiskColor(burnout.risk_level)} size={32} />
            <div>
              <h3 style={{ margin: 0 }}>Burnout Risk: {burnout.risk_level.toUpperCase()}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                Risk Score: {burnout.risk_score}/100
              </p>
            </div>
          </div>
          
          {burnout.factors.length > 0 && (
            <div style={styles.factorsContainer}>
              <h4>Contributing Factors:</h4>
              <ul style={styles.factorsList}>
                {burnout.factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {burnout.metrics && (
            <div style={styles.metricsGrid}>
              <div>
                <p style={styles.metricLabel}>Completion Rate</p>
                <p style={styles.metricValue}>{burnout.metrics.completion_rate}%</p>
              </div>
              <div>
                <p style={styles.metricLabel}>Estimation Error</p>
                <p style={styles.metricValue}>{burnout.metrics.avg_estimation_error}%</p>
              </div>
              <div>
                <p style={styles.metricLabel}>Work Intensity</p>
                <p style={styles.metricValue}>{burnout.metrics.intensity_ratio}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Productivity Insights */}
      {insights && insights.insights.length > 0 && (
        <div style={styles.insightsCard}>
          <div style={styles.insightsHeader}>
            <Lightbulb color="#f59e0b" size={28} />
            <h3 style={{ margin: 0 }}>AI Productivity Insights</h3>
          </div>
          <div style={styles.insightsList}>
            {insights.insights.map((insight, idx) => (
              <div key={idx} style={styles.insightItem}>
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && Object.keys(stats.categoryStats).length > 0 && (
        <div style={styles.categoriesCard}>
          <h3>Tasks by Category</h3>
          <div style={styles.categoriesGrid}>
            {Object.entries(stats.categoryStats).map(([category, data]) => (
              <div key={category} style={styles.categoryItem}>
                <div style={styles.categoryHeader}>
                  <span style={styles.categoryName}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span style={styles.categoryCount}>{data.total}</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${(data.completed / data.total) * 100}%`
                    }}
                  />
                </div>
                <p style={styles.categoryStats}>
                  {data.completed} of {data.total} completed
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getStyles = (themeColors: any): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: themeColors.bg,
    color: themeColors.text
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '20px',
    color: themeColors.text
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${themeColors.border}`,
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    color: themeColors.text
  },
  subtitle: {
    color: themeColors.textSecondary,
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: `1px solid ${themeColors.border}`
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: themeColors.cardBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardLabel: {
    color: themeColors.textSecondary,
    fontSize: '14px',
    margin: '0 0 5px 0'
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: themeColors.text
  },
  burnoutCard: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: `1px solid ${themeColors.border}`
  },
  burnoutHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  factorsContainer: {
    marginTop: '20px'
  },
  factorsList: {
    listStyle: 'none',
    padding: 0,
    margin: '10px 0 0 0'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${themeColors.border}`
  },
  metricLabel: {
    color: themeColors.textSecondary,
    fontSize: '12px',
    margin: '0 0 5px 0'
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    color: themeColors.text
  },
  insightsCard: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: `1px solid ${themeColors.border}`
  },
  insightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  insightItem: {
    padding: '12px',
    backgroundColor: themeColors.cardBg,
    color: themeColors.text,
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    border: `1px solid ${themeColors.border}`
  },
  categoriesCard: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${themeColors.border}`
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  categoryItem: {
    padding: '15px',
    backgroundColor: themeColors.cardBg,
    borderRadius: '8px',
    border: `1px solid ${themeColors.border}`
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  categoryName: {
    fontWeight: '600',
    color: themeColors.text
  },
  categoryCount: {
    color: themeColors.textSecondary
  },
  progressBar: {
    height: '8px',
    backgroundColor: themeColors.border,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease'
  },
  categoryStats: {
    fontSize: '12px',
    color: themeColors.textSecondary,
    margin: 0
  }
});

export default Analytics;
