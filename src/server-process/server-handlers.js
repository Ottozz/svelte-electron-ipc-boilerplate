let { exampleFunc } = require('./services/service');

let handlers = {}

handlers._history = []

/* Define here the messages to listen and the function to execute */
handlers['message'] = async (params) => {
    /* params is the input provided by the renderer process with the send() function */
    return await exampleFunc(params);
}

module.exports = handlers