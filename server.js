var net = require('net');
var os = require('os');

const options = {
  ip: getIpAddr(),
  port: 1337
}

const sockets = new Set();
let companies = [];

var server = net.createServer(socket => {
  sockets.add(socket);
  console.log('Client connected');
  socket.on('end', () => { 
    sockets.delete(socket); 
    console.log('Client disconnected');
  });
  socket.on('data', chunk => {
    const obj = JSON.parse(chunk)
    if(obj.task === "connect"){
      companies.push(obj.company)
      sockets.broadcast(`{"task": "ties", "ties": ${JSON.stringify(companies)}}`);
    }
    if(obj.task === "disconnect"){
      const index = companies.indexOf(obj.company);
      if (index > -1) {
        companies.splice(index, 1);
      }
      sockets.broadcast(`{"task": "ties", "ties": ${JSON.stringify(companies)}}`);
    }
    if(obj.task === "message"){
      sockets.broadcast(`${chunk}`);
    }
    console.log(companies)
  });
}).listen(options.port, options.ip, () => {
  console.log(`Server listening at ${options.ip}:${options.port}`)
 });

sockets.broadcast = function(data) {
  for (let socket of this) {
    socket.write(data);
  }
}

function getIpAddr() {
  var networkInterfaces = os.networkInterfaces();
  delete networkInterfaces.lo
  return networkInterfaces[Object.keys(networkInterfaces)[0]][0].address
}