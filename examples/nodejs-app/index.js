console.log('Example Node.js Application');
console.log('Version:', process.env.VERSION || '1.0.0');
console.log('Environment:', process.env.NODE_ENV || 'development');

setTimeout(() => {
  console.log('Application started successfully');
}, 100);
