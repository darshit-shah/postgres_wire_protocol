const CommandCodes = require("./command_utils");

function parseAndProcessCommand(socket, commandCode, commandBufferData, length) {
  const { __data } = socket;
  const matchingCommand = findMatchingCommand(commandCode, length);
  const commandData = parseCommand(matchingCommand, commandBufferData);
  console.log(commandData);
  __data.commandData = commandData;
  const additionalData = __data.additionalData;
  if (matchingCommand.command === CommandCodes.startup.command) {
    if (__data.isStartupCompleted === true) {
      throw new Error("Startup already called");
    } else {
      __data.isStartupCompleted = true;
    }
  } else if (matchingCommand.command === CommandCodes.parse.command) {
    additionalData.recordsLength = null;
    additionalData.rawQuery = commandData.query;
    try {
      additionalData.parsedQuery = __data.parser.astify(commandData.query);
    }
    catch (ex) {
      additionalData.parsedQuery = null;
    }
  } 
  try {
    const response = processCommand(matchingCommand, commandData, additionalData);
    if (response) {
      socket.write(response);
    }
    return false;
  } catch (ex) {
    if(ex && ex.message){
      console.error(ex);
    }
    const response = processCommand(CommandCodes.error, ex.message || ex, additionalData);
    if (response) {
      socket.write(response);
    }
  }
  return true;
}

function findMatchingCommand(commandCode, length) {
  let matchingCommand = null;
  if (commandCode === CommandCodes.ssl.code && length === 8) {
    matchingCommand = CommandCodes.ssl;
  } else {
    if (commandCode === CommandCodes.startup.code) {
      matchingCommand = CommandCodes.startup;
    } else if (commandCode === CommandCodes.password.code) {
      matchingCommand = CommandCodes.password;
    }
    else if (commandCode === CommandCodes.parse.code) {
      matchingCommand = CommandCodes.parse;
    }
    else if (commandCode === CommandCodes.bind.code) {
      matchingCommand = CommandCodes.bind;
    }
    else if (commandCode === CommandCodes.describe.code) {
      matchingCommand = CommandCodes.describe;
    }
    else if (commandCode === CommandCodes.execute.code) {
      matchingCommand = CommandCodes.execute;
    }
    else if (commandCode === CommandCodes.sync.code) {
      matchingCommand = CommandCodes.sync;
    }
    else if (commandCode === CommandCodes.end.code) {
      matchingCommand = CommandCodes.end;
    }
    else {
      console.log("Unknown command", commandCode);
    }
  }
  return matchingCommand;
}
function parseCommand(matchingCommand, commandBufferData) {
  if (matchingCommand && typeof matchingCommand.parseCommand === 'function') {
    return matchingCommand.parseCommand(commandBufferData);
  } else {
    throw new Error(`parseCommand not implemented for command "${matchingCommand.command}"`)
  }
}

function processCommand(matchingCommand, commandData, additionalData) {
  if (matchingCommand && typeof matchingCommand.parseCommand === 'function') {
    return matchingCommand.sendResponse(commandData, additionalData);
  } else {
    throw new Error(`sendResponse not implemented for command "${matchingCommand.command}"`)
  }
}

module.exports = parseAndProcessCommand;