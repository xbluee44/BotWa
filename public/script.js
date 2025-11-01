const socket = io();

document.getElementById('execute').addEventListener('click', () => {
  const cmd = document.getElementById('cmd').value;
  socket.emit('execute', cmd);
});

socket.on('output', (msg) => {
  document.getElementById('output').innerHTML += msg + '<br>';
});
