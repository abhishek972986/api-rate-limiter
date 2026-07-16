const app = require('./app');
const connectDB = require('./config/database');

// Set default port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});