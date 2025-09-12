# API Constants and Configuration

This directory contains centralized API configuration and constants to avoid hardcoding URLs throughout the application.

## Files

### `api.ts`
Contains all API-related constants including:
- `API_CONFIG`: Base URL, timeout, retry settings
- `API_ENDPOINTS`: All API endpoint paths
- `getAuthHeaders()`: Function to create authentication headers
- `getRequestOptions()`: Common request options
- `ERROR_MESSAGES`: Standardized error messages
- `HTTP_STATUS`: HTTP status codes

## Usage

### Basic Usage
```typescript
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

// Use the base URL
const baseUrl = API_CONFIG.BASE_URL; // 'http://localhost:5001'

// Use endpoint paths
const usersEndpoint = API_ENDPOINTS.USERS; // '/users'
const userByIdEndpoint = API_ENDPOINTS.USER_BY_ID('123'); // '/users/123'
```

### Advanced Usage with Utils
```typescript
import { apiUrls, createFetchRequest } from '@/utils/api';

// Create full URLs with parameters
const usersUrl = apiUrls.users({ page: 1, page_size: 50 });
// Result: 'http://localhost:5001/users?page=1&page_size=50'

// Create authenticated fetch requests
const response = await createFetchRequest(
  apiUrls.users({ page: 1, page_size: 50 }),
  token,
  { method: 'GET' }
);
```

## Changing the Base URL

To change the API base URL, simply update the `BASE_URL` in `/src/constants/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080', // Change this
  // ... other config
} as const;
```

This will automatically update all API calls throughout the application.

## Environment Variables

You can also use environment variables by setting `VITE_API_BASE_URL` in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Benefits

1. **Centralized Configuration**: All API URLs in one place
2. **Easy Updates**: Change base URL in one location
3. **Type Safety**: TypeScript support for all constants
4. **Consistency**: Standardized error messages and status codes
5. **Maintainability**: Easier to update and maintain API calls
