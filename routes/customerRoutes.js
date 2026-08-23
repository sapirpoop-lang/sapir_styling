const express = require('express');

const {
    registerCustomer,
    removeCustomerFromMailingList
} = require('../controllers/customerController');

const router = express.Router();


// ==========================================
// הרשמת לקוח
// ==========================================

router.post('/register', registerCustomer);

// הסרה מרשימת הדיוור
router.delete('/remove', removeCustomerFromMailingList);

module.exports = router;