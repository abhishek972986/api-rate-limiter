# 🚦 Rate Limiter as a Service

A scalable **Rate Limiter as a Service (RLaaS)** that helps protect APIs and applications from abuse, excessive traffic, and denial-of-service attacks. Manage API keys, configure rate limits, monitor usage, and integrate rate limiting into any application with minimal setup.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Authentication](#-authentication)
  - [Register User](#register-user)
  - [Login User](#login-user)
  - [Using JWT Tokens](#using-jwt-tokens)
- [API Key Management](#-api-key-management)
  - [Create API Key](#create-api-key)
  - [Validate API Key](#validate-api-key)
  - [Get API Key Details](#get-api-key-details)
  - [Usage Statistics](#usage-statistics)
  - [Update API Key](#update-api-key)
  - [Delete API Key](#delete-api-key)
- [Rate Limiting Integration](#-rate-limiting-integration)
- [Client Library](#-client-library)
- [API Reference](#-api-reference)

---

# 📌 Overview

Rate Limiter as a Service allows developers to:

- 🔐 Secure APIs from abuse
- 🚀 Enforce request limits
- 📊 Monitor API usage
- 🔑 Manage API Keys
- ⚡ Scale rate limiting independently
- 📈 Track request statistics
- 🛡️ Protect backend services

---

# ✨ Features

- JWT Authentication
- API Key Management
- Configurable Rate Limits
- Redis-powered Fast Counting
- MongoDB Storage
- Usage Analytics
- Expiration Support
- Express Middleware
- REST API
- Easy Client Integration

---

# 🏗 Architecture

```
                 Client Application
                         │
                         ▼
              Rate Limiter Middleware
                         │
                         ▼
          Rate Limiter Service (Express API)
              │                     │
              ▼                     ▼
          MongoDB              Redis Cache
     (Users & API Keys)   (Request Counters)
```

---

# 🚀 Getting Started

## Installation

Clone the repository

```bash
git clone https://github.com/abhishek972986/api-rate-limiter.git
```

Move into the project directory

```bash
cd rate-limiter-as-a-service
```

Install dependencies

```bash
npm install
```

Start the server

```bash
npm start
```

---

## Environment Variables

Create a `.env` file inside the project root.

```env
PORT=3000

MONGO_URI=mongodb://localhost:27017/rate-limiter

REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret_key_here

JWT_EXPIRES_IN=24h
```

---

# 🔐 Authentication

All API Key operations require a valid JWT token.

---

## Register User

### Endpoint

```
POST /api/auth/register
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name":"John Doe",
  "email":"john@example.com",
  "password":"securePassword123"
}'
```

### Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "your.jwt.token",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

## Login User

### Endpoint

```
POST /api/auth/login
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email":"john@example.com",
  "password":"securePassword123"
}'
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "your.jwt.token",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

## Using JWT Tokens

Include your JWT in every protected request.

```http
Authorization: Bearer <your.jwt.token>
```

Example:

```bash
curl -X GET http://localhost:3000/api/auth/profile \
-H "Authorization: Bearer your.jwt.token"
```

---

# 🔑 API Key Management

API Keys define how clients access your protected services.

---

## Create API Key

### Endpoint

```
POST /api/keys
```

### Request

```json
{
  "name": "My Application",
  "rateLimit": 100,
  "expiresIn": "30d"
}
```

### Response

```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "key": "rl_xxxxxxxxxxxxx",
    "name": "My Application",
    "rateLimit": 100,
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "createdAt": "2023-12-01T12:00:00.000Z"
  }
}
```

---

## Validate API Key

### Endpoint

```
POST /api/keys/validate
```

### Request

```json
{
  "key": "rl_xxxxxxxxxxxxx"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "isValid": true
  }
}
```

---

## Get API Key Details

### Endpoint

```
GET /api/keys/:key
```

### Response

```json
{
  "success": true,
  "data": {
    "key": "rl_xxxxxxxxxxxxx",
    "name": "My Application",
    "rateLimit": 100,
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "createdAt": "2023-12-01T12:00:00.000Z",
    "updatedAt": "2023-12-01T12:00:00.000Z"
  }
}
```

---

## Usage Statistics

### Endpoint

```
GET /api/keys/:key/stats
```

### Example

```
GET /api/keys/<key>/stats?path=/api/products&method=GET
```

### Response

```json
{
  "success": true,
  "data": {
    "totalRequests": 45,
    "remainingRequests": 55,
    "resetAt": "2023-12-01T13:00:00.000Z"
  }
}
```

---

## Update API Key

### Endpoint

```
PUT /api/keys/:key
```

### Request

```json
{
  "name": "Updated API Key",
  "rateLimit": 200
}
```

### Response

```json
{
  "success": true,
  "message": "API key updated successfully",
  "data": {
    "key": "rl_xxxxxxxxxxxxx",
    "name": "Updated API Key",
    "rateLimit": 200,
    "expiresAt": "2023-12-31T23:59:59.999Z"
  }
}
```

---

## Delete API Key

> ⚠️ Admin Only

### Endpoint

```
DELETE /api/keys/:key
```

### Response

```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

---

# 🚦 Rate Limiting Integration

Integrating the service into an Express application requires only a few steps.

## 1. Install Client Library

```bash
npm install
```

---

## 2. Initialize the Client

```javascript
const RateLimiter = require("./client");

const limiter = new RateLimiter({
    apiKey: "your-api-key",
    serviceUrl: "http://localhost:3000"
});
```

---

## 3. Protect Routes

```javascript
const express = require("express");

const app = express();

app.use("/api/products", limiter.middleware());

app.get("/api/products", (req, res) => {
    res.json({
        products: [
            "Product 1",
            "Product 2"
        ]
    });
});

app.listen(4000);
```

---

# 📚 Client Library

The client package provides:

- Automatic request validation
- Express middleware
- Retry handling
- Error responses
- Rate limit headers
- Request tracking

See:

```
client/README.md
```

for complete documentation.

---

# 📖 API Reference

A complete API specification is available in:

```
docs/API.md
```

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | REST API |
| MongoDB | User & API Key Storage |
| Redis | Fast Rate Limiting |
| JWT | Authentication |
| Mongoose | Database ODM |

---

# 📂 Project Structure

```
rate-limiter-as-a-service/
│
├── client/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── docs/
├── .env
├── package.json
└── server.js
```

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

Made with ❤️ using **Node.js**, **Express**, **Redis**, and **MongoDB**.
