import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Start the client
const client = spawn('npx', ['vite', '--host', '0.0.0.0'], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping client...');
  client.kill('SIGINT');
  process.exit(0);
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  process.exit(code);
});