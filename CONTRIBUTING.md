# Contributing to FocusFlowAI

First off, thank you for considering contributing to FocusFlowAI! It's people like you that make FocusFlowAI such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Development Setup

See [SETUP.md](SETUP.md) for detailed development environment setup instructions.

Quick start:
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/focusflowai.git
cd focusflowai

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ../ml-service && pip install -r requirements.txt

# Start development servers
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: ML Service
cd ml-service && python app.py

# Terminal 3: Frontend
cd client && npm run dev
```

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Examples:
```
Add user profile customization

- Add ability to update avatar
- Add bio field
- Update profile page UI

Closes #123
```

### JavaScript/TypeScript Style Guide

- Use ESLint configuration provided
- Use TypeScript for type safety
- Use meaningful variable names
- Add comments for complex logic
- Follow React best practices

```typescript
// Good
const fetchUserTasks = async (userId: string): Promise<Task[]> => {
  const response = await API.get(`/tasks?user=${userId}`);
  return response.data;
};

// Bad
const f = async (u) => {
  const r = await API.get(`/tasks?user=${u}`);
  return r.data;
};
```

### Python Style Guide

- Follow PEP 8
- Use type hints
- Add docstrings for functions
- Keep functions small and focused

```python
# Good
def calculate_burnout_risk(tasks_data: list) -> dict:
    """
    Analyzes user task patterns to detect burnout risk.
    
    Args:
        tasks_data: List of task dictionaries
        
    Returns:
        Dictionary with risk_level, risk_score, and factors
    """
    if not tasks_data:
        return {'risk_level': 'low', 'risk_score': 0}
    
    # Implementation...
```

## Project Structure

Understanding the structure helps you know where to make changes:

```
client/src/
  ├── components/     # Reusable UI components
  ├── pages/          # Page components (Home, Dashboard, etc.)
  ├── context/        # React Context (AuthContext)
  ├── api/            # API configuration (axios)
  └── types.ts        # TypeScript type definitions

server/
  ├── controllers/    # Business logic (taskController, authController)
  ├── models/         # Database schemas (Task, User)
  ├── routes/         # API route definitions
  ├── middleware/     # Express middleware (auth)
  └── config/         # Configuration files (database)

ml-service/
  └── app.py          # Flask application with ML algorithms
```

## Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### ML Service Tests
```bash
cd ml-service
python -m pytest
```

## Feature Development Workflow

1. **Choose an issue** or create one describing your feature
2. **Discuss** the approach in the issue comments
3. **Create a branch** from `main`
4. **Develop** your feature with tests
5. **Test** thoroughly (manual and automated)
6. **Document** new features in README if needed
7. **Submit PR** with clear description

## Areas We'd Love Help With

- 🐛 Bug fixes
- ✨ New features (check issues for ideas)
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Adding tests
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements
- 🚀 Performance optimizations

## Specific Contribution Ideas

### Easy (Good First Issues)
- Add more task categories
- Improve error messages
- Add input validation
- Fix UI bugs
- Update documentation

### Medium
- Add task search functionality
- Implement task templates
- Add export data feature (CSV, JSON)
- Create email notifications
- Add dark mode theme

### Advanced
- Improve ML algorithms
- Add real-time collaboration
- Implement task sharing
- Add calendar integration
- Create mobile app (React Native)

## Review Process

1. All submissions require review
2. We use GitHub's review features
3. Expect feedback and iteration
4. Changes might be requested
5. Once approved, we'll merge your PR

## Community

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bugs and features
- 📧 Email for private concerns

## Recognition

Contributors will be:
- Added to [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in release notes
- Thanked in README

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FocusFlowAI! 🎉
