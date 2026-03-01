from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from collections import Counter
import json

app = Flask(__name__)
CORS(app)

# ============================================================================
# 1. PROCRASTINATION DETECTION
# ============================================================================
def detect_procrastination_risk(tasks_data, user_behavior):
    """
    Detects if user is likely to procrastinate on a task
    Factors: deadline pressure, task difficulty, past procrastination patterns
    """
    if not tasks_data:
        return {'risk': 'low', 'score': 0, 'warning': None}
    
    today = datetime.now()
    procrastination_score = 0
    warnings = []
    
    for task in tasks_data:
        if task.get('status') != 'todo':
            continue
            
        # Check deadline pressure
        if 'dueDate' in task:
            due = datetime.fromisoformat(task['dueDate'].replace('Z', '+00:00'))
            days_until_due = (due - today).days
            
            if days_until_due <= 1:
                procrastination_score += 40
                warnings.append(f"Task due in {days_until_due} days! High procrastination risk")
            elif days_until_due <= 3:
                procrastination_score += 25
                warnings.append(f"Task due in {days_until_due} days")
            elif days_until_due <= 7:
                procrastination_score += 10
        
        # Check task difficulty (high difficulty + low progress = procrastination)
        if task.get('priority') == 'high' and task.get('estimatedMinutes', 30) > 60:
            procrastination_score += 20
            warnings.append("Complex/high-priority task detected")
    
    risk = 'high' if procrastination_score >= 60 else ('medium' if procrastination_score >= 30 else 'low')
    
    return {
        'risk': risk,
        'score': min(procrastination_score, 100),
        'warnings': warnings,
        'suggestion': get_procrastination_intervention(risk)
    }

def get_procrastination_intervention(risk_level):
    """Provides intervention strategy based on procrastination risk"""
    strategies = {
        'high': '🚨 URGENT: Break this task into 5-min subtasks. Start NOW. Set a timer for 25 mins.',
        'medium': '⚠️ This task has procrastination risk. Start with the first 15 minutes.',
        'low': '✅ Go ahead at your own pace. You\'re on track!'
    }
    return strategies.get(risk_level, 'Keep working!')

# ============================================================================
# 2. FOCUS PATTERN ANALYSIS
# ============================================================================
def analyze_focus_patterns(tasks_data):
    """
    Identifies when user is most productive
    Returns: best time of day, day of week, optimal session duration
    """
    if not tasks_data or len(tasks_data) < 5:
        return {
            'best_hours': [],
            'best_days': [],
            'optimal_session_mins': 45,
            'insight': 'Need at least 5 completed tasks to analyze patterns'
        }
    
    completed_tasks = [t for t in tasks_data if t.get('status') == 'completed']
    
    # Analyze by hour of day
    hours = []
    days = []
    completion_times = []
    
    for task in completed_tasks:
        if 'completedAt' in task:
            try:
                completed_dt = datetime.fromisoformat(task['completedAt'].replace('Z', '+00:00'))
                hours.append(completed_dt.hour)
                days.append(completed_dt.weekday())
                completion_times.append(task.get('actualMinutesSpent', 0))
            except:
                pass
    
    # Find best hours (when you complete most tasks)
    if hours:
        hour_counts = Counter(hours)
        best_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        best_hours_list = [h[0] for h in best_hours]
    else:
        best_hours_list = []
    
    # Find best days
    if days:
        day_counts = Counter(days)
        best_days = sorted(day_counts.items(), key=lambda x: x[1], reverse=True)[:2]
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        best_days_list = [day_names[d[0]] for d in best_days]
    else:
        best_days_list = []
    
    # Find optimal session duration
    if completion_times:
        optimal_session = int(np.median([t for t in completion_times if t > 0]))
        optimal_session = max(20, min(optimal_session, 120))
    else:
        optimal_session = 45
    
    return {
        'best_hours': best_hours_list,
        'best_days': best_days_list,
        'optimal_session_mins': optimal_session,
        'insight': f'You\'re most productive at {optimal_session}min sessions, best on {", ".join(best_days_list)}'
    }

# ============================================================================
# 3. ADAPTIVE DIFFICULTY SCORING
# ============================================================================
def calculate_adaptive_difficulty(task_data, historical_tasks):
    """
    Scores task difficulty from 1-100 based on user's history
    Not a generic score, but personalized to the student
    """
    estimated_mins = task_data.get('estimatedMinutes', 30)
    priority = task_data.get('priority', 'medium')
    category = task_data.get('category', 'other')
    
    if not historical_tasks or len(historical_tasks) < 3:
        # Generic scoring if not enough history
        base_score = {
            'low': 20,
            'medium': 50,
            'high': 80
        }.get(priority, 50)
        return {'difficulty_score': base_score, 'confidence': 'low'}
    
    # Find similar completed tasks
    similar = [t for t in historical_tasks 
               if t.get('status') == 'completed' and t.get('category') == category]
    
    if not similar:
        similar = [t for t in historical_tasks if t.get('status') == 'completed']
    
    # Calculate metrics
    completion_time = int(np.mean([t.get('actualMinutesSpent', t.get('estimatedMinutes', 30)) 
                                   for t in similar[:10]]))
    
    # Difficulty = how it compares to YOUR average
    if completion_time == 0:
        difficulty = 50
    else:
        difficulty = min(100, int((estimated_mins / completion_time) * 50 + 25))
    
    # Adjust for priority
    priority_boost = {'high': 15, 'medium': 0, 'low': -10}.get(priority, 0)
    difficulty = max(1, min(100, difficulty + priority_boost))
    
    return {
        'difficulty_score': difficulty,
        'your_avg_time': completion_time,
        'estimated_time': estimated_mins,
        'confidence': 'high' if len(similar) >= 5 else 'medium'
    }

# ============================================================================
# 4. PERSONALIZED SCHEDULE GENERATOR
# ============================================================================
def generate_optimal_schedule(tasks_data, focus_patterns, available_hours=4):
    """
    Generates optimal study schedule based on:
    - User's focus patterns
    - Task priorities and deadlines
    - Available time
    """
    if not tasks_data:
        return {
            'schedule': [],
            'message': 'Add tasks to generate schedule'
        }
    
    todo_tasks = [t for t in tasks_data if t.get('status') == 'todo']
    
    if not todo_tasks:
        return {
            'schedule': [],
            'message': 'No pending tasks'
        }
    
    # Sort by: deadline (urgent first), then priority
    def task_sort_key(t):
        due = t.get('dueDate')
        if due:
            try:
                due_dt = datetime.fromisoformat(due.replace('Z', '+00:00'))
                days_until = (due_dt - datetime.now()).total_seconds() / 86400
            except:
                days_until = 99
        else:
            days_until = 99
        
        priority_val = {'high': 0, 'medium': 1, 'low': 2}.get(t.get('priority'), 1)
        return (days_until, priority_val)
    
    sorted_tasks = sorted(todo_tasks, key=task_sort_key)
    
    # Generate schedule
    schedule = []
    best_hours = focus_patterns.get('best_hours', [9, 14, 19])
    session_duration = focus_patterns.get('optimal_session_mins', 45)
    
    time_remaining = available_hours * 60
    hour_idx = 0
    
    for task in sorted_tasks:
        if time_remaining <= 0:
            break
        
        task_time = task.get('estimatedMinutes', 30)
        if task_time > time_remaining:
            task_time = time_remaining
        
        session_hour = best_hours[hour_idx % len(best_hours)] if best_hours else 9
        
        schedule.append({
            'task_id': task.get('_id'),
            'title': task.get('title'),
            'duration_mins': task_time,
            'suggested_hour': session_hour,
            'priority': task.get('priority')
        })
        
        time_remaining -= task_time
        hour_idx += 1
    
    return {
        'schedule': schedule,
        'total_tasks': len(schedule),
        'total_time': available_hours * 60 - time_remaining,
        'message': f'Optimized schedule with {len(schedule)} tasks'
    }

# ============================================================================
# 5. REAL-TIME FOCUS COACH
# ============================================================================
def get_focus_coach_message(active_session_minutes, task_difficulty, focus_patterns):
    """
    Provides real-time encouragement and focus tips during study sessions
    """
    messages = []
    
    if active_session_minutes < 5:
        messages.append("🚀 Great start! Keep that momentum going!")
    elif active_session_minutes == 25:
        messages.append("⏱️ You've hit the 25-min mark. Great! Nearly time for a break.")
    elif active_session_minutes == 45:
        messages.append("🎯 Awesome focus! Consider a 5-min break soon.")
    elif active_session_minutes >= 60:
        messages.append("🏆 You've been at it for an hour! Time for a real break? (15-20 mins)")
    
    if task_difficulty > 75:
        messages.append("💪 This is a challenging task - break it into smaller chunks if needed!")
    elif task_difficulty < 30:
        messages.append("✨ This should be quick! Good warm-up task!")
    
    optimal_session = focus_patterns.get('optimal_session_mins', 45)
    if active_session_minutes == optimal_session:
        messages.append(f"💡 You're at your optimal {optimal_session}-min session length!")
    
    return {
        'messages': messages,
        'elapsed_minutes': active_session_minutes,
        'encouragement': messages[0] if messages else "You're doing great! Stay focused 🎯"
    }

# ============================================================================
# 6. INTELLIGENT TASK BREAKDOWN
# ============================================================================
def breakdown_complex_task(task_title, estimated_minutes, historical_tasks=[]):
    """
    AI breaks down complex tasks into optimal subtasks
    Uses NLP-like pattern matching and historical data
    """
    # Keywords that indicate complex/large tasks
    complexity_keywords = ['learn', 'build', 'project', 'implement', 'develop', 'create', 'design']
    is_complex = any(kw in task_title.lower() for kw in complexity_keywords)
    
    if estimated_minutes < 45 or not is_complex:
        return {
            'needs_breakdown': False,
            'subtasks': [],
            'suggestion': 'This task size is manageable as-is!'
        }
    
    # Generate subtasks based on task type
    subtasks = []
    
    if 'learn' in task_title.lower():
        subtasks = [
            {'title': f'Research: {task_title.replace("Learn ", "")}', 'duration': int(estimated_minutes * 0.25)},
            {'title': f'Study fundamentals', 'duration': int(estimated_minutes * 0.35)},
            {'title': f'Hands-on practice', 'duration': int(estimated_minutes * 0.25)},
            {'title': f'Review & consolidate notes', 'duration': int(estimated_minutes * 0.15)}
        ]
    elif 'build' in task_title.lower() or 'create' in task_title.lower():
        subtasks = [
            {'title': f'Plan & design:', 'duration': int(estimated_minutes * 0.20)},
            {'title': f'Setup environment', 'duration': int(estimated_minutes * 0.15)},
            {'title': f'Core development', 'duration': int(estimated_minutes * 0.50)},
            {'title': f'Testing & debugging', 'duration': int(estimated_minutes * 0.10)},
            {'title': f'Documentation', 'duration': int(estimated_minutes * 0.05)}
        ]
    else:
        # Generic breakdown
        subtasks = [
            {'title': f'Phase 1: Preparation', 'duration': int(estimated_minutes * 0.20)},
            {'title': f'Phase 2: Main work', 'duration': int(estimated_minutes * 0.60)},
            {'title': f'Phase 3: Review & finalize', 'duration': int(estimated_minutes * 0.20)}
        ]
    
    return {
        'needs_breakdown': True,
        'subtasks': subtasks,
        'total_duration': sum(s['duration'] for s in subtasks),
        'suggestion': f'This task can be effectively broken into {len(subtasks)} subtasks'
    }

# ============================================================================
# 7. BURNOUT PREVENTION
# ============================================================================
def calculate_burnout_risk(tasks_data):
    """Advanced burnout detection with prevention recommendations"""
    if not tasks_data or len(tasks_data) == 0:
        return {
            'risk_level': 'low',
            'risk_score': 0,
            'factors': [],
            'recovery_suggestion': None
        }
    
    total_tasks = len(tasks_data)
    completed_tasks = len([t for t in tasks_data if t.get('status') == 'completed'])
    in_progress = [t for t in tasks_data if t.get('status') == 'in-progress']
    
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Calculate metrics
    estimation_errors = []
    total_hours_spent = 0
    
    for task in tasks_data:
        if task.get('status') == 'completed' and task.get('actualMinutesSpent', 0) > 0:
            estimated = task.get('estimatedMinutes', 0)
            actual = task.get('actualMinutesSpent', 0)
            if estimated > 0:
                error = abs(actual - estimated) / estimated
                estimation_errors.append(error)
            total_hours_spent += actual
    
    avg_estimation_error = np.mean(estimation_errors) if estimation_errors else 0
    high_intensity_tasks = len([t for t in tasks_data if t.get('actualMinutesSpent', 0) > 60])
    intensity_ratio = (high_intensity_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    risk_score = 0
    factors = []
    recovery_suggestion = None
    
    # Scoring logic
    if completion_rate < 30:
        risk_score += 30
        factors.append('⚠️ Low task completion rate (may indicate overwhelm)')
    elif completion_rate < 50:
        risk_score += 15
        factors.append('📊 Below average completion rate')
    
    if avg_estimation_error > 0.5:
        risk_score += 25
        factors.append('⏱️ Significant underestimation of tasks')
    elif avg_estimation_error > 0.3:
        risk_score += 15
        factors.append('📉 Moderate estimation errors')
    
    if intensity_ratio > 60:
        risk_score += 25
        factors.append('🔥 Very high work intensity')
    elif intensity_ratio > 40:
        risk_score += 15
        factors.append('💪 Elevated work intensity')
    
    if len(in_progress) > 7:
        risk_score += 20
        factors.append('📋 Too many tasks in progress')
    
    if total_hours_spent > 480:  # More than 8 hours
        risk_score += 10
        factors.append('⏰ Excessive work hours detected')
    
    # Determine risk level
    if risk_score >= 60:
        risk_level = 'critical'
        recovery_suggestion = '🚨 CRITICAL: Take a 2-hour break. Do something physical. Come back fresh.'
    elif risk_score >= 50:
        risk_level = 'high'
        recovery_suggestion = '🛑 HIGH: Take a 1-hour break. You need rest. Step outside, stretch, hydrate.'
    elif risk_score >= 25:
        risk_level = 'medium'
        recovery_suggestion = '⚠️ MEDIUM: Take a 30-min break. Go for a short walk or meditation.'
    else:
        risk_level = 'low'
        recovery_suggestion = '✅ You\'re doing well! Keep hydrated and take small breaks.'
    
    return {
        'risk_level': risk_level,
        'risk_score': min(risk_score, 100),
        'factors': factors,
        'recovery_suggestion': recovery_suggestion,
        'metrics': {
            'completion_rate': round(completion_rate, 1),
            'avg_estimation_error': round(avg_estimation_error * 100, 1),
            'intensity_ratio': round(intensity_ratio, 1),
            'total_hours': round(total_hours_spent / 60, 1)
        }
    }

# ============================================================================
# 8. SMART LEARNING RESOURCE RECOMMENDER
# ============================================================================
def recommend_resources(task_title, category, difficulty_score):
    """
    Recommends learning resources based on task type and difficulty
    """
    resources = []
    
    task_lower = task_title.lower()
    
    # Coding/Programming tasks
    if any(x in task_lower for x in ['code', 'program', 'api', 'database', 'sql', 'javascript', 'python']):
        resources.append({
            'name': 'Stack Overflow',
            'url': 'https://stackoverflow.com',
            'relevance': 'high',
            'reason': 'Perfect for coding problems'
        })
        resources.append({
            'name': 'GitHub',
            'url': 'https://github.com',
            'relevance': 'high',
            'reason': 'View example projects'
        })
    
    # General learning
    if difficulty_score < 40:
        resources.append({
            'name': 'YouTube',
            'url': 'https://youtube.com',
            'relevance': 'high',
            'reason': 'Visual tutorials for quick learning'
        })
        resources.append({
            'name': 'Khan Academy',
            'url': 'https://www.khanacademy.org',
            'relevance': 'high',
            'reason': 'Foundational concepts'
        })
    
    # Complex tasks
    if difficulty_score > 70:
        resources.append({
            'name': 'Roadmap.sh',
            'url': 'https://roadmap.sh',
            'relevance': 'high',
            'reason': 'Structured learning paths'
        })
    
    # General research/quick answers
    resources.append({
        'name': 'ChatGPT',
        'url': 'https://chatgpt.com',
        'relevance': 'high',
        'reason': 'AI assistance for questions'
    })
    resources.append({
        'name': 'Perplexity AI',
        'url': 'https://www.perplexity.ai',
        'relevance': 'medium',
        'reason': 'Research and detailed answers'
    })
    
    return {
        'resources': resources,
        'message': f'Recommended {len(resources)} resources for: {task_title}'
    }

# ============================================================================
# 9. HABIT FORMATION TRACKER
# ============================================================================
def analyze_habits(tasks_data):
    """
    Identifies study habits and patterns for habit formation
    """
    if not tasks_data or len(tasks_data) < 10:
        return {
            'habits': [],
            'message': 'Need at least 10 completed tasks to identify habits'
        }
    
    completed_tasks = [t for t in tasks_data if t.get('status') == 'completed']
    
    habits = []
    
    # Study location/time consistency
    study_hours = []
    for task in completed_tasks:
        if 'completedAt' in task:
            try:
                dt = datetime.fromisoformat(task['completedAt'].replace('Z', '+00:00'))
                study_hours.append(dt.hour)
            except:
                pass
    
    if study_hours:
        most_common_hour = Counter(study_hours).most_common(1)[0][0]
        habits.append({
            'name': 'Consistent Study Time',
            'value': f'{most_common_hour}:00 - {most_common_hour + 1}:00',
            'strength': 'strong' if len(Counter(study_hours)) < 5 else 'variable'
        })
    
    # Task completion consistency
    if len(completed_tasks) >= 10:
        habits.append({
            'name': 'Task Completion Habit',
            'value': f'{len(completed_tasks)} tasks completed',
            'strength': 'strong' if len(completed_tasks) >= 20 else 'developing'
        })
    
    # Category preference
    categories = [t.get('category') for t in completed_tasks if 'category' in t]
    if categories:
        most_common_cat = Counter(categories).most_common(1)[0][0]
        habits.append({
            'name': 'Preferred Task Category',
            'value': most_common_cat,
            'strength': 'strong'
        })
    
    return {
        'habits': habits,
        'total_habit_strength': 'strong' if len(habits) >= 3 else 'developing'
    }

# ============================================================================
# 10. FORGETTING-CURVE REVISION PLANNER (NEW)
# ============================================================================
def estimate_memory_retention(tasks_data):
    """
    Estimates memory retention for completed topics/tasks and recommends review windows
    based on a simplified forgetting-curve model.
    """
    completed = [t for t in tasks_data if t.get('status') == 'completed']

    if not completed:
        return {
            'at_risk_topics': [],
            'average_retention': 100,
            'reviews_due_today': 0,
            'message': 'Complete some tasks to start memory-retention tracking'
        }

    now = datetime.now()
    topic_scores = []

    for task in completed:
        raw_date = task.get('completedAt') or task.get('updatedAt') or task.get('createdAt')
        if not raw_date:
            continue

        try:
            completed_dt = datetime.fromisoformat(str(raw_date).replace('Z', '+00:00')).replace(tzinfo=None)
        except Exception:
            continue

        days_since = max(0, (now - completed_dt).days)

        estimated_minutes = task.get('estimatedMinutes', 30) or 30
        priority = task.get('priority', 'medium')

        # Difficulty-based half-life: harder tasks decay faster
        base_half_life = 4.5
        if priority == 'high':
            base_half_life -= 1.0
        elif priority == 'low':
            base_half_life += 0.8

        if estimated_minutes >= 90:
            base_half_life -= 0.8
        elif estimated_minutes <= 25:
            base_half_life += 0.6

        half_life = max(1.5, base_half_life)
        retention = max(1, min(100, int(100 * np.exp(-days_since / half_life))))

        # If retention is low, schedule sooner
        next_review_in_days = 0 if retention <= 45 else (1 if retention <= 65 else 3)

        topic_scores.append({
            'task_id': task.get('_id'),
            'title': task.get('title', 'Untitled Task'),
            'retention_score': retention,
            'days_since_completion': days_since,
            'next_review_date': (now + timedelta(days=next_review_in_days)).strftime('%Y-%m-%d'),
            'urgency': 'high' if retention <= 45 else ('medium' if retention <= 65 else 'low')
        })

    if not topic_scores:
        return {
            'at_risk_topics': [],
            'average_retention': 100,
            'reviews_due_today': 0,
            'message': 'Not enough timestamped completions to model retention yet'
        }

    at_risk = sorted(topic_scores, key=lambda x: x['retention_score'])[:6]
    reviews_due_today = len([t for t in topic_scores if t['urgency'] == 'high'])
    average_retention = int(np.mean([t['retention_score'] for t in topic_scores]))

    return {
        'at_risk_topics': at_risk,
        'average_retention': average_retention,
        'reviews_due_today': reviews_due_today,
        'message': 'Review low-retention topics first to improve long-term memory'
    }

# ============================================================================
# 11. DEADLINE RISK SIMULATOR (NEW)
# ============================================================================
def simulate_deadline_risk(tasks_data, daily_capacity_minutes=120):
    """
    Simulates deadline miss risk using capacity-vs-workload Monte Carlo runs.
    Returns probability of missing at least one deadline.
    """
    todo_tasks = [t for t in tasks_data if t.get('status') in ['todo', 'in-progress'] and t.get('dueDate')]

    if not todo_tasks:
        return {
            'risk_level': 'low',
            'miss_probability': 0,
            'overloaded_days': 0,
            'critical_tasks': [],
            'message': 'No dated pending tasks detected'
        }

    now = datetime.now()
    workload = []

    for task in todo_tasks:
        try:
            due_dt = datetime.fromisoformat(str(task.get('dueDate')).replace('Z', '+00:00')).replace(tzinfo=None)
        except Exception:
            continue

        days_left = max(1, (due_dt - now).days)
        estimated = float(task.get('estimatedMinutes', 30) or 30)
        spent = float(task.get('actualMinutesSpent', 0) or 0)
        remaining = max(10, estimated - spent)

        workload.append({
            'title': task.get('title', 'Untitled Task'),
            'days_left': days_left,
            'remaining_minutes': remaining,
            'priority': task.get('priority', 'medium')
        })

    if not workload:
        return {
            'risk_level': 'low',
            'miss_probability': 0,
            'overloaded_days': 0,
            'critical_tasks': [],
            'message': 'No valid due dates found to simulate'
        }

    simulations = 250
    misses = 0
    overloaded_days = 0

    for _ in range(simulations):
        run_miss = False
        for task in workload:
            productivity_factor = float(np.clip(np.random.normal(1.0, 0.22), 0.55, 1.45))
            effective_daily_capacity = max(30, daily_capacity_minutes * productivity_factor)
            required_daily_minutes = task['remaining_minutes'] / max(1, task['days_left'])

            if required_daily_minutes > effective_daily_capacity:
                run_miss = True
                overloaded_days += 1
                break

        if run_miss:
            misses += 1

    miss_probability = int(round((misses / simulations) * 100))

    if miss_probability >= 70:
        risk_level = 'very-high'
    elif miss_probability >= 45:
        risk_level = 'high'
    elif miss_probability >= 20:
        risk_level = 'moderate'
    else:
        risk_level = 'low'

    critical_tasks = sorted(
        workload,
        key=lambda t: (t['remaining_minutes'] / max(1, t['days_left'])),
        reverse=True
    )[:5]

    for task in critical_tasks:
        task['required_daily_minutes'] = int(round(task['remaining_minutes'] / max(1, task['days_left'])))

    return {
        'risk_level': risk_level,
        'miss_probability': miss_probability,
        'overloaded_days': int(round(overloaded_days / simulations)),
        'critical_tasks': critical_tasks,
        'message': 'Re-plan tasks with highest required_daily_minutes first'
    }

# ============================================================================
# 12. KNOWLEDGE GRAPH GAP DETECTOR (NEW)
# ============================================================================
def detect_knowledge_gaps(tasks_data):
    """
    Builds a lightweight knowledge graph from task history and detects
    prerequisite concept gaps in pending learning goals.
    """
    if not tasks_data:
        return {
            'missing_prerequisites': [],
            'graph': {'nodes': [], 'edges': []},
            'message': 'Add learning tasks to build your knowledge graph'
        }

    prerequisite_map = {
        'machine learning': ['python', 'statistics', 'linear algebra'],
        'deep learning': ['machine learning', 'python', 'linear algebra'],
        'data structures': ['programming basics'],
        'algorithms': ['data structures', 'problem solving'],
        'system design': ['databases', 'networking', 'backend development'],
        'react': ['javascript', 'html', 'css'],
        'node': ['javascript', 'backend development'],
        'database': ['sql', 'data modeling']
    }

    def normalize(text):
        return str(text).strip().lower()

    completed = [t for t in tasks_data if t.get('status') == 'completed']
    pending = [t for t in tasks_data if t.get('status') in ['todo', 'in-progress']]

    covered_concepts = set()
    target_concepts = set()

    for task in completed:
        title = normalize(task.get('title', ''))
        category = normalize(task.get('category', ''))
        tags = [normalize(tag) for tag in (task.get('tags') or [])]
        task_text = ' '.join([title, category] + tags)
        for concept in prerequisite_map.keys():
            if concept in task_text:
                covered_concepts.add(concept)
        covered_concepts.update([tag for tag in tags if tag])

    for task in pending:
        title = normalize(task.get('title', ''))
        category = normalize(task.get('category', ''))
        tags = [normalize(tag) for tag in (task.get('tags') or [])]
        task_text = ' '.join([title, category] + tags)
        for concept in prerequisite_map.keys():
            if concept in task_text:
                target_concepts.add(concept)
        target_concepts.update([tag for tag in tags if tag])

    missing_prerequisites = []
    nodes = []
    edges = []

    for concept in sorted(target_concepts):
        if concept in prerequisite_map:
            prereqs = prerequisite_map[concept]
            for prereq in prereqs:
                edges.append({'from': prereq, 'to': concept})
                nodes.append({'id': prereq, 'type': 'prerequisite'})
            nodes.append({'id': concept, 'type': 'target'})

            for prereq in prereqs:
                if prereq not in covered_concepts:
                    missing_prerequisites.append({
                        'target_concept': concept,
                        'missing_concept': prereq,
                        'priority': 'high' if concept in ['machine learning', 'deep learning', 'system design'] else 'medium',
                        'recommended_task': f'Complete a foundational task on {prereq}'
                    })

    # De-duplicate graph structures
    unique_nodes = {n['id']: n for n in nodes}
    unique_edges = {(e['from'], e['to']): e for e in edges}

    return {
        'missing_prerequisites': missing_prerequisites[:10],
        'graph': {
            'nodes': list(unique_nodes.values()),
            'edges': list(unique_edges.values())
        },
        'coverage_score': max(0, min(100, int((len(covered_concepts) / max(1, len(covered_concepts) + len(missing_prerequisites))) * 100))),
        'message': 'Close high-priority prerequisite gaps first for faster progress'
    }

# ============================================================================
# 13. ADAPTIVE EXAM GENERATOR (NEW)
# ============================================================================
def generate_adaptive_exam(tasks_data, question_count=8):
    """
    Generates an adaptive mini-exam focused on weak and high-priority concepts.
    """
    if not tasks_data:
        return {
            'questions': [],
            'difficulty_mix': {'easy': 0, 'medium': 0, 'hard': 0},
            'message': 'Add tasks to generate personalized exam sets'
        }

    completed = [t for t in tasks_data if t.get('status') == 'completed']
    pending = [t for t in tasks_data if t.get('status') in ['todo', 'in-progress']]

    completion_rate = (len(completed) / max(1, len(tasks_data))) * 100
    if completion_rate >= 70:
        difficulty_mix = {'easy': 1, 'medium': 4, 'hard': 3}
    elif completion_rate >= 40:
        difficulty_mix = {'easy': 2, 'medium': 4, 'hard': 2}
    else:
        difficulty_mix = {'easy': 4, 'medium': 3, 'hard': 1}

    # Build concept pool from pending/high priority work
    concept_pool = []
    for task in pending:
        title = str(task.get('title', 'General Concept')).strip()
        priority = task.get('priority', 'medium')
        concept_pool.append({'concept': title, 'priority': priority})

    if not concept_pool:
        concept_pool = [{'concept': 'General Revision', 'priority': 'medium'}]

    question_templates = {
        'easy': [
            'Explain the core idea of: {concept}.',
            'List 3 basics you must know about: {concept}.',
            'Give one real-life example where {concept} is useful.'
        ],
        'medium': [
            'Compare two approaches for solving problems in: {concept}.',
            'Solve this scenario using {concept} and justify your steps.',
            'What are common mistakes beginners make in {concept}?'
        ],
        'hard': [
            'Design an optimized strategy for a complex {concept} problem.',
            'Analyze trade-offs in an advanced {concept} implementation.',
            'How would you evaluate correctness and performance for {concept}?'
        ]
    }

    desired_levels = []
    for level, count in difficulty_mix.items():
        desired_levels.extend([level] * count)
    desired_levels = desired_levels[:question_count]

    questions = []
    for idx, level in enumerate(desired_levels, start=1):
        concept = concept_pool[(idx - 1) % len(concept_pool)]
        templates = question_templates[level]
        template = templates[(idx - 1) % len(templates)]

        questions.append({
            'id': idx,
            'difficulty': level,
            'concept': concept['concept'],
            'prompt': template.format(concept=concept['concept']),
            'time_limit_mins': 8 if level == 'easy' else (12 if level == 'medium' else 18),
            'marks': 5 if level == 'easy' else (10 if level == 'medium' else 15)
        })

    return {
        'questions': questions,
        'difficulty_mix': {
            'easy': len([q for q in questions if q['difficulty'] == 'easy']),
            'medium': len([q for q in questions if q['difficulty'] == 'medium']),
            'hard': len([q for q in questions if q['difficulty'] == 'hard'])
        },
        'total_marks': int(sum(q['marks'] for q in questions)),
        'estimated_duration_mins': int(sum(q['time_limit_mins'] for q in questions)),
        'message': 'Generated exam adapts to your current completion profile'
    }

# ============================================================================
# ORIGINAL FUNCTIONS (MAINTAINED)
# ============================================================================

def predict_task_duration(task_data, historical_tasks):
    """Predicts actual task duration based on historical patterns"""
    estimated_minutes = task_data.get('estimatedMinutes', 30)
    priority = task_data.get('priority', 'medium')
    
    if not historical_tasks or len(historical_tasks) == 0:
        return {
            'predicted_minutes': estimated_minutes,
            'confidence': 'low',
            'suggestion': 'Start with your estimate'
        }
    
    similar_tasks = [t for t in historical_tasks 
                     if t.get('status') == 'completed' 
                     and t.get('priority') == priority
                     and t.get('actualMinutesSpent', 0) > 0]
    
    if not similar_tasks:
        similar_tasks = [t for t in historical_tasks 
                        if t.get('status') == 'completed'
                        and t.get('actualMinutesSpent', 0) > 0]
    
    if similar_tasks:
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
                'suggestion': suggestion
            }
    
    return {
        'predicted_minutes': estimated_minutes,
        'confidence': 'low',
        'suggestion': 'Build more task history'
    }

def generate_productivity_insights(tasks_data):
    """Generates actionable insights from task patterns"""
    insights = []
    
    if not tasks_data or len(tasks_data) == 0:
        return ['Start adding tasks to see insights!']
    
    completed = [t for t in tasks_data if t.get('status') == 'completed']
    in_progress = [t for t in tasks_data if t.get('status') == 'in-progress']
    todo = [t for t in tasks_data if t.get('status') == 'todo']
    
    if len(in_progress) > 5:
        insights.append(f'⚠️ {len(in_progress)} tasks in progress - focus first')
    
    if len(todo) > 10:
        insights.append(f'📋 {len(todo)} pending tasks - prioritize')
    
    if len(completed) >= 5:
        insights.append(f'🔥 {len(completed)} completed - great momentum!')
    
    return insights if insights else ['Keep working on tasks!']

# ============================================================================
# FLASK ROUTES
# ============================================================================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'FocusFlowAI Advanced ML Engine',
        'version': '3.0.0 - AI Features',
        'status': 'operational',
        'features': [
            'procrastination_detection',
            'focus_pattern_analysis',
            'adaptive_difficulty',
            'schedule_generation',
            'focus_coach',
            'task_breakdown',
            'burnout_prevention',
            'resource_recommender',
            'habit_tracking',
            'memory_retention_planner',
            'deadline_risk_simulator',
            'knowledge_graph_gap_detector',
            'adaptive_exam_generator'
        ]
    })

@app.route('/procrastination-risk', methods=['POST'])
def check_procrastination():
    """Check procrastination risk"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        behavior = data.get('user_behavior', {})
        
        result = detect_procrastination_risk(tasks, behavior)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/focus-patterns', methods=['POST'])
def get_focus_patterns():
    """Analyze focus patterns"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        result = analyze_focus_patterns(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/difficulty-score', methods=['POST'])
def get_difficulty_score():
    """Calculate adaptive difficulty"""
    try:
        data = request.get_json()
        task = data.get('task', {})
        history = data.get('history', [])
        
        result = calculate_adaptive_difficulty(task, history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-schedule', methods=['POST'])
def schedule_tasks():
    """Generate optimized schedule"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        patterns = data.get('focus_patterns', {})
        hours = data.get('available_hours', 4)
        
        result = generate_optimal_schedule(tasks, patterns, hours)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/focus-coach', methods=['POST'])
def focus_coach():
    """Get real-time focus coaching"""
    try:
        data = request.get_json()
        elapsed = data.get('elapsed_minutes', 0)
        difficulty = data.get('difficulty_score', 50)
        patterns = data.get('focus_patterns', {})
        
        result = get_focus_coach_message(elapsed, difficulty, patterns)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/breakdown-task', methods=['POST'])
def break_down_task():
    """Intelligently break down complex tasks"""
    try:
        data = request.get_json()
        title = data.get('title', '')
        minutes = data.get('estimatedMinutes', 60)
        history = data.get('history', [])
        
        result = breakdown_complex_task(title, minutes, history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_burnout():
    """Analyze burnout risk"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        result = calculate_burnout_risk(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend-resources', methods=['POST'])
def recommend():
    """Recommend learning resources"""
    try:
        data = request.get_json()
        title = data.get('title', '')
        category = data.get('category', '')
        difficulty = data.get('difficulty_score', 50)
        
        result = recommend_resources(title, category, difficulty)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-habits', methods=['POST'])
def get_habits():
    """Analyze study habits"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        result = analyze_habits(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/memory-retention', methods=['POST'])
def memory_retention():
    """Estimate forgetting-curve based retention and review priority"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])

        result = estimate_memory_retention(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/deadline-simulation', methods=['POST'])
def deadline_simulation():
    """Simulate probability of missing deadlines under current workload"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        daily_capacity = data.get('daily_capacity_minutes', 120)

        result = simulate_deadline_risk(tasks, daily_capacity)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/knowledge-gaps', methods=['POST'])
def knowledge_gaps():
    """Detect missing prerequisites for current learning goals"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])

        result = detect_knowledge_gaps(tasks)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/adaptive-exam', methods=['POST'])
def adaptive_exam():
    """Generate adaptive exam based on user progress"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        question_count = data.get('question_count', 8)

        result = generate_adaptive_exam(tasks, question_count)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_duration():
    """Predict task duration (legacy)"""
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
    """Get productivity insights"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        insights = generate_productivity_insights(tasks)
        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
