const fs = require('fs');
const path = require('path');

console.log('🔍 Checking backend dependencies...');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Try to read package.json and check dependencies
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Dependencies installed:');
console.log(`  express: ${packageJson.dependencies?.express || 'NOT FOUND'}`);
console.log(`  mongoose: ${packageJson.dependencies?.mongoose || 'NOT FOUND'}`);
console.log(`  cors: ${packageJson.dependencies?.cors || 'NOT FOUND'}`);

// Try to require and use express
console.log('\n🔧 Testing express import...');
try {
  // Clear require cache and try again
  delete require.cache[require.resolve('express')];
  const express = require('express');
  console.log('✅ Express imported successfully');
  console.log(`  version: ${require('express/package.json').version}`);
  
  // Create a simple app
  const app = express();
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      node: process.version,
      cwd: process.cwd()
    });
  });
  
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Health check server running on port ${PORT}`);
  });
  
  // Test the server
  setTimeout(() => {
    console.log('\n🧪 Testing server endpoints...');
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`📡 Health check response: ${res.statusCode}`);
      res.on('data', (chunk) => {
        console.log('📊 Response data:', chunk.toString());
      });
      res.on('end', () => {
        console.log('✅ All tests passed!');
        server.close(() => process.exit(0));
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ HTTP request failed:', err.message);
      server.close(() => process.exit(1));
    });
    
    req.end();
  }, 1000);
  
} catch (error) {
  console.error('❌ Failed to import express:', error.message);
  console.error('  Please check if dependencies are installed');
  process.exit(1);
}
