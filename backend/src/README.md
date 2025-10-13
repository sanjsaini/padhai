# Backend Structure

This is the organized backend structure for the language learning application.

## 📁 Directory Structure

```
src/
├── config/           # Configuration files
│   └── database.js   # MongoDB connection configuration
├── controllers/       # Route handlers (business logic)
│   ├── authController.js      # Authentication logic
│   ├── testController.js      # Test and placement test logic
│   └── lessonController.js    # Lesson content logic
├── middleware/        # Custom middleware
│   └── auth.js       # JWT authentication middleware
├── models/           # Database models (Mongoose schemas)
│   ├── User.js       # User model
│   ├── Question.js   # Question model
│   └── LessonContent.js # Lesson content model
├── routes/           # API route definitions
│   ├── authRoutes.js     # Authentication routes
│   ├── testRoutes.js     # Test-related routes
│   └── lessonRoutes.js   # Lesson-related routes
├── services/         # External service integrations
│   ├── llmService.js     # LLM API service (Gemini)
│   └── lessonGenerationService.js # Lesson generation service
├── utils/            # Utility functions (empty for now)
├── app.js            # Express app configuration
└── server.js         # Server entry point
```

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with:

   ```env
   MONGO_URI=mongodb://localhost:27017/languageapp
   JWT_SECRET=your-secret-key-12345
   LLM_API_KEY=your-llm-api-key-here
   LLM_MODEL_NAME=gemini-2.0-flash
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📋 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Tests & Placement

- `POST /api/test-content/generate` - Generate test content
- `GET /api/test-content/user` - Get user's test content
- `GET /api/questions` - Get questions
- `POST /api/placement-test/submit` - Submit placement test results
- `GET /api/placement-test/status` - Get placement test status

### Lessons

- `POST /api/lessons/get/:lessonId` - Get or generate lesson content

## 🔧 Key Features

- **Organized Structure**: Clean separation of concerns
- **JWT Authentication**: Secure user authentication
- **MongoDB Integration**: Database operations with Mongoose
- **Gemini Integration**: AI-powered content generation
- **Placement Testing**: Comprehensive test system
- **Error Handling**: Proper error management
- **Middleware**: Reusable authentication middleware

## 📝 Notes

- The server runs on port 5000 by default
- All routes are prefixed with `/api`
- Authentication is required for most endpoints
- The placement test submission works with or without authentication
