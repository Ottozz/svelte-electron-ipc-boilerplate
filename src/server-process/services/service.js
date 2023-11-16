const exampleFunc = (params) => {
    return new Promise((resolve, reject) => {
        let response = {};
        
        try{
            //Do something with params
            response.result = "OK";
            response.data = "this is a response from the server process";
        } catch(err) {
            response.result = "KO";
            response.data = err;
        } finally {
            resolve(response);
        }
    });
}

module.exports = {
    exampleFunc
}