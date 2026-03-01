from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Utility function to calculate burnout risk
def calculate_burnout_risk(tasks_data):
    """
    Analyzes user task patterns to detect burnout risk
    Factors: overestimation, completion rate, work intensity
    """
    if not tasks_data or len(tasks_data) == 0:
        return {
            'risk_level': 'low',
            'risk_score': 0,
            'factors': []
        }
    
    total_tasks = len(tasks_data)
    completed_tasks = len([t for t in tasks_data if t.get('status') == 'completed'])
    
    # Calculate metrics
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Calculate estimation accuracy
    estimation_errors = []
    for task in tasks_data:
        if task.get('status') == 'completed' and task.get('actualMinutesSpent', 0) > 0:
            estimated = task.get('estimatedMinutes', 0)
            actual = task.get('actualMinutesSpent', 0)
            if estimated > 0:
                error = abs(actual - estimated) / estimated
                estimation_errors.append(error)
    
    avg_estimation_error = np.mean(estimation_errors) if estimation_errors else 0
    
    # Calculate work intensity (tasks with high actual time)
    high_intensity_tasks = len([t for t in tasks_data 
                                if t.get('actualMinutesSpent', 0) > 60])
    intensity_ratio = (high_intensity_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Risk scoring algorithm
    risk_score = 0
    factors = []
    
    # Low completion rate indicates struggle
    if completion_rate < 30:
        risk_score += 30
        factors.append('Low task completion rate')
    elif completion_rate < 50:
        risk_score += 15
        factors.append('Below average completion rate')
    
    # High estimation error indicates poor planning or overwork
    if avg_estimation_error > 0.5:
        risk_score += 25
        factors.append('Significant time estimation errors')
    elif avg_estimation_error > 0.3:
        risk_score += 15
        factors.append('Moderate estimation inaccuracy')
    
    # High intensity work pattern
    if intensity_ratio > 60:
        risk_score += 25
        factors.append('High proportion of intense tasks')
    elif intensity_ratio > 40:
        risk_score += 15
        factors.append('Elevated work intensity')
    
    # Determine risk level
    if risk_score >= 50:
        risk_level = 'high'
    elif risk_score >= 25:
        risk_level = 'medium'
    else:
        risk_level = 'low'
    
    return {
        'risk_level': risk_level,
        'risk_score': min(risk_score, 100),
        'factors': factors,
        'metrics': {
            'completion_rate': round(completion_rate, 1),
            'avg_estimation_error': round(avg_estimation_error * 100, 1),
            'intensity_ratio': round(intensity_ratio, 1)
        }
    }

def predict_task_duration(task_data, historical_tasks):
    """
    Predicts actual task duration based on historical patterns
    Uses similar tasks and user's past estimation accuracy
    """
    estimated_minutes = task_data.get('estimatedMinutes', 30)
    priority = task_data.get('priority', 'medium')
    
    if not historical_tasks or len(historical_tasks) == 0:
        return {
            'predicted_minutes': estimated_minutes,
            'confidence': 'low',
            'suggestion': 'Start with your estimate'
        }
    
    # Find similar completed tasks
    similar_tasks = [t for t in historical_tasks 
                     if t.get('status') == 'completed' 
                     and t.get('priority') == priority
                     and t.get('actualMinutesSpent', 0) > 0]
    
    if not similar_tasks:
        similar_tasks = [t for t in historical_tasks 
                        if t.get('status') == 'completed'
                        and t.get('actualMinutesSpent', 0) > 0]
    
    if similar_tasks:
        # Calculate user's typical estimation bias
        ratios = []
        for task in similar_tasks:
            estimated = task.get('estimatedMinutes', 0)
            actual = task.get('actualMinutesSpent', 0)
            if estimated > 0:
                ratios.append(actual / estimated)
        
        if ratios:
            avg_ratio = np.mean(ratios)
            predicted = int(estimated_minutes * avg_ratio)
            
            confidence = 'high' if len(ratios) >= 5 else 'medium'
            
            if avg_ratio > 1.2:
                suggestion = f'You typically underestimate by {int((avg_ratio - 1) * 100)}%'
            elif avg_ratio < 0.8:
                suggestion = f'You typically overestimate by {int((1 - avg_ratio) * 100)}%'
            else:
                suggestion = 'Your estimates are generally accurate'
            
            return {
                'predicted_minutes': predicted,
                'confidence': confidence,
                'suggestion': suggestion,
                'historical_avg_ratio': round(avg_ratio, 2)
            }
    
    return {
        'predicted_minutes': estimated_minutes,
        'confidence': 'low',
        'suggestion': 'Build more task history for better predictions'
    }

def generate_productivity_insights(tasks_data):
    """
    Generates actionable insights from task patterns
    """
    insights = []
    
    if not tasks_data or len(tasks_data) == 0:
        return ['Start adding tasks to see personalized insights!']
    
    # Analyze completion patterns
    completed = [t for t in tasks_data if t.get('status') == 'completed']
    in_progress = [t for t in tasks_data if t.get('status') == 'in-progress']
    todo = [t for t in tasks_data if t.get('status') == 'todo']
    
    if len(in_progress) > 5:
        insights.append(f'⚠️ You have {len(in_progress)} tasks in progress. Focus on completing a few before starting new ones.')
    
    if len(todo) > 10:
        insights.append(f'📋 Your backlog has {len(todo)} tasks. Consider prioritizing or archiving some.')
    
    # Analyze time spent
    total_minutes = sum(t.get('actualMinutesSpent', 0) for t in completed)
    if total_minutes > 0:
        avg_task_time = total_minutes / len(completed) if completed else 0
        insights.append(f'⏱️ Your average completed task takes {int(avg_task_time)} minutes.')
    
    # Analyze priority distribution
    high_priority = len([t for t in tasks_data if t.get('priority') == 'high'])
    if high_priority > len(tasks_data) * 0.5:
        insights.append('🎯 Too many high-priority tasks can lead to stress. Try focusing on top 3.')
    
    # Completion streak
    if len(completed) >= 5:
        insights.append(f'🔥 Great job! You\'ve completed {len(completed)} tasks. Keep the momentum!')
    
    return insights if insights else ['Keep working on your tasks to unlock insights!']

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'FocusFlowAI ML Analytics Engine',
        'status': 'operational',
        'version': '2.0.0',
        'endpoints': ['/analyze', '/predict', '/insights']
    })

@app.route('/analyze', methods=['POST'])
def analyze_burnout():
    """
    Endpoint to analyze burnout risk
    Expects: { "tasks": [...] }
    """
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        result = calculate_burnout_risk(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_duration():
    """
    Endpoint to predict task duration
    Expects: { "task": {...}, "history": [...] }
    """
    try:
        data = request.get_json()
        task = data.get('task', {})
        history = data.get('history', [])
        
        result = predict_task_duration(task, history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/insights', methods=['POST'])
def get_insights():
    """
    Endpoint to get productivity insights
    Expects: { "tasks": [...] }
    """
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        insights = generate_productivity_insights(tasks)
        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
