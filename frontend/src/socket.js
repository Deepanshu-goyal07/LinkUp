import { io } from './socket.io-client.js';

// Detect if we are running on the esbuild dev server port
const isDev = window.location.port === '5173';

// Connect to localhost:3000 in dev; otherwise use current origin in production
const socket = io(isDev ? 'http://localhost:5000' : '', { autoConnect: false });

export default socket;
