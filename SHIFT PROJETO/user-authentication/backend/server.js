const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path'); // To handle file paths correctly
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables from .env
const app = express();
const port = 3000;

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory (this is now at the root level)
app.use(express.static(path.join(__dirname, '../public'))); // Ensure this points to the 'public' folder in the root

// Serve addEvents.html when visiting /addEvents (without .html extension)
app.get('/addEvents', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'addEvents.html'));  // Path to the addEvents.html in the 'public' folder
});

// Serve events.html when visiting /events (without .html extension)
app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'events.html'));  // Path to the events.html in the 'public' folder
});

// Serve login.html when visiting /login (without .html extension)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));  // Path to the login.html in the 'public' folder
});

// Serve register.html when visiting /register (without .html extension)
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));  // Path to the register.html in the 'public' folder
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);  // Exit the process in case of failure
  });

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Route for User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send('This email is already registered.');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save new user
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  res.status(201).send('User registered successfully!');
});

// Route for User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send('User not found');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Incorrect password');
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

/// Define Event Schema and Model
const eventSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  endDate: Date,
  location: String,
  description: String,
  organizer: String,
  rating: { type: Number, min: 1, max: 5, default: null } // Default to null (Not Rated)
});

const Event = mongoose.model('Event', eventSchema);


// Route to Add Event
app.post('/addEvent', async (req, res) => {
  const { title, startDate, endDate, location, description, organizer } = req.body;

  const newEvent = new Event({
    title,
    startDate,
    endDate,
    location,
    description,
    organizer,
    // No rating field required here
  });

  try {
    await newEvent.save();
    res.status(201).send('Event added successfully!');
  } catch (err) {
    res.status(400).send('Error adding event: ' + err);
  }
});
// Route to Update Event Rating
app.post('/rateEvent', async (req, res) => {
  const { eventId, rating } = req.body;

  console.log('Received eventId:', eventId, 'rating:', rating); // Debugging

  // Ensure rating is valid
  if (rating !== null && (rating < 1 || rating > 5)) {
    return res.status(400).send('Rating must be between 1 and 5');
  }

  try {
    // Find the event by its ID and update the rating
    const updatedEvent = await Event.findByIdAndUpdate(eventId, { rating }, { new: true });

    if (!updatedEvent) {
      return res.status(404).send('Event not found');
    }

    console.log('Event updated successfully:', updatedEvent); // Debugging
    res.status(200).send('Event rated successfully!');
  } catch (err) {
    console.error('Error updating event rating:', err); // Log the error
    res.status(400).send('Error updating event rating: ' + err);
  }
});


// Route to Get All Events - This will be used by the frontend
app.get('/api/events', async (req, res) => {
  try {
    // Fetch all events from the database
    const events = await Event.find();
    res.json(events);  // Return the events aslocalhost:3000/events.html JSON data
  } catch (err) {
    res.status(500).send('Error fetching events: ' + err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
