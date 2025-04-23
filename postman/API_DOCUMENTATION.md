# IMF Gadget Management System API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNlMDlmODlkLTRiZWMtNGUzYi05ODcxLTU4NmQwNDEwMjFlNCIsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTc0NTQyMDcyMiwiZXhwIjoxNzQ1NTA3MTIyfQ.7yghpZVs3gZKBSKhPUbSn2LnmF8DLNAyfCvNTn-izNg
```

## Endpoints

### Authentication

#### 1. Register User
- **Method**: POST
- **Endpoint**: `/auth/register`
- **Headers**: Content-Type: application/json
- **Body**:
```json
{
    "username": "agent007",
    "password": "secret123"
}
```
- **Response**:
```json
{
    "token": "jwt_token_string"
}
```

#### 2. Login User
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Headers**: Content-Type: application/json
- **Body**:
```json
{
    "username": "agent007",
    "password": "secret123"
}
```
- **Response**:
```json
{
    "token": "jwt_token_string",
    "username": "agent007"
}
```

### Gadgets

#### 1. Get All Gadgets
- **Method**: GET
- **Endpoint**: `/gadgets`
- **Headers**: Authorization: Bearer {jwt_token}
- **Response**:
```json
{
    "gadgets": [
        {
            "id": "uuid",
            "name": "Exploding Pen",
            "codename": "The Silent Eagle",
            "status": "Available",
            "mission_success_probability": "87%",
            "created_at": "2025-04-23T...",
            "updated_at": "2025-04-23T..."
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "itemsPerPage": 10
    }
}
```

#### 2. Get Gadgets by Status
- **Method**: GET
- **Endpoint**: `/gadgets?status={status}`
- **Headers**: Authorization: Bearer {jwt_token}
- **Query Parameters**: 
  - status: Available, Deployed, Destroyed, or Decommissioned
- **Response**: Same as Get All Gadgets

#### 3. Add New Gadget
- **Method**: POST
- **Endpoint**: `/gadgets`
- **Headers**: 
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
- **Body**:
```json
{
    "name": "Exploding Pen"
}
```
- **Response**:
```json
{
    "id": "uuid",
    "name": "Exploding Pen",
    "codename": "The Shadow Phoenix",
    "status": "Available",
    "created_at": "2025-04-23T...",
    "updated_at": "2025-04-23T..."
}
```

#### 4. Update Gadget
- **Method**: PATCH
- **Endpoint**: `/gadgets/:id`
- **Headers**: 
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
- **Body**:
```json
{
    "name": "Updated Name",
    "status": "Deployed"
}
```
- **Response**: Returns updated gadget object

#### 5. Decommission Gadget
- **Method**: DELETE
- **Endpoint**: `/gadgets/:id`
- **Headers**: Authorization: Bearer {jwt_token}
- **Response**:
```json
{
    "id": "uuid",
    "name": "Gadget Name",
    "status": "Decommissioned",
    "decommissioned_at": "2025-04-23T...",
    "updated_at": "2025-04-23T..."
}
```

#### 6. Self-Destruct Gadget
- **Method**: POST
- **Endpoint**: `/gadgets/:id/self-destruct`
- **Headers**: Authorization: Bearer {jwt_token}
- **Response**:
```json
{
    "message": "Self-destruct sequence initiated",
    "confirmationCode": "ABC123",
    "gadget": {
        "id": "uuid",
        "name": "Gadget Name",
        "status": "Destroyed",
        "updated_at": "2025-04-23T..."
    }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (No token provided)
- 403: Forbidden (Invalid token)
- 404: Not Found
- 500: Internal Server Error

## Notes
1. All timestamps are in ISO 8601 format
2. All IDs are UUIDs
3. Mission success probability is randomly generated for each gadget
4. Gadget codenames are automatically generated upon creation
5. The JWT token expires in 24 hours from creation