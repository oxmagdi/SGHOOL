const createError = require('http-errors');
const express = require('express');
const path = require('path'); 

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const logger = require('morgan');
const favicon = require('serve-favicon');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* using session  */
app.use(session({
  secret:'secret',
  saveUninitialized:true,
  resave:true
}));

/* passport */
app.use(passport.initialize());
app.use(passport.session());


/* add express validator */
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());
app.use((req, res, next)=>{
  res.locals.messages = require('express-messages')(req, res);
  next();
});


/* adding pathes */
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
