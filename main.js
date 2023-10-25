require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to the database!'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-secret',
  saveUninitialized: true,
  resave: false,
}));

// Locals middleware for session data
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Set template engine
app.set('views', path.join('routes', 'views')); // Adjust the path as needed
app.set('view engine', 'ejs');

// Route Prefix
app.use(require('./routes/routes.js')); // Adjust the path as needed

app.use(express.static("uploads"));
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
