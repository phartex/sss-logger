const http = require('http');

const PORT = 4000;

const server = http.createServer((req, res) => {
  // Set headers for Server-Sent Events (SSE)
  if (req.url === '/api/logs') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests from your frontend
    });

    // Send an initial connection message
    const initialLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'SSE Stream connected successfully.',
    };
    res.write(`data: ${JSON.stringify(initialLog)}\n\n`);

    // Periodically send mock log events every 3 seconds
    const intervalId = setInterval(() => {
      const levels = ['INFO', 'WARN', 'ERROR'];
      const messages = [
        'User authentication successful',
        'Database query latency exceeded threshold',
        'Failed to process transaction payload',
        'Cache invalidated for user session',
        'Incoming webhook received from gateway',
      ];

      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const logEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: randomLevel,
        message: randomMessage,
      };

      res.write(`data: ${JSON.stringify(logEntry)}\n\n`);
    }, 3000);

    // Clean up interval if client disconnects
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Mock SSE Server running at http://localhost:${PORT}/api/logs`);
});
