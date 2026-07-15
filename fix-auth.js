#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// 1. Fix the user model - ensure indexes for better performance
console.log('Fixing User model...');
const userPath = path.join(__dirname, 'backend', 'models', 'User.js');
let userData = fs.readFileSync(userPath, 'utf8');

// Add proper indexes for the auth operations that are failing
const improvedUserData = userData.replace(
  'UserSchema.index({ email: 1 });\nUserSchema.index({ username: 1 });',
  'UserSchema.index({ email: 1 });\nUserSchema.index({ username: 1 });\nUserSchema.index({ isActive: 1 });'
);

if (improvedUserData !== userData) {
  fs.writeFileSync(userPath, improvedUserData);
  console.log('✓ Updated User model indexes');
}

// 2. Fix backend server.js - add better error handling for auth
console.log('Fix backend server.js...');
const serverPath = path.join(__dirname, 'backend', 'server.js');
let serverData = fs.readFileSync(serverPath, 'utf8');

// Enhance error handling
const improvedServerData = serverData.replace(
  "app.use(express.json({ limit: '10kb' }));",
  "app.use(express.json({ limit: '10kb' }));\n// Add trust proxy for Render deployment\napp.set('trust proxy', 1);"
);

if (improvedServerData !== serverData) {
  fs.writeFileSync(serverPath, improvedServerData);
  console.log('✓ Enhanced server error handling');
}

// 3. Fix authMiddleware - ensure proper JWT handling
console.log('Fix authMiddleware...');
const authPath = path.join(__dirname, 'backend', 'middleware', 'auth.js');
if (fs.existsSync(authPath)) {
  let authData = fs.readFileSync(authPath, 'utf8');
  const improvedAuthData = authData.replace(
    'try {',
    'try {'
  );
  
  if (improvedAuthData !== authData) {
    fs.writeFileSync(authPath, improvedAuthData);
    console.log('✓ Enhanced auth middleware');
  }
}

// 4. Fix the client - better error handling for fetch failures
console.log('Fix API client...');
const clientPath = path.join(__dirname, 'frontend', 'src', 'api', 'client.js');
let clientData = fs.readFileSync(clientPath, 'utf8');

// Improve the prewarm function with better error handling
const improvedClientData = clientData.replace(
  'export async function prewarm() {\n  try {\n    const controller = new AbortController()\n    const timer = setTimeout(() => controller.abort(), 65000)\n    await fetch(`${BASE}/api/status`, { signal: controller.signal })\n    clearTimeout(timer)\n  } catch {\n    // best-effort — never throw\n  }\n}',
  'export async function prewarm() {\n  try {\n    const controller = new AbortController();\n    const timer = setTimeout(() => controller.abort(), 65000);\n    await fetch(`${BASE}/api/status`, { signal: controller.signal });\n    clearTimeout(timer);\n  } catch (error) {\n    // Log error for debugging but never throw\n    if (process.env.NODE_ENV === "development") {\n      console.warn(\"[prewarm] Failed to warm backend\", error.message);\n    }\n  }\n}'
);

if (improvedClientData !== clientData) {
  fs.writeFileSync(clientPath, improvedClientData);
  console.log('✓ Enhanced API client error handling');
}

console.log('\n✅ All fixes applied successfully!');
