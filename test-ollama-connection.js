// Test Ollama connection from Node.js
import http from 'node:http';

const options = {
  hostname: '192.168.50.30',
  port: 11434,
  path: '/api/tags',
  method: 'GET',
  timeout: 5000,
};

console.log('Attempting to connect to Ollama...');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, res => {
  console.log(`✅ SUCCESS! Status: ${res.statusCode}`);

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', error => {
  console.error('❌ ERROR:', error.message);
  console.error('Error code:', error.code);
  console.error('Error stack:', error.stack);
});

req.on('timeout', () => {
  console.error('❌ TIMEOUT: Connection timed out');
  req.destroy();
});

req.end();
