const http = require('http');

const data1 = JSON.stringify({ name: 'Product A', price: 10000 });
const req1 = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/products',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  res.on('data', d => console.log('1:', d.toString()));
  const data2 = JSON.stringify({ name: 'Product B', price: 20000 });
  const req2 = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res2 => {
    res2.on('data', d => console.log('2:', d.toString()));
    http.get('http://localhost:3000/api/products', res3 => {
      let body = '';
      res3.on('data', d => body += d);
      res3.on('end', () => console.log('Products:', JSON.parse(body).products.length));
    });
  });
  req2.write(data2);
  req2.end();
});
req1.write(data1);
req1.end();
