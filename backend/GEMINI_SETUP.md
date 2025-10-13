# Gemini AI Setup Guide

## 🚀 **Converting from OpenAI to Gemini AI**

This project has been converted to use Google's Gemini AI instead of OpenAI for better cost-effectiveness and free tier limits.

## 📋 **Required Environment Variables**

### Backend (`padh-ai-backend/.env`):

```env
# Database
MONGO_URI=mongodb://localhost:27017/languageapp

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-different-from-jwt-secret

# Gemini AI API (Required for lesson generation)
GEMINI_API_KEY=your-gemini-api-key-here

# LLM Model Name (Optional - defaults to gemini-2.0-flash)
LLM_MODEL_NAME=gemini-2.0-flash

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🔑 **How to Get Gemini API Key**

### Step 1: Go to Google AI Studio

1. Visit: https://aistudio.google.com/
2. Sign in with your Google account

### Step 2: Create API Key

1. Click "Get API Key" button
2. Click "Create API Key in new project"
3. Copy the generated API key (starts with `AIza...`)

### Step 3: Add to Environment

1. Add `GEMINI_API_KEY=your-actual-key-here` to your `.env` file
2. Replace `your-actual-key-here` with the key you copied

## 💰 **Cost Benefits**

### Gemini AI Advantages:

- **Free Tier**: 15 requests per minute, 1 million tokens per day
- **Lower Cost**: Significantly cheaper than OpenAI
- **Better Limits**: More generous free tier
- **Fast Response**: Quick generation times
- **High Quality**: Excellent educational content generation

### Free Tier Considerations:

- **Rate Limit**: 15 requests per minute
- **Current Setup**: 1 lesson + 1 test per section (8 total API calls)
- **Generation Time**: ~40 seconds with delays
- **Upgrade Path**: Can increase lessons per section with paid tier

### Model Used:

- **Model**: `gemini-2.0-flash` (configurable via LLM_MODEL_NAME)
- **Speed**: Very fast
- **Quality**: High-quality educational content
- **Cost**: Much cheaper than GPT-3.5-turbo
- **Configurable**: Can be changed via environment variable

## 🚀 **Installation**

The Gemini AI package is already installed:

```bash
npm install @google/generative-ai
```

## 🔧 **What Changed**

### 1. Lesson Generation Service

- ✅ Converted from OpenAI to Gemini AI
- ✅ Uses `gemini-2.0-flash` model (configurable)
- ✅ Same high-quality educational content
- ✅ Much lower cost
- ✅ Environment variable support for model selection

### 2. LLM Service

- ✅ Updated to use Gemini AI
- ✅ Better error handling
- ✅ Consistent API structure
- ✅ JSON extraction from markdown responses

### 3. Package Dependencies

- ✅ Added `@google/generative-ai`
- ✅ Removed `openai` dependency
- ✅ Cleaner package.json

## 🎯 **Testing**

1. **Set up environment variables**
2. **Start backend**: `npm start`
3. **Complete placement test**
4. **Generate lessons** - should work with Gemini AI
5. **Check console** for Gemini API calls

## 📊 **API Usage**

The system will generate:

- **12 Lessons**: 3 per section (Vocabulary, Grammar, Punctuation, Reading)
- **12 Tests**: 10 questions each
- **Total**: 24 API calls per user
- **Cost**: Much lower than OpenAI

## 🔍 **Monitoring**

Check console logs for:

- `🚀 Generating AI-powered lessons...`
- `✅ AI lessons generated: {...}`
- Gemini API response times and quality

## 🔧 **Troubleshooting**

### Common Issues:

#### **1. JSON Parsing Errors:**

- **Problem**: `SyntaxError: Unexpected token '`', "```json`
- **Solution**: Fixed with JSON extraction from markdown responses
- **Status**: ✅ Resolved

#### **2. API Key Issues:**

- **Problem**: `Gemini API failed: API key not found`
- **Solution**: Set `GEMINI_API_KEY` in your `.env` file
- **Check**: Run `npm run test-gemini` to verify

#### **3. Model Not Found:**

- **Problem**: `Model not found` errors
- **Solution**: Use `LLM_MODEL_NAME=gemini-2.0-flash` in `.env`
- **Alternative**: Try `gemini-1.5-flash` if 2.0 is not available

#### **4. Frontend Timeout Errors:**

- **Problem**: `timeout of 2000ms exceeded` in frontend
- **Solution**: ✅ Fixed - Increased timeout to 5 minutes for lesson generation
- **Status**: Frontend now has proper timeout configuration

#### **5. Rate Limit Errors:**

- **Problem**: `429 Too Many Requests` from Gemini API
- **Solution**: ✅ Fixed - Added retry logic with exponential backoff
- **Rate Limiting**: 5-second delays between requests
- **Free Tier**: Reduced to 1 lesson per section (4 total lessons + 4 tests)
- **Retry Logic**: Automatic retry with increasing delays

## 🎉 **Benefits**

- **Cost Effective**: Much cheaper than OpenAI
- **Free Tier**: Generous free limits
- **High Quality**: Excellent educational content
- **Fast**: Quick response times
- **Reliable**: Stable API service
- **Robust**: Handles markdown-formatted responses
