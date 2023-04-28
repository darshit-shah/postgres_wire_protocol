const { readStringFromBuffer, readStringFromBufferLength, getFieldDetails, getData, properQuery } = require('./utils');
const util = require('util');
function parseSSL(data) {
  return { command: "ssl" };
}
function parseParse(data) {
  let offset = 0;
  const queryName = readStringFromBuffer(data, offset);
  offset += queryName.length + 1;
  const query = readStringFromBuffer(data, offset);
  offset += query.length + 1;
  const len = data.readInt16BE(offset);
  offset += 2;
  const parameters = [];
  for (var i = 0; i < len; i++) {
    parameters.push(data.readUInt32BE(offset));
    offset += 4;
  }
  console.log(properQuery(query));
  return { command: "parse", queryName, query: properQuery(query), parameters };
}

function parsePassword(data) {
  let offset = 0;
  const MD5 = readStringFromBuffer(data, offset);
  return { command: "password", MD5 };
}

function parseStartup(data) {
  let offset = 0;
  const major = data.readUInt16BE(offset);
  offset += 2;
  const minor = data.readUInt16BE(offset);
  offset += 2;

  const initParams = {};
  while (offset < data.length) {
    const key = readStringFromBuffer(data, offset);
    offset += key.length + 1;
    const value = readStringFromBuffer(data, offset);
    offset += value.length + 1;
    initParams[key] = value;
  }
  return { command: "init", major, minor, ...initParams };
}

function parseBind(data) {
  let offset = 0;
  const portal = readStringFromBuffer(data, offset);
  offset += portal.length + 1;
  const statement = readStringFromBuffer(data, offset);
  offset += statement.length + 1;

  const typeLength = data.readInt16BE(offset);
  offset += 2;
  const datatypes = [];
  for (let i = 0; i < typeLength; i++) {
    datatypes[i] = data.readInt16BE(offset);
    offset += 2;
  }
  const dataLength = data.readInt16BE(offset);
  offset += 2;
  if (typeLength !== dataLength) {
    throw new Error('Length of type & data is not matching');
  }
  const values = [];
  for (let i = 0; i < dataLength; i++) {
    const datatype = datatypes[i];
    switch (datatype) {
      case DatatypeCode.String:
        const strLen = data.readInt32BE(offset);
        offset += 4;
        if (strLen >= 0) {
          values[i] = readStringFromBufferLength(data, offset, strLen);
          offset += values[i].length;
        }
        else {
          values[i] = null;
        }
        break;
      case DatatypeCode.Binary:
        const bufLen = data.readInt32BE(offset);
        offset += 4;
        values[i] = data.subarray(offset, offset + bufLen);
        offset += values.length;
        break;
    }
  }
  const binary = data.readInt16BE(offset);
  offset += 2;
  const isBinary = binary === DatatypeCode.Binary;
  return { command: "bind", portal, statement, isBinary, values };
}

function parseDescribe(data) {
  let offset = 0;
  const value = readStringFromBuffer(data, offset);
  offset += value.length + 1;
  const portalType = value[0];
  if (portalType !== 'P' && portalType !== 'S') {
    throw new Error(`Unknown Portal Type "${value}"`);
  }
  const name = value.substring(1);
  return { command: "describe", portalType, name };
}

function parseExecute(data) {
  let offset = 0;
  const portal = readStringFromBuffer(data, offset);
  offset += portal.length + 1;
  const rows = data.readUInt32BE(offset);
  offset += 4;
  return { command: "execute", portal, rows };
}

function parseSync(data) {
  return { command: "sync" };
}

function parseQuery(data) {
  return { command: "query" };
}

function parseFlush(data) {
  return { command: "flush" };
}

function parseEnd(data) {
  return { command: "end" };
}

function parseClose(data) {
  return { command: "close" };
}

function parseCopyFromChunk(data) {
  return { command: "copyFromChunk" };
}

function parseCopyDone(data) {
  return { command: "copyDone" };
}

function parseCopyFail(data) {
  return { command: "copyFail" };
}

function parseError(data) {
  return { command: "error" };
}

function sendSSLResponse(commandData, additionalData) {
  return 'N';
}

function sendStartupResponse(commandData, additionalData) {
  return sendAuthenticationOk(3)
}

function sendPasswordResponse(commandData, additionalData) {
  return Buffer.concat([
    sendAuthenticationOk(0),
    sendParameterStatusMessage([
      { key: 'server_version', value: '1.0 (Monitor Backend SQL)' },
      { key: 'server_encoding', value: 'UTF8' },
      { key: 'client_encoding', value: 'UTF8' },
      { key: 'DateStyle', value: 'ISO' },
      { key: 'integer_datetimes', value: 'on' },
      { key: 'TimeZone', value: 'Etc/UTC' },
      { key: 'IntervalStyle', value: 'postgres' },
      { key: 'standard_conforming_strings', value: 'on' }
    ]),
    sendBackendKeyData(additionalData.pid, 5679),
    sendReadyForQuery()
  ])
}
function sendQueryResponse(commandData, additionalData) {
  return null;
}
function sendParseResponse(commandData, additionalData) {
  const parseBuffer = Buffer.alloc(5);
  parseBuffer.writeUint8(ResponseCodes.ParseComplete, 0);
  parseBuffer.writeInt32BE(4, 1); // Length
  return parseBuffer;
}
function sendBindResponse(commandData, additionalData) {
  const bindBuffer = Buffer.alloc(5);
  bindBuffer.writeUint8(ResponseCodes.BindComplete, 0);
  bindBuffer.writeInt32BE(4, 1); // Length
  return bindBuffer;
}
function sendExecuteResponse(commandData, additionalData) {
  const requiredLength = 4 + (additionalData.recordsLength === null ? 3 : (7 + additionalData.recordsLength.toString().length)) + 1;
  const executeBuffer = Buffer.alloc(1 + requiredLength);
  executeBuffer.writeUint8(ResponseCodes.CommandComplete, 0);
  executeBuffer.writeInt32BE(requiredLength, 1); // Length
  if (additionalData.recordsLength === null) {
    executeBuffer.write('SET', 5);
  } else {
    executeBuffer.write('SELECT ' + additionalData.recordsLength.toString(), 5);
  }
  return executeBuffer;
}
function sendFlushResponse(commandData, additionalData) {
  return null;
}
function sendSyncResponse(commandData, additionalData) {
  return sendReadyForQuery();
}
function sendEndResponse(commandData, additionalData) {
  return null;
}
function sendCloseResponse(commandData, additionalData) {
  return null;
}
function sendDescribeResponse(commandData, additionalData) {
  return Buffer.concat([
    sendFieldDetails(commandData, additionalData),
    sendData(commandData, additionalData)
  ]);
}
function sendCopyFromChunkResponse(commandData, additionalData) {
  return null;
}
function sendCopyDoneResponse(commandData, additionalData) {
  return null;
}
function sendCopyFailResponse(commandData, additionalData) {
  return null;
}

function sendErrorResponse(commandData, additionalData) {
  return Buffer.concat([
    sendError(commandData),
    sendReadyForQuery()
  ]);
}

function sendAuthenticationOk(number) {
  const authOkBuffer = Buffer.alloc(9);
  authOkBuffer.writeUint8(ResponseCodes.AuthenticationResponse, 0);
  authOkBuffer.writeInt32BE(8, 1); // Length
  authOkBuffer.writeInt32BE(number, 5); // AuthenticationOk
  return authOkBuffer;
}

function sendParameterStatusMessage(keyValuePairs) {
  return Buffer.concat(keyValuePairs.map(d => generateKeyValuePair(d.key, d.value)));
}

function sendBackendKeyData(processId, secretKey) {
  const backendKeyDataBuffer = Buffer.alloc(13);
  backendKeyDataBuffer.writeUint8(ResponseCodes.BackendKeyData, 0);
  backendKeyDataBuffer.writeInt32BE(12, 1); // + serverVersion.length
  backendKeyDataBuffer.writeUInt32BE(processId, 5)
  backendKeyDataBuffer.writeUInt32BE(secretKey, 9)
  return backendKeyDataBuffer;
}

function sendReadyForQuery() {
  const readyForQueryBuffer = Buffer.alloc(6);
  readyForQueryBuffer.writeUInt8(ResponseCodes.ReadyForQuery, 0);
  readyForQueryBuffer.writeInt32BE(5, 1); // Message length
  readyForQueryBuffer.writeUInt8(ResponseCodes.EmptyQuery, 5);
  return readyForQueryBuffer;
}

function generateKeyValuePair(key, value) {
  const response = Buffer.alloc(1 + 4 + key.length + 1 + value.length + 1);
  let currentPos = 0;
  response.writeUint8(ResponseCodes.ParameterStatus, currentPos);
  currentPos++;
  response.writeInt32BE(4 + key.length + 1 + value.length + 1, currentPos); // Message length
  currentPos += 4;
  response.write(key, currentPos);
  currentPos += key.length;
  response.writeInt8(0, currentPos);
  currentPos++;
  response.write(value, currentPos);
  currentPos += value.length;
  response.writeInt8(0, currentPos);
  currentPos++;
  return response;
}

function sendFieldDetails(commandData, additionalData) {
  const fieldDetails = getFieldDetails(additionalData.rawQuery, additionalData.parsedQuery);
  const fieldLength = 4 + 2 + fieldDetails.map(f => (f.name.length + 1 + 18)).reduce((a, c) => a + c, 0);
  const describeBuffer = Buffer.alloc(1 + fieldLength);
  let offset = 0;
  describeBuffer.writeUInt8(ResponseCodes.RowDescriptionMessage, offset);
  offset += 1;
  describeBuffer.writeUInt32BE(fieldLength, offset); // Length
  offset += 4;
  describeBuffer.writeUInt16BE(fieldDetails.length, offset); // Field Count
  offset += 2;
  fieldDetails.forEach(f => {
    describeBuffer.write(f.name, offset);
    offset += f.name.length + 1;
    describeBuffer.writeUInt32BE(f.tableID, offset);
    offset += 4;
    describeBuffer.writeUInt16BE(f.columnID, offset);
    offset += 2;
    describeBuffer.writeUInt32BE(f.dataTypeID, offset);
    offset += 4;
    describeBuffer.writeInt16BE(f.dataTypeSize, offset);
    offset += 2;
    describeBuffer.writeInt32BE(f.dataTypeModifier, offset);
    offset += 4;
    describeBuffer.writeInt16BE(f.mode, offset);
    offset += 2;
  });
  return describeBuffer;
}

function sendData(commandData, additionalData) {
  const fieldDetails = getFieldDetails(additionalData.rawQuery, additionalData.parsedQuery);
  const records = getData(fieldDetails, additionalData.rawQuery, additionalData.parsedQuery);
  additionalData.recordsLength = records.length;
  const buffers = records.map((record) => {
    const recordLength = 4 + 2 + record.map((field, index) => (field === null ? 4 : (4 + (typeof field === 'string' ? field.length : fieldDetails[index].dataTypeSize)))).reduce((a, c) => a + c, 0);
    const recordBuffer = Buffer.alloc(1 + recordLength);
    let offset = 0;
    recordBuffer.writeUInt8(ResponseCodes.DataRow, offset);
    offset += 1;
    recordBuffer.writeUInt32BE(recordLength, offset); // Length
    offset += 4;
    recordBuffer.writeUInt16BE(record.length, offset); // Field Count
    offset += 2;
    record.forEach((field, index) => {
      if (field === null) {
        recordBuffer.writeInt32BE(-1, offset); // Length
        offset += 4;
      } else {
        if (typeof field === 'string') {
          recordBuffer.writeUInt32BE(field.length, offset); // Length
          offset += 4;
          recordBuffer.write(field, offset); // Length
          offset += field.length;
        } else {
          const { dataTypeID, dataTypeSize } = fieldDetails[index];
          recordBuffer.writeUInt32BE(dataTypeSize, offset); // Length
          offset += 4;
          if (dataTypeID === 23) {
            recordBuffer.writeInt32BE(field, offset);
            offset += 4;
          } else if (dataTypeID === 20) {
            recordBuffer.writeBigInt64BE(field, offset);
            offset += 8;
          } else if (dataTypeID === 700) {
            recordBuffer.writeFloatBE(field, offset)
            offset += 4;
          } else if (dataTypeID === 701) {
            recordBuffer.writeDoubleBE(field, offset);
            offset += 8;
          }
          else {
            throw new Error(`Datatype id "${dataTypeID}" is not handled.`)
          }
        }
      }
    });
    return recordBuffer;
  });
  return Buffer.concat(buffers);
}

function sendError(error) {
  error = error instanceof Error ? util.inspect(error) : error;
  error = typeof error === 'string' ? { code: 'MB000', message: error } : error;
  let size = 4;
  const errorData = [];
  for (const [key, value] of Object.entries(error)) {
    const code = errorKeyToCodeMapping[key];
    if (code && typeof value === 'string' && value) {
      errorData.push([code[0], value]);
      size += 1 + value.length + 1;
    }
  }
  size += 1;
  const errorBuffer = Buffer.alloc(1 + size);
  let offset = 0;
  errorBuffer.writeUint8(ResponseCodes.ErrorMessage, offset);
  offset += 1;
  errorBuffer.writeInt32BE(size, offset); // Length
  offset += 4;
  errorData.forEach(e => {
    errorBuffer.write(e[0], offset);
    offset += 1;
    errorBuffer.write(e[1], offset);
    offset += e[1].length + 1;
  });
  errorBuffer.writeUint8(0, offset);
  offset += 1;
  return errorBuffer;
}

const DatatypeCode = {
  String: 0,
  Binary: 1
}

const errorKeyToCodeMapping = {
  'message': 'M',
  'severity': 'S',
  'code': 'C',
  'detail': 'D',
  'hint': 'H',
  'position': 'P',
  'internalPosition': 'p',
  'internalQuery': 'q',
  'where': 'W',
  'schema': 's',
  'table': 't',
  'column': 'c',
  'dataType': 'd',
  'constraint': 'n',
  'file': 'F',
  'line': 'L',
  'routine': 'R',
  'text': 'V'
};

const ResponseCodes = {
  DataRow: 68,
  ParseComplete: 49,
  BindComplete: 50,
  CloseComplete: 51,
  CommandComplete: 67,
  ReadyForQuery: 90,
  NoData: 110,
  NotificationResponse: 65,
  AuthenticationResponse: 82,
  ParameterStatus: 83,
  BackendKeyData: 75,
  ErrorMessage: 69,
  NoticeMessage: 78,
  RowDescriptionMessage: 84,
  PortalSuspended: 115,
  ReplicationStart: 87,
  EmptyQuery: 73,
  CopyIn: 71,
  CopyOut: 72,
  CopyDone: 99,
  CopyData: 100
}

const CommandCodes = {
  ssl: { code: 0, command: "ssl", parseCommand: parseSSL, sendResponse: sendSSLResponse },
  startup: { code: 0, command: "startup", parseCommand: parseStartup, sendResponse: sendStartupResponse },
  password: { code: 112, command: "password", parseCommand: parsePassword, sendResponse: sendPasswordResponse },
  query: { code: 81, command: "query", parseCommand: parseQuery, sendResponse: sendQueryResponse },
  parse: { code: 80, command: "parse", parseCommand: parseParse, sendResponse: sendParseResponse },
  bind: { code: 66, command: "bind", parseCommand: parseBind, sendResponse: sendBindResponse },
  execute: { code: 69, command: "execute", parseCommand: parseExecute, sendResponse: sendExecuteResponse },
  flush: { code: 72, command: "flush", parseCommand: parseFlush, sendResponse: sendFlushResponse },
  sync: { code: 83, command: "sync", parseCommand: parseSync, sendResponse: sendSyncResponse },
  end: { code: 88, command: "end", parseCommand: parseEnd, sendResponse: sendEndResponse },
  close: { code: 67, command: "close", parseCommand: parseClose, sendResponse: sendCloseResponse },
  describe: { code: 68, command: "describe", parseCommand: parseDescribe, sendResponse: sendDescribeResponse },
  copyFromChunk: { code: 100, command: "copyFromChunk", parseCommand: parseCopyFromChunk, sendResponse: sendCopyFromChunkResponse },
  copyDone: { code: 99, command: "copyDone", parseCommand: parseCopyDone, sendResponse: sendCopyDoneResponse },
  copyFail: { code: 102, command: "copyFail", parseCommand: parseCopyFail, sendResponse: sendCopyFailResponse },
  error: { code: null, command: "error", parseCommand: parseError, sendResponse: sendErrorResponse }
}

module.exports = CommandCodes;