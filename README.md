# Workflow Mortgage Responsive Application

## Overview
This is a responsive web application built for mortgage workflow management. The application uses modern web technologies including React, Vite, TypeScript, Tailwind CSS, and various UI libraries to provide a smooth and intuitive user experience.

## Key Technologies
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Router
- React Query
- Python 3.10.4 Backend (REST API)
- Axios for HTTP requests

## Prerequisites
- Node.js (v18 or later recommended)
- npm (v9 or later)
- Python 3.10.4 (for backend)
- Backend API running on `http://localhost:5001`

## Setup and Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/workflow-mortgage-responsive.git
cd workflow-mortgage-responsive
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root and add any necessary environment variables:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_APP_NAME=Workflow Mortgage
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
```

**Note**: The frontend is configured to work with a Python 3.10.4 backend. See `PYTHON_BACKEND_COMPATIBILITY.md` for detailed backend requirements.

### 4. Backend Setup
Ensure your Python 3.10.4 backend is running on `http://localhost:5001` with the following endpoints:
- Authentication: `/users/login`
- Orders: `/orders`
- Clients: `/clients`
- Users: `/users`
- Dashboard: `/dashboard/user/{user_id}`

### 5. Running the Application

#### Development Mode
```bash
npm run dev
```
- Starts the development server
- Open `http://localhost:5173` in your browser
- Hot reloading enabled for instant feedback

#### Production Preview
```bash
npm run build
npm run preview
```
- Builds the application for production
- Serves the production build locally

### 6. Additional Scripts

- `npm run lint`: Run ESLint to check for code quality issues
- `npm run build`: Create a production build
- `npm run build:dev`: Create a development build

## Application Structure

### Main Components
- `src/components/`: Reusable UI components
- `src/pages/`: Top-level page components
- `src/contexts/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions
- `src/config/`: API configuration and constants
- `src/services/`: API service functions

### Routing
The application uses React Router with two main routes:
- `/`: Main application index page
- `*`: 404 Not Found page

### State Management
- Uses React Query for data fetching and caching
- Provides global state via React Contexts

## UI/UX Features
- Light/Dark theme support
- Responsive design
- Accessible UI components
- Toast notifications
- Interactive UI elements

## Backend Compatibility

This frontend is designed to work with a Python 3.10.4 backend. The frontend expects the following:

### API Endpoints
- **Base URL**: `http://localhost:5001`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`

### Expected Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Handling
- HTTP 401: Unauthorized (triggers logout)
- HTTP 422: Validation errors (shows user-friendly messages)
- HTTP 500: Server errors (shows generic error message)

## Troubleshooting
- Ensure Node.js and npm are up to date
- Ensure Python 3.10.4 backend is running on port 5001
- Verify backend endpoints match the expected format (see `PYTHON_BACKEND_COMPATIBILITY.md`)
- Check CORS configuration allows `http://localhost:5173`
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check browser console for API connection errors
- Verify JWT token format and expiration

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
[Specify your license here]

## Contact
[Your contact information or project maintainer details]
