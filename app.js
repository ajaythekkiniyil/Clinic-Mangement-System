var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var connect=require('./config/connection');
var session=require('express-session');
var fileUpload=require('express-fileupload');

var passport=require('passport')


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var doctorRouter = require('./routes/doctor')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({ layoutsDir: __dirname + '/views/layout', defaultLayout: 'layout', extname: 'hbs', partialsDir: __dirname + '/views/partials' }))

app.use(passport.initialize())
app.use(fileUpload());
app.use(session({
   secret: 'secret-key',
    cookie: { maxAge: 300000 } ,
    resave: true,
    saveUninitialized: true
  }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


connect.connect();
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/doctor',doctorRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
