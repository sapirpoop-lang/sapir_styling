const express = require('express');
const multer = require('multer');

const {
    loginAdmin,
    getAllCustomers,
    sendEmailToAllCustomers,
    importCustomersFromExcel,
    deleteCustomer,
    exportCustomersToExcel

} = require('../controllers/adminController');

const adminAuth = require('../adminAuth');

const router = express.Router();


// ==========================================
// Multer
// שמירת קובץ Excel בזיכרון
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
// ==========================================

router.post(
    '/send-email',
    adminAuth,
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
    '/customers/:id',
    adminAuth,
    deleteCustomer
);
router.get(
    '/customers/export',
    adminAuth,
    exportCustomersToExcel
);
// ==========================================
// Export
// ==========================================

module.exports = router;

