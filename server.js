// import { createServer } from 'http';
// import { parse } from 'url';
// import next from 'next';
// import { getSocket } from './lib/socket.mjs';

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev, dir: './', conf: { distDir: 'build' } });
// const handler = app.getRequestHandler();

// const port = 3000;

// app.prepare().then(() => {
//   const httpServer = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true);
//     const { pathname, query } = parsedUrl;

//     if (pathname === '/socket.io/socket.io.js') {
//       res.setHeader('Content-Type', 'text/javascript');
//       res.setHeader('Cache-Control', 'public, max-age=3600');
//       res.end('/* Contents of socket.io.js */');
//       return;
//     }

//     handler(req, res, parsedUrl);
//   });

//   getSocket().then((emitEvent) => {
//     httpServer.listen(port, (err) => {
//       if (err) throw err;
//       console.log(`> Ready on http://localhost:${port}`);
//     });
//   }).catch(err => {
//     console.error('Error initializing socket:', err);
//   });
// });
