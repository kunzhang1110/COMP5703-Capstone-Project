var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var Router = require('./app/route');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', Router);

//catch 404
app.use(function(req, res, next) {
	  var err = new Error('Page Not Found');
	  err.status = 404;
	  next(err);
});

// error handler
app.use(function(err, req, res, next) {
	 // set locals, only providing error in development
	 res.locals.message = err.message;
	 res.locals.error = req.app.get('env') === 'development' ? err : {};
	 // render the error page
	 res.status(err.status || 500);
	 res.json({
		  message: err.message,
		  error: err
	 });
});

app.listen(3007, function () {
	console.log('app listening on port 3007!')
});
	
module.exports = app;