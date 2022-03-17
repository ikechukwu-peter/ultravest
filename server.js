
const cluster = require('cluster')
const cpus = require('os').cpus;
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' });

//initializing app
const app = require('./app');

const numWorkers = cpus().length;

if (cluster.isPrimary) {

  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {

  //Handle uncaughtExceptions
  process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! Server shutting down...");
    console.log(err.name, err.message, err.stack);
    process.exit(1);
  });


  //Connecting to mongoose
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV === "development") {
    console.log(process.env.DATABASE)
    mongoose
      .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("DB connection successful!")).catch((err) => console.log("DB connection failed " + err));
  }
  else {
    console.log(process.env.WEAVERBUXX_DATABASE)
    mongoose
      .connect(process.env.WEAVERBUXX_DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("DB connection successful!")).catch((err) => console.log("DB connection failed " + err));

  }


  //Setting port
  const port = process.env.PORT || 5000;

  //Listening for request
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });


  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message, err.stack);
    server.close(() => {
      process.exit(1);
    });
  });

  //For heroku
  process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shuttig down gracefully!!');

    server.close(() => {
      console.log('Process terminated!');
    })

  })


}