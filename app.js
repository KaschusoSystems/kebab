require('dotenv').config();

const path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  errorhandler = require('errorhandler'),
  mongoose = require('mongoose'),
  secret = require('./config').secret,
  eta = require('eta'),
  logger = require('./domain/logger');

const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();
app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('method-override')());
app.use(session({ secret: secret, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

// Express logging
app.use((req, res, done) => {
  logger.info(req.originalUrl);
  done();
});

if (!isProduction) {
  app.use(errorhandler());
}

// Set Eta's configuration
eta.configure({
  // This tells Eta to look for templates
  // In the /views directory
  views: path.join(__dirname, 'views')
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', { useNewUrlParser: true });

require('./models/User');
require('./config/passport');
require('./services/scheduler');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    logger.error(`app.errorHandler: ${err.stack}`);

    res.status(err.status || 500);

    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'errors': {
      message: err.message,
      error: {}
    }
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  logger.info(`app.listening.port-${server.address().port}`);
});