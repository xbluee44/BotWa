const express = require('express');
const http = require('http');
const session = require('express-session');
const { Server } = require("socket.io");
const childProcess = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'botwa-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware cek login
function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) next();
  else res.redirect('/login.html');
}

// Halaman utama butuh login
app.get('/BotWA.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'BotWA.html'));
});

// API login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Socket.io untuk eksekusi perintah
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('execute', (cmd) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        io.emit('output', `❌ Error: ${err.message}`);
        return;
      }
      io.emit('output', stdout || stderr);
    });
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

// Jalankan server
server.listen(process.env.PORT || 3000, () => {
  console.log('✅ Server berjalan di port', process.env.PORT || 3000);
});
