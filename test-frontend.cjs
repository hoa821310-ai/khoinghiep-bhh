const http = require('http');

async function test() {
  // Add A
  const pA = {
    id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: 'Product A', price: 10000, status: 'AVAILABLE', createdAt: new Date().toISOString(), createdBy: 'Test'
  };
  await new Promise(r => {
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/products', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      res.on('data', () => {}); res.on('end', r);
    });
    req.write(JSON.stringify(pA)); req.end();
  });

  // Add B
  const pB = {
    id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: 'Product B', price: 20000, status: 'AVAILABLE', createdAt: new Date().toISOString(), createdBy: 'Test'
  };
  await new Promise(r => {
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/products', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      res.on('data', () => {}); res.on('end', r);
    });
    req.write(JSON.stringify(pB)); req.end();
  });

  // Get products
  http.get('http://localhost:3000/api/products', res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('Final length:', JSON.parse(body).products.length));
  });
}
test();
