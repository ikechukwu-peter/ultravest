const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const passport = require('passport');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const authenticate = require('./config/passport');

const app = express();
// Set security HTTP headers
app.use(helmet());

// Body parser, reading data = require(body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//compress app
app.use(compression());

app.use(passport.initialize());

// Passport Config
authenticate(passport)

//CORS enable
app.use(cors());

// 3) ROUTES
//Respond to ping
app.get('/', (req, res) => {
  res.send('Pong')
})

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/admin", adminRouter)

//Handle all undefined route hit by the client
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    error: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
