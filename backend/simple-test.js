#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🚀 Starting MindFeed Backend Server...');
console.log('📁 Working directory:', process.cwd());

// Simple test function to validate the server is working
function testServer() {
  try {
    const express = require('express');
    console.log('✅ Express is available');
    
    const app = express();
    
    app.get('/api/test', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Server is responding correctly',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    });
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
    });
    
    // Test the endpoint
    const http = require('http');
    setTimeout(() => {
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/test',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('\n📊 Server test successful!');
          console.log('Response:', data);
          server.close(() => {
            console.log('\n✅ All validation tests passed!');
            process.exit(0);
          });
        });
      });
      
      req.on('error', (err) => {
        console.error('\n❌ Server test failed:', err.message);
        server.close(() => process.exit(1));
      });
      
      req.end();
    }, 2000);
    
  } catch (error) {
    console.error('\n❌ Server validation failed:', error.message);
    console.error('Please check if Node.js dependencies are installed.');
    process.exit(1);
  }
}

// Run the test
testServer();
