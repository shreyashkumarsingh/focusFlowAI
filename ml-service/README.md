# FocusFlowAI ML Service

AI-powered analytics engine for productivity insights and burnout prediction.

## Features

- **Burnout Risk Analysis**: Detects patterns that indicate overwork or stress
- **Task Duration Prediction**: Uses historical data to predict realistic task durations
- **Productivity Insights**: Generates actionable recommendations

## Setup

1. Install Python 3.9 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the service:
   ```bash
   python app.py
   ```

The service will start on `http://localhost:5001`

## API Endpoints

### `POST /analyze`
Analyzes burnout risk based on task patterns.
```json
{
  "tasks": [
    {
      "status": "completed",
      "estimatedMinutes": 30,
      "actualMinutesSpent": 55,
      "priority": "high"
    }
  ]
}
```

### `POST /predict`
Predicts realistic task duration.
```json
{
  "task": {
    "estimatedMinutes": 45,
    "priority": "medium"
  },
  "history": [...]
}
```

### `POST /insights`
Generates productivity insights.
```json
{
  "tasks": [...]
}
```

## Docker Support

```bash
docker build -t focusflowai-ml .
docker run -p 5001:5001 focusflowai-ml
```
