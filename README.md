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
- Supabase (for potential backend/authentication)

## Prerequisites
- Node.js (v18 or later recommended)
- npm (v9 or later)

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
Create a `.env` file in the project root and add any necessary environment variables (e.g., Supabase credentials if used).

### 4. Running the Application

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

### 5. Additional Scripts

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

## Troubleshooting
- Ensure Node.js and npm are up to date
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

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
