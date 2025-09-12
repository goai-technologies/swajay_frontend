# Python 3.10.4 Backend Compatibility Guide

This document outlines the requirements and compatibility considerations for the Python 3.10.4 backend that powers this React frontend.

## Backend Requirements

### Python Version
- **Required**: Python 3.10.4
- **Recommended**: Use a virtual environment
- **Dependencies**: FastAPI, SQLAlchemy, Pydantic, JWT, CORS

### API Framework
The frontend expects a REST API with the following characteristics:
- **Framework**: FastAPI (recommended) or Flask
- **Port**: 5001
- **CORS**: Enabled for `http://localhost:5173` (Vite dev server)
- **Content-Type**: `application/json`

## Required Endpoints

### Authentication
```
POST /users/login
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "role": "Admin|Supervisor|Processor|QC|Typist|Auditor"
    }
  }
}
```

### Users Management
```
GET /users?page=1&page_size=50
Authorization: Bearer <token>

POST /users
Authorization: Bearer <token>
Content-Type: application/json

PUT /users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

DELETE /users/{user_id}
Authorization: Bearer <token>
```

### Clients Management
```
GET /clients?page=1&page_size=50
Authorization: Bearer <token>

POST /clients
Authorization: Bearer <token>
Content-Type: application/json

PUT /clients/{client_id}
Authorization: Bearer <token>
Content-Type: application/json
```

### Orders Management
```
GET /orders?page=1&page_size=10
Authorization: Bearer <token>

POST /orders
Authorization: Bearer <token>
Content-Type: application/json

GET /orders/{order_id}/log
Authorization: Bearer <token>
```

### Dashboard
```
GET /dashboard/user/{user_id}
Authorization: Bearer <token>

POST /dashboard/user/{user_id}/request-work
Authorization: Bearer <token>

POST /dashboard/step/{step_id}/complete
Authorization: Bearer <token>
Content-Type: application/json
```

## Response Format

All API responses should follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "page_size": 10,
      "total_count": 100,
      "total_pages": 10
    }
  }
}
```

## Error Handling

The frontend expects specific HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized (triggers logout)
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error (shows user-friendly message)
- **500**: Internal Server Error

## CORS Configuration

Ensure your Python backend allows CORS for the frontend:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## JWT Token Requirements

- **Algorithm**: HS256 (recommended)
- **Expiration**: 24 hours (configurable)
- **Header**: `Authorization: Bearer <token>`
- **Claims**: Include user ID and role

## Data Types

The frontend expects these data types for common fields:

### User Object
```python
{
    "id": str,
    "username": str,
    "email": str,
    "role": str,  # One of: Admin, Supervisor, Processor, QC, Typist, Auditor
    "active": bool,
    "phone_number": str,
    "company": str,
    "address": str,
    "employee_type": str,
    "user_type": str,
    "capabilities": str,  # Comma-separated
    "select_states": str,  # Comma-separated
    "clients": str,  # Comma-separated
    "skip_qc": str,
    "order_types": str  # Comma-separated
}
```

### Client Object
```python
{
    "id": str,
    "name": str,
    "email": str,
    "phone": str,
    "address": str
}
```

### Order Object
```python
{
    "id": str,
    "client_id": str,
    "order_type": str,
    "client_order_number": str,
    "owner_name": str,
    "property_address_line1": str,
    "property_address_line2": str,
    "city": str,
    "county": str,
    "state": str,
    "zip_code": str,
    "online_ground": str,
    "rush_file": str,
    "comments": str,
    "status": str,
    "priority": str,
    "created_at": str,  # ISO 8601 format
    "updated_at": str,  # ISO 8601 format
    "assigned_to": str,
    "file_number": str
}
```

## Testing the Backend

You can test your Python backend using these curl commands:

```bash
# Test login
curl -X POST http://localhost:5001/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user", "password": "test_password"}'

# Test protected endpoint
curl -X GET http://localhost:5001/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Considerations

- **Pagination**: Implement pagination for all list endpoints
- **Caching**: Consider Redis for session management
- **Database**: Use connection pooling
- **Logging**: Implement proper logging for debugging
- **Rate Limiting**: Consider implementing rate limiting for production

## Security Considerations

- **HTTPS**: Use HTTPS in production
- **Input Validation**: Validate all inputs using Pydantic
- **SQL Injection**: Use parameterized queries
- **XSS Protection**: Sanitize user inputs
- **CORS**: Configure CORS properly for production
