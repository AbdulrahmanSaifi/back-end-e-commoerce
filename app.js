const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth.js');
const { connectDB,syncModels } = require('./config/db'); // استيراد الاتصال بقاعدة البيانات
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, 
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// الاتصال بقاعدة البيانات
connectDB();
syncModels();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
