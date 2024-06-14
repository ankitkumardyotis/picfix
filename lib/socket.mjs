// // libs/socket.mjs
// import { createServer } from 'http';
// import next from 'next';
// import { Server } from 'socket.io';

// const dev = process.env.NODE_ENV !== 'production';
// const hostname = 'localhost';
// const port = 3000;
// const app = next({ dev, dir: './', conf: { distDir: 'build' } });
// const handler = app.getRequestHandler();

// let io;

// export const getSocket = async () => {
//   if (!io) {
//     await app.prepare();
//     const httpServer = createServer(handler);

//     io = new Server(httpServer);

//     io.on('connection', (socket) => {
//       console.log('User Connected');
//       socket.on('disconnect', () => {
//         console.log('User Disconnected');
//       });
//     });

//     httpServer.once('error', (err) => {
//       console.error(err);
//       process.exit(1);
//     });

//     httpServer.listen(port, () => {
//       console.log(`> Ready on http://${hostname}:${port}`);
//     });
//   }

//   const emitEvent = (eventName, data) => {
//     if (io) {
//       io.emit(eventName, data);
//     } else {
//       console.log('Socket.io is not initialized');
//     }
//   };

//   return emitEvent;
// };
