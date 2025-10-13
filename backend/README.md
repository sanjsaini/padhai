# Backend API Documentation

## 🚀 Quick Start

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd padh-ai-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your actual values
   nano .env  # or use your preferred editor
   ```

4. **Required Environment Variables**

   ```env
   MONGODB_URI=mongodb://localhost:27017/padh-ai
   JWT_SECRET=your-super-secret-jwt-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   PORT=5000
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection configuration
├── controllers/         # Request handlers
│   ├── authController.js    # Authentication logic
│   ├── testController.js    # Test-related logic
│   └── lessonController.js  # Lesson content logic
├── middleware/          # Custom middleware
│   └── auth.js         # JWT authentication middleware
├── models/             # MongoDB schemas
│   ├── User.js         # User model
│   ├── Question.js     # Question model
│   └── LessonContent.js # Lesson content model
├── routes/             # API routes
│   ├── authRoutes.js   # Authentication routes
│   ├── testRoutes.js   # Test-related routes
│   └── lessonRoutes.js # Lesson routes
├── services/           # External service integrations
│   ├── llmService.js   # LLM integration service (Gemini)
│   └── lessonGenerationService.js # Lesson generation service
├── utils/              # Utility functions
├── app.js              # Express app configuration
├── server.js           # Server entry point
└── test-complete-flow.js # Test file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Environment variables configured

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/languageapp

# JWT Secret Key
JWT_SECRET=your-secret-key-12345

# LLM Configuration (Gemini)
LLM_API_KEY=your-llm-api-key-here
LLM_MODEL_NAME=gemini-2.0-flash

# Server Configuration
PORT=5000
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`

Register a new user

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`

Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`

Get current user profile (requires authentication)

### Test Routes (`/api`)

#### POST `/api/test-content/generate`

Generate test content for user (requires authentication)

#### GET `/api/test-content/user`

Get user's test content (requires authentication)

#### GET `/api/questions`

Get all questions (requires authentication)

#### POST `/api/placement-test/submit`

Submit placement test results

#### GET `/api/placement-test/status`

Get placement test status (requires authentication)

### Lesson Routes (`/api/lessons`)

#### POST `/api/lessons/get/:lessonId`

Get or generate lesson content

## 🏗️ Architecture

### MVC Pattern

- **Models**: MongoDB schemas and data validation
- **Views**: JSON responses (API)
- **Controllers**: Business logic and request handling

### Service Layer

- **LLM Service**: Integration with Gemini API
- **Lesson Generation Service**: AI-powered lesson content generation

### Middleware

- **Authentication**: JWT token validation
- **CORS**: Cross-origin resource sharing
- **Error Handling**: Centralized error management

## 🔧 Key Features

- **Modular Structure**: Clean separation of concerns
- **Authentication**: JWT-based user authentication
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Gemini LLM service
- **Error Handling**: Comprehensive error management
- **Environment Configuration**: Secure environment variable management

## 📝 Recent Improvements

- ✅ **Organized Structure**: Separated concerns into proper folders
- ✅ **Modular Design**: Controllers, services, and routes properly separated
- ✅ **Clean Architecture**: MVC pattern implementation
- ✅ **Service Layer**: External API integrations properly abstracted
- ✅ **Configuration Management**: Database and environment configuration separated
- ✅ **Error Handling**: Centralized error management
- ✅ **Documentation**: Comprehensive API documentation

## 🧪 Testing

Run the test flow:

```bash
node src/test-complete-flow.js
```

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Environment variable protection
- Input validation and sanitization
