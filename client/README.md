# Rate Limiter Client Library

A simple client library to interact with the Rate Limiter Service.

## Installation

```bash
npm install rate-limiter-service-client
```

## Quick Start

```javascript
const RateLimiterClient = require('rate-limiter-service-client');

// Initialize the client
const rateLimiter = new RateLimiterClient({
  apiKey: 'your-api-key',
  serviceUrl: 'http://localhost:3000'
});

// Use in an Express app
const express = require('express');
const app = express();

// Apply rate limiting to specific routes
app.use('/api/products', rateLimiter.middleware());

app.get('/api/products', (req, res) => {
  res.json({ products: ['Product 1', 'Product 2'] });
});

app.listen(4000, () => {
  console.log('App listening on port 4000');
});
```

## Authentication Examples

### User Registration

```javascript
const client = new RateLimiterClient({
  serviceUrl: 'http://localhost:3000'
});

async function registerUser() {
  try {
    const response = await client.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    });
    
    console.log('Registration successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
    // The token is automatically set in the client
    // Now you can use other authenticated methods
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

registerUser();
```

### User Login

```javascript
const client = new RateLimiterClient({
  serviceUrl: 'http://localhost:3000'
});

async function loginUser() {
  try {
    const response = await client.login('john@example.com', 'securePassword123');
    
    console.log('Login successful!');
    console.log('Token:', response.data.token);
    
    // The token is automatically set in the client
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

loginUser();
```

## API Key Management Examples

### Creating an API Key

```javascript
async function createApiKey() {
  try {
    const response = await client.createApiKey({
      name: 'My Application API Key',
      rateLimit: 100,
      expiresIn: '30d'
    });
    
    console.log('API key created:', response.data.key);
  } catch (error) {
    console.error('Failed to create API key:', error.message);
  }
}
```

### Getting API Key Details

```javascript
async function getApiKeyDetails(key) {
  try {
    const response = await client.getApiKeyDetails(key);
    console.log('API key details:', response.data);
  } catch (error) {
    console.error('Failed to get API key details:', error.message);
  }
}
```

### Getting Rate Limit Statistics

```javascript
async function getRateLimitStats(key, path, method) {
  try {
    const response = await client.getRateLimitStats(key, path, method);
    console.log('Rate limit stats:', response.data);
  } catch (error) {
    console.error('Failed to get rate limit stats:', error.message);
  }
}
```

## Rate Limiting Middleware

### Basic Usage

```javascript
const express = require('express');
const app = express();

// Initialize the client with your API key
const rateLimiter = new RateLimiterClient({
  apiKey: 'your-api-key',
  serviceUrl: 'http://localhost:3000'
});

// Apply global rate limiting
app.use(rateLimiter.middleware());

// Or apply to specific routes
app.use('/api/products', rateLimiter.middleware());
```

### Custom Configuration

```javascript
// Customize the middleware
app.use('/api/users', rateLimiter.middleware({
  // Use a specific path for tracking instead of the actual request path
  path: '/api/users',
  
  // Custom header for API keys (default is X-API-Key)
  keyHeader: 'X-Client-Key'
}));
```

## API Reference

See the [main documentation](../README.md) for a complete API reference.
