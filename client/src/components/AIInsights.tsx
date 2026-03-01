// client/src/components/AIInsights.tsx
import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Task } from '../types';
import { Brain, AlertTriangle, TrendingUp, Lightbulb, Target, Clock, Zap } from 'lucide-react';
import axios from 'axios';

interface AIInsightsProps {
  tasks: Task[];
}

interface BurnoutAnalysis {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  factors: string[];
  metrics: {
    completion_rate: number;
    avg_estimation_error: number;
    intensity_ratio: number;
  };
}

interface ProductivityInsights {
  insights: string[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ tasks }) => {
  const { theme } = useTheme();
  const [burnoutData, setBurnoutData] = useState<BurnoutAnalysis | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    light: {
      bg: '#f0f4ff',
      card: '#ffffff',
      cardBg: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      textTertiary: '#475569',
      border: '#e2e8f0',
      accent: '#3b82f6',
      factorBg: '#fef2f2'
    },
    dark: {
      bg: '#0f172a',
      card: '#1e293b',
      cardBg: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#cbd5e1',
      border: '#475569',
      accent: '#60a5fa',
      factorBg: '#3f2626'
    }
  };

  const themeColors = colors[theme];

  useEffect(() => {
    fetchAIAnalysis();
  }, [tasks]);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      // Fetch burnout analysis
      const burnoutResponse = await axios.post<BurnoutAnalysis>(
        'http://localhost:5001/analyze',
        { tasks }
      );
      setBurnoutData(burnoutResponse.data);

      // Fetch productivity insights
      const insightsResponse = await axios.post<ProductivityInsights>(
        'http://localhost:5001/insights',
        { tasks }
      );
      setInsights(insightsResponse.data.insights);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setInsights(['AI analysis temporarily unavailable. Keep tracking your tasks!']);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle size={24} />;
      case 'medium': return <TrendingUp size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const getRiskMessage = (level: string) => {
    switch (level) {
      case 'high':
        return 'High burnout risk detected. Consider taking breaks and reducing workload.';
      case 'medium':
        return 'Moderate stress levels. Monitor your workload and pace yourself.';
      default:
        return 'You\'re maintaining a healthy work-life balance. Keep it up!';
    }
  };

  const styles = getStyles(themeColors);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Brain size={40} color="#3b82f6" style={{ animation: 'pulse 2s infinite' }} />
        <p style={styles.loadingText}>AI analyzing your productivity patterns...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Brain size={28} color="white" />
        </div>
        <div>
          <h2 style={styles.title}>AI-Powered Insights</h2>
          <p style={styles.subtitle}>Machine Learning analysis of your productivity</p>
        </div>
      </div>

      {/* Burnout Risk Analysis */}
      {burnoutData && (
        <div style={{
          ...styles.burnoutCard,
          borderLeft: `5px solid ${getRiskColor(burnoutData.risk_level)}`
        }}>
          <div style={styles.burnoutHeader}>
            <div style={{
              ...styles.riskIconBg,
              backgroundColor: getRiskColor(burnoutData.risk_level)
            }}>
              {getRiskIcon(burnoutData.risk_level)}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={styles.burnoutTitle}>Burnout Risk Assessment</h3>
              <p style={{
                ...styles.riskLevel,
                color: getRiskColor(burnoutData.risk_level)
              }}>
                {burnoutData.risk_level.toUpperCase()} RISK ({burnoutData.risk_score}%)
              </p>
            </div>
            <div style={styles.scoreCircle}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke={getRiskColor(burnoutData.risk_level)}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - burnoutData.risk_score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={styles.scoreText}>{burnoutData.risk_score}%</div>
            </div>
          </div>

          <p style={styles.riskMessage}>{getRiskMessage(burnoutData.risk_level)}</p>

          {burnoutData.factors.length > 0 && (
            <div style={styles.factorsContainer}>
              <h4 style={styles.factorsTitle}>Key Factors:</h4>
              <div style={styles.factorsList}>
                {burnoutData.factors.map((factor, idx) => (
                  <div key={idx} style={styles.factor}>
                    <AlertTriangle size={14} color={getRiskColor(burnoutData.risk_level)} />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          {burnoutData.metrics && (
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <Target size={18} color="#3b82f6" />
                <div>
                  <p style={styles.metricLabel}>Completion Rate</p>
                  <p style={styles.metricValue}>{burnoutData.metrics.completion_rate}%</p>
                </div>
              </div>
              <div style={styles.metricCard}>
                <Clock size={18} color="#f59e0b" />
                <div>
                  <p style={styles.metricLabel}>Estimation Error</p>
                  <p style={styles.metricValue}>{burnoutData.metrics.avg_estimation_error}%</p>
                </div>
              </div>
              <div style={styles.metricCard}>
                <Zap size={18} color="#8b5cf6" />
                <div>
                  <p style={styles.metricLabel}>Work Intensity</p>
                  <p style={styles.metricValue}>{burnoutData.metrics.intensity_ratio}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Productivity Insights */}
      <div style={styles.insightsCard}>
        <div style={styles.insightsHeader}>
          <Lightbulb size={20} color="#f59e0b" />
          <h3 style={styles.insightsTitle}>Smart Recommendations</h3>
        </div>
        <div style={styles.insightsList}>
          {insights.map((insight, idx) => (
            <div key={idx} style={styles.insightItem}>
              <div style={styles.insightDot}></div>
              <p style={styles.insightText}>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getStyles = (themeColors: any): { [key: string]: React.CSSProperties } => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: themeColors.card,
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    color: themeColors.text
  },
  loadingText: {
    marginTop: '15px',
    color: themeColors.textSecondary,
    fontSize: '16px',
    fontWeight: '500',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: themeColors.card,
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    borderBottom: `1px solid ${themeColors.border}`
  },
  headerIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: themeColors.textSecondary,
  },
  burnoutCard: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${themeColors.border}`
  },
  burnoutHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
  },
  riskIconBg: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  burnoutTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: themeColors.text,
  },
  riskLevel: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: themeColors.text
  },
  scoreCircle: {
    position: 'relative',
    width: '80px',
    height: '80px',
  },
  scoreText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '18px',
    fontWeight: '800',
    color: themeColors.text,
  },
  riskMessage: {
    margin: '15px 0',
    padding: '15px',
    backgroundColor: themeColors.cardBg,
    borderRadius: '10px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: themeColors.textTertiary,
    border: `1px solid ${themeColors.border}`
  },
  factorsContainer: {
    marginTop: '15px',
  },
  factorsTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: themeColors.text,
  },
  factorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  factor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: themeColors.factorBg,
    borderRadius: '8px',
    fontSize: '13px',
    color: themeColors.textTertiary,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: themeColors.cardBg,
    borderRadius: '10px',
    border: `1px solid ${themeColors.border}`
  },
  metricLabel: {
    margin: 0,
    fontSize: '12px',
    color: themeColors.textSecondary,
  },
  metricValue: {
    margin: '5px 0 0 0',
    fontSize: '20px',
    fontWeight: '800',
    color: themeColors.text,
  },
  insightsCard: {
    backgroundColor: themeColors.card,
    color: themeColors.text,
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${themeColors.border}`
  },
  insightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  insightsTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: themeColors.text,
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: themeColors.cardBg,
    borderRadius: '10px',
    borderLeft: '3px solid #f59e0b',
    color: themeColors.text
  },
  insightDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    marginTop: '6px',
    flexShrink: 0,
  },
  insightText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
    color: themeColors.textTertiary,
  },
});

export default AIInsights;
