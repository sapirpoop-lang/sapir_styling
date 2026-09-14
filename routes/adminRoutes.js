const express = require('express');
const multer = require('multer');

const {
    loginAdmin,
    getAllCustomers,
    sendEmailToAllCustomers,
    importCustomersFromExcel,
    deleteCustomer,
    exportCustomersToExcel,
    deleteAllCustomers

} = require('../controllers/adminController');

const adminAuth = require('../adminAuth');

const router = express.Router();


// ==========================================
// Multer
// שמירת קבצים בזיכרון
// ==========================================

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        // מקסימום 10MB
        fileSize: 10 * 1024 * 1024

    }

});


// ==========================================
// התחברות מנהל
// ==========================================

router.post(
    '/login',
    loginAdmin
);


// ==========================================
// routes מוגנים
// ==========================================


// ==========================================
// קבלת כל הלקוחות
// ==========================================

router.get(
    '/customers',
    adminAuth,
    getAllCustomers
);


// ==========================================
// שליחת מייל לכל הלקוחות
// תמונה אופציונלית
// ==========================================

router.post(

    '/send-email',

    adminAuth,

    upload.single('image'),

    sendEmailToAllCustomers

);


// ==========================================
// ייבוא לקוחות מאקסל
// ==========================================

router.post(

    '/import-customers',

    adminAuth,

    upload.single('file'),

    importCustomersFromExcel

);

router.delete(

    '/customers',

    adminAuth,

    deleteAllCustomers

);

// ==========================================
// מחיקת לקוח
// ==========================================

router.delete(

    '/customers/:id',

    adminAuth,

    deleteCustomer

);


// ==========================================
// ייצוא לקוחות לאקסל
// ==========================================

router.get(

    '/customers/export',

    adminAuth,

    exportCustomersToExcel

);



// ==========================================
// Export
// ==========================================

module.exports = router;