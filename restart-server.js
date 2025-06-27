// Script restart server
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔄 Restarting server...');

// Kiểm tra xem app.js có tồn tại không
if (!fs.existsSync('./app.js')) {
  console.error('❌ app.js not found');
  process.exit(1);
}

// Kill tất cả process node hiện tại (trừ process hiện tại)
const killNodeProcesses = () => {
  return new Promise((resolve) => {
    const tasklist = spawn('tasklist', ['/FI', 'IMAGENAME eq node.exe', '/FO', 'CSV']);
    let output = '';
    
    tasklist.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tasklist.on('close', () => {
      const lines = output.split('\n');
      const pids = [];
      
      lines.forEach(line => {
        if (line.includes('node.exe') && !line.includes('PID')) {
          const match = line.match(/"(\d+)"/);
          if (match && match[1] !== process.pid.toString()) {
            pids.push(match[1]);
          }
        }
      });
      
      if (pids.length > 0) {
        console.log(`🔄 Killing ${pids.length} Node.js processes...`);
        pids.forEach(pid => {
          try {
            process.kill(pid, 'SIGTERM');
            console.log(`   Killed process ${pid}`);
          } catch (error) {
            console.log(`   Process ${pid} already terminated`);
          }
        });
      }
      
      setTimeout(resolve, 2000); // Đợi 2 giây
    });
  });
};

// Start server mới
const startServer = () => {
  console.log('🚀 Starting new server...');
  const server = spawn('node', ['app.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  return server;
};

// Main function
async function restart() {
  try {
    await killNodeProcesses();
    const server = startServer();
    
    console.log('✅ Server restarted successfully!');
    console.log('📝 You can now test the forgot-password API');
    
  } catch (error) {
    console.error('❌ Error restarting server:', error);
  }
}

restart(); 