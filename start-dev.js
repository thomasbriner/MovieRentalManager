import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Start the server
const server = spawn('tsx', ['server/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Start the client
const client = spawn('vite', [], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping servers...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  client.kill();
  process.exit(code);
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  server.kill();
  process.exit(code);
});