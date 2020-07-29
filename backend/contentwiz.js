require('events').EventEmitter.defaultMaxListeners = Infinity;
let express = require('express'),
	app = express(),
	server = require('http').Server(app),
	path = require("path"),
	userRoute = require('./Routes/user'),
	bodyParser = require('body-parser'),
	httpLogger = require('./logger/httpLogger');

app.use("/contentwiz", express.static(path.join(__dirname, 'contentwiz')));

app.get('/contentwiz*',(req, res) => {
	res.sendFile(`${__dirname}/contentwiz/index.html`);
})

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, noauth, token, noauthother");
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next()
});
app.use(function (err, req, res, next) {
	const util = require("Utilities/util")
	return res.send({ "errorCode": util.statusCode.FOUR_ZERO_ZERO, "errorMessage": util.statusMessage.SOMETHING_WENT_WRONG });
});
app.use(httpLogger);
app.use('/api/user', userRoute);

const PORT = 5452
server.listen(PORT, function (err) {
	console.log('Server running on port ', PORT);
})
