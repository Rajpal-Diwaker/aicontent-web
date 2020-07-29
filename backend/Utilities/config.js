let environment = require('./environment').environment;
let serverURLs = require("./cred").serverURLs;
let config = {
    "secret": 'perfect_mind',
    "DB_URL": {
        "host": `${serverURLs[environment].MYSQL_HOST}`,
        "user": `${serverURLs[environment].MYSQL_USER}`,
        "password": `${serverURLs[environment].MYSQL_PASSWORD}`,
        "database": `${serverURLs[environment].MYSQL_DATABASE}`
    },
    "EMAIL_CONFIG": {
        "host": `${serverURLs[environment].EMAIL_HOST}`,
        "port": `${serverURLs[environment].EMAIL_PORT}`,
        "secure": `${serverURLs[environment].EMAIL_SECURE}`,
		"requireTLS": `${serverURLs[environment].EMAIL_TLS}`,
        "auth": {
            "user": `${serverURLs[environment].EMAIL_USER}`,
            "pass": `${serverURLs[environment].EMAIL_PASS}`,
        }
    },
    "NODE_SERVER_PORT": {
        "port": `${serverURLs[environment].NODE_SERVER_PORT}`
    },
    "NODE_SERVER_URL": {
        "url": `${serverURLs[environment].NODE_SERVER}`
    },
    "FCM_SERVER_KEY": "AAAAPzVApUk:APA91bFV440qDwIqtdq6AucUPt3aPnhyBa8JVLRGLKtNrLf2vreImy0vRxAv5cCbr3zzHIt-48rZ9g86j9I4mQd_pXP_5BsfJCp9l03x4SLMvCP0wY9aLPW5zcfUEnlxBUGyUaSeyEJk"
     ,"auth_key":'255679118b997f68565d3838cd695',
      "sender_id" : 'TPMAPP',
      "baseurl":'https://tpmpwadev.s3.us-west-2.amazonaws.com/',
};
module.exports = {
    config: config,
};