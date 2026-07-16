/**
 * Example of using Rate Limiter client in an Express application
 */
const express = require('express');
const RateLimiterClient = require('../rate-limiter-client');

// Create Express app
const app = express();
app.use(express.json());

// Initialize Rate Limiter client
const rateLimiter = new RateLimiterClient({
  apiKey: 'your-api-key-here',
  serviceUrl: 'http://localhost:3000'
});

// Example of using analytics endpoints
async function viewUsageAnalytics() {
  try {
    // Login first
    await rateLimiter.login('admin@example.com', 'admin_password');
    
    // Get overall usage stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const overallStats = await rateLimiter.getOverallUsage({
      start: thirtyDaysAgo.toISOString(),
      end: new Date().toISOString()
    });
    
    console.log('Overall Usage Stats:', overallStats.data);
    
    // Get daily usage history
    const usageHistory = await rateLimiter.getUsageHistory({
      start: thirtyDaysAgo.toISOString(),
      end: new Date().toISOString(),
      groupBy: 'day',
      apiKey: 'client-api-key' // Optional filter by API key
    });
    
    console.log('Daily Usage History:', usageHistory.data);
    
    // Get top 5 most used endpoints
    const topEndpoints = await rateLimiter.getEndpointAnalytics({
      start: thirtyDaysAgo.toISOString(),
      end: new Date().toISOString(),
      limit: 5,
      sort: 'popularity'
    });
    
    console.log('Top 5 Endpoints:', topEndpoints.data);
    
    // Admin-only: Get client usage statistics
    if (rateLimiter.isAdmin) {
      const clientStats = await rateLimiter.getClientUsage({
        limit: 10,
        sort: 'requests'
      });
      
      console.log('Client Usage Stats:', clientStats.data);
      
      // Export data as CSV
      const exportUrl = await rateLimiter.exportAnalytics({
        start: thirtyDaysAgo.toISOString(),
        end: new Date().toISOString(),
        format: 'csv',
        type: 'overall'
      });
      
      console.log('Export URL:', exportUrl);
    }
  } catch (error) {
    console.error('Error with analytics:', error);
  }
}

// Example of using rate limit overrides
async function applyTemporaryRateLimit() {
  try {
    // Login first
    await rateLimiter.login('admin@example.com', 'admin_password');
    
    // Create a temporary override - double the rate limit for 1 hour
    const override = await rateLimiter.createRateLimitOverride('client-api-key', {
      rateLimit: 200, // Temporary increased limit
      path: '/api/products', // Only for this path (optional)
      method: 'GET', // Only for this method (optional)
      duration: 3600, // 1 hour in seconds
      reason: 'Temporary increase for marketing campaign'
    });
    
    console.log('Created temporary rate limit override:', override);
    
    // You can also get all overrides
    const overrides = await rateLimiter.getRateLimitOverrides('client-api-key', true);
    console.log('Active overrides:', overrides);
    
    // Scheduled cleanup after the duration
    setTimeout(async () => {
      await rateLimiter.removeRateLimitOverride('client-api-key', override.data.id);
      console.log('Override removed');
    }, override.data.duration * 1000);
  } catch (error) {
    console.error('Error with rate limit override:', error);
  }
}

// Apply rate limiting to specific routes
app.use('/api/products', rateLimiter.middleware());

// Sample routes
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Product 1', price: 99.99 },
      { id: 2, name: 'Product 2', price: 149.99 },
      { id: 3, name: 'Product 3', price: 199.99 }
    ]
  });
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  res.json({
    success: true,
    data: { id, name: `Product ${id}`, price: 99.99 * id }
  });
});

// Apply different rate limits to different endpoints
app.use('/api/orders', rateLimiter.middleware({
  path: '/api/orders', // Custom path for tracking
  keyHeader: 'X-Client-API-Key' // Custom header name
}));

app.post('/api/orders', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      orderId: Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      ...req.body
    }
  });
});

// No rate limit for public endpoints
app.get('/public/info', (req, res) => {
  res.json({
    name: 'Sample API',
    version: '1.0.0',
    status: 'operational'
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
  console.log(`Try sending requests to http://localhost:${PORT}/api/products`);
  console.log('Include the X-API-Key header with your client API key');
});
