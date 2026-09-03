const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The simplest way to disable the old local database logic is to just empty the endpoints or leave them alone, they won't be called.
// But to be completely compliant with "Không dùng database.json làm production database nữa":
const newServer = `
import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API endpoints are now handled directly via Firebase SDK in the client.
  app.get('/api/health', (req, res) => res.json({ status: 'ok', usingFirebase: true }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer().catch(console.error);
`;

fs.writeFileSync('server.ts', newServer);
