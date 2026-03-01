// client/src/components/FocusTimer.tsx
import React, { useState, useEffect } from 'react';
import { Play, Square, Check } from 'lucide-react';
import API from '../api/axios';

interface Props {
  taskId: string;
  onComplete: () => void;
}

const FocusTimer: React.FC<Props> = ({ taskId, onComplete }) => {
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      handleSessionEnd();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleSessionEnd = async () => {
    setIsActive(false);
    if (mode === 'work') {
      try {
        // Here we send the "Behavioral Data" to the backend
        // We tell the backend: "User just spent 25 mins on this specific task"
        await API.put(`/tasks/${taskId}`, {
          actualMinutesSpent: 25, // For now, we increment by 25
          status: 'in-progress'
        });
        alert("Focus Session Complete! Time for a break.");
        setMode('break');
        setSeconds(5 * 60);
      } catch (err) {
        console.error("Failed to save session data");
      }
    } else {
      setMode('work');
      setSeconds(25 * 60);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={styles.timerCard}>
      <h4 style={{ margin: '0 0 10px 0' }}>{mode === 'work' ? '🚀 Focus Mode' : '☕ Break Time'}</h4>
      <div style={styles.timeDisplay}>{formatTime(seconds)}</div>
      
      <div style={styles.controls}>
        {!isActive ? (
          <button onClick={() => setIsActive(true)} style={styles.startBtn}>
            <Play size={16} /> Start
          </button>
        ) : (
          <button onClick={() => setIsActive(false)} style={styles.stopBtn}>
            <Square size={16} /> Pause
          </button>
        )}
        <button onClick={onComplete} style={styles.completeBtn}>
          <Check size={16} /> Finish Task
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  timerCard: { backgroundColor: '#1e293b', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  timeDisplay: { fontSize: '48px', fontWeight: 'bold', margin: '15px 0', fontFamily: 'monospace' },
  controls: { display: 'flex', justifyContent: 'center', gap: '10px' },
  startBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  stopBtn: { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  completeBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default FocusTimer;