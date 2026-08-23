const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


// ==========================================
// TEST
// ==========================================






app.use('/admin', adminRoutes);

// ==========================================
// Routes
// ==========================================

app.use('/customers', customerRoutes);


// ==========================================
// MongoDB
// ==========================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });


app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );

});
app.get('/about', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'about.html')
    );

});
app.get('/unsubscribe', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'unsubscribe.html')
    );

});
app.get('/login_manager', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'login_manager.html')
    );

});

app.get('/managemant_page', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'managemant_page.html')
    );

});


module.exports = app;