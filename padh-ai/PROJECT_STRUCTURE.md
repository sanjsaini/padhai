# Project Structure Documentation

## 📁 Frontend Structure (`padh-ai/`)

```
src/
├── api/                    # API client and services
│   └── client.js          # Axios configuration and API calls
├── components/             # Reusable UI components
│   ├── auth/              # Authentication-related components
│   │   ├── Login/         # Login component folder
│   │   │   ├── Login.js   # Login form component
│   │   │   └── Login.css  # Login styles
│   │   └── SignUp/        # SignUp component folder
│   │       ├── SignUp.js      # Main signup component
│   │       ├── SignUp.css     # Signup styles
│   │       ├── SignUpStep1.js # First step of signup
│   │       ├── SignUpStep1.css
│   │       ├── SignUpStep2.js # Second step of signup
│   │       └── SignUpStep2.css
│   ├── common/            # Common/shared components
│   │   ├── Welcome/       # Welcome component folder
│   │   │   ├── Welcome.js     # Landing page component
│   │   │   └── Welcome.css    # Welcome page styles
│   │   └── ProgressPage/  # ProgressPage component folder
│   │       ├── ProgressPage.js # Progress tracking component
│   │       └── ProgressPage.css
│   └── lessons/           # Lesson-related components
│       ├── LessonReading/     # Reading lesson folder
│       │   ├── LessonReading.js    # Reading lesson component
│       │   └── LessonReading.css   # Reading lesson styles
│       ├── LessonTest/         # Test component folder
│       │   ├── LessonTest.js       # Test component
│       │   └── LessonTest.css      # Test styles
│       └── PlacementTest/      # Placement test folder
│           ├── PlacementTest.js    # Placement test component
│           ├── PlacementTest.css   # Placement test styles
│           └── PlacementTestGuard.js # Route guard for placement test
├── context/               # React Context providers
│   ├── AuthContext.js     # Authentication state management
│   └── LanguageContext.js # Multi-language support
├── data/                  # Static data and configurations
│   ├── data.json         # Static test questions
│   └── lessonData.js      # Lesson content data
├── hooks/                 # Custom React hooks
│   └── usePreventNavigation.js # Navigation prevention hook
├── pages/                 # Page-level components
│   ├── Dashboard.js      # Main dashboard page
│   └── Dashboard.css     # Dashboard styles
├── App.js                 # Main application component
├── App.css               # Global application styles
├── index.js              # Application entry point
└── index.css             # Global styles
```

## 🏗️ Architecture Overview

### Component Organization

- **`/components/auth/`**: Authentication-related components organized by feature
  - **`/Login/`**: Login component and its styles
  - **`/SignUp/`**: SignUp component and all related files (SignUpStep1, SignUpStep2, etc.)
- **`/components/common/`**: Shared components used across the app organized by feature
  - **`/Welcome/`**: Welcome component and its styles
  - **`/ProgressPage/`**: ProgressPage component and its styles
- **`/components/lessons/`**: Lesson and test-related components organized by feature
  - **`/LessonReading/`**: Reading lesson component and styles
  - **`/LessonTest/`**: Test component and styles
  - **`/PlacementTest/`**: Placement test component, styles, and guard
- **`/pages/`**: Page-level components that represent full pages/screens

### Data Management

- **`/context/`**: React Context for global state management
- **`/data/`**: Static data files and configurations
- **`/api/`**: API client and service layer

### Custom Hooks

- **`/hooks/`**: Reusable custom hooks for common functionality

## 🔧 Key Features

1. **Modular Structure**: Components are organized by functionality
2. **Consistent Naming**: PascalCase for components, camelCase for utilities
3. **Separation of Concerns**: Clear separation between UI, data, and business logic
4. **Scalable Architecture**: Easy to add new components and features
5. **Type Safety**: Consistent import/export patterns

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `Login.js`, `Dashboard.js`)
- **CSS Files**: PascalCase matching component name
- **Folders**: lowercase (e.g., `auth/`, `lessons/`)
- **Data Files**: camelCase (e.g., `lessonData.js`)

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Build for production: `npm run build`

## 🔄 Recent Improvements

- ✅ Fixed folder naming (`componets` → `components`)
- ✅ Fixed file naming (`deshboard.js` → `Dashboard.js`)
- ✅ Organized components into logical folders
- ✅ **NEW**: Grouped related files together by feature
  - SignUp folder contains all SignUp-related files (SignUp.js, SignUpStep1.js, SignUpStep2.js, etc.)
  - Login folder contains Login component and styles
  - Each lesson component has its own folder with related files
  - Welcome and ProgressPage components now have their own folders with related files
- ✅ Updated all import statements to reflect new structure
- ✅ Created proper folder structure for scalability
- ✅ Separated data files from components
- ✅ Improved code organization and maintainability
- ✅ **NEW**: Better developer experience with related files grouped together
