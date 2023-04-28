const net = require('net');
const { Parser } = require('node-sql-parser/build/postgresql');
const parseAndProcessCommand = require('./process_command');
let pid = 0;
const server = net.createServer((socket) => {
  pid++;
  let prevBuffer = Buffer.alloc(0);
  const __data = {
    isSSLCompleted: false,
    isStartupCompleted: false,
    commandData: null,
    parser: new Parser(),
    additionalData: { pid }
  };
  socket.__data = __data;
  socket.on('data', (newBuffer) => {
    let offset = 0;
    let data = Buffer.concat([prevBuffer, newBuffer]);
    while (data.length > 0) {
      const commandCode = data.readUint8(offset);
      if (commandCode) {
        offset += 1;
      }
      const len = data.readUInt32BE(offset);
      if (offset + len <= data.length) {
        offset += 4;
        const commandBufferData = data.subarray(offset, offset + len - 4);
        offset += commandBufferData.length;
        const isErrorSent = parseAndProcessCommand(socket, commandCode, commandBufferData, len);
        if (isErrorSent) {
          data = [];
        } else {
          data = data.subarray(offset);
        }
        offset = 0;
      } else {
        prevBuffer = data;
        data = [];
      }
    }
  });
});

server.listen(5432, () => {
  console.log('Postgres server listening on port 5432');
});