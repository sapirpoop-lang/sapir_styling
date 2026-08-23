const mongoose = require('mongoose');


// ==========================================
// Customer Schema
// ==========================================

const customerSchema = new mongoose.Schema({

    // שם מלא
    fullName: {
        type: String,
        required: true,
        trim: true
    },


    // כתובת אימייל
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },


    // מספר טלפון
    phone: {
        type: String,
        required: true,
        trim: true
    },


    // תאריך לידה מלא
    birthDate: {
        type: Date,
        required: true
    },


    // יום הלידה בלבד
    birthDay: {
        type: Number,
        required: true,
        min: 1,
        max: 31
    },


    // מספר האנרגיה 1-9
    energyNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 9
    },


    // הקבוצה שאליה הלקוח שייך
    group: {
        type: String,
        required: true,

        enum: [
            'מובילה',
            'מקבלת',
            'מקרינה',
            'מסתירה'
        ]
    },


    // מספר עמוד הנחיתה
    landingPage: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },


    // תאריך יצירת הלקוח
    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    'Customer',
    customerSchema
);