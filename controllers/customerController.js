const Customer = require('../models/Customer');


// ==========================================
// חישוב מספר האנרגיה לפי יום הלידה
// ==========================================

const calculateEnergyNumber = (day) => {

    while (day >= 10) {

        let sum = 0;

        while (day > 0) {

            sum += day % 10;

            day = Math.floor(day / 10);
        }

        day = sum;
    }

    return day;
};


// ==========================================
// קביעת הקבוצה לפי מספר האנרגיה
// ==========================================

const getGroupByNumber = (number) => {

    if (number === 1 || number === 8) {

        return 'מובילה';
    }

    if (number === 2 || number === 6) {

        return 'מקבלת';
    }

    if (number === 3 || number === 5) {

        return 'מקרינה';
    }

    if (
        number === 4 ||
        number === 7 ||
        number === 9
    ) {

        return 'מסתירה';
    }

    return null;
};


// ==========================================
// קביעת עמוד הנחיתה
// ==========================================

const getLandingPageByNumber = (number) => {

    if (number === 1 || number === 8) {

        return 1;
    }

    if (number === 2 || number === 6) {

        return 2;
    }

    if (number === 3 || number === 5) {

        return 3;
    }

    if (
        number === 4 ||
        number === 7 ||
        number === 9
    ) {

        return 4;
    }

    return null;
};


// ==========================================
// הרשמת לקוח
// ==========================================

const registerCustomer = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            birthDate
        } = req.body;


        // ==========================================
        // בדיקת שדות
        // ==========================================

        if (
            !fullName ||
            !email ||
            !phone ||
            !birthDate
        ) {

            return res.status(400).json({

                message: 'יש למלא את כל השדות'

            });
        }


        // ==========================================
        // בדיקה האם האימייל כבר קיים
        // ==========================================

        const existingCustomer =
            await Customer.findOne({
                email: email
            });


        if (existingCustomer) {

            return res.status(409).json({

                message:
                    'כתובת האימייל כבר רשומה במערכת'

            });
        }


        // ==========================================
        // יצירת Date
        // ==========================================

        const date = new Date(birthDate);


        if (isNaN(date.getTime())) {

            return res.status(400).json({

                message: 'תאריך הלידה אינו תקין'

            });
        }


        // ==========================================
        // הוצאת יום הלידה
        // ==========================================

        const birthDay = date.getUTCDate();


        // ==========================================
        // חישוב מספר האנרגיה
        // ==========================================

        const energyNumber =
            calculateEnergyNumber(birthDay);


        // ==========================================
        // קביעת הקבוצה
        // ==========================================

        const group =
            getGroupByNumber(energyNumber);


        // ==========================================
        // קביעת עמוד הנחיתה
        // ==========================================

        const landingPage =
            getLandingPageByNumber(energyNumber);


        // ==========================================
        // יצירת לקוח
        // ==========================================

        const customer = new Customer({

            fullName,

            email,

            phone,

            birthDate: date,

            birthDay,

            energyNumber,

            group,

            landingPage

        });


        // ==========================================
        // שמירה ב-MongoDB
        // ==========================================

        await customer.save();


        // ==========================================
        // תשובה ל-Frontend
        // ==========================================

        return res.status(201).json({

            message: 'ההרשמה בוצעה בהצלחה',

            customer: {

                id: customer._id,

                fullName: customer.fullName,

                email: customer.email,

                phone: customer.phone,

                birthDate: customer.birthDate,

                birthDay: customer.birthDay,

                energyNumber: customer.energyNumber,

                group: customer.group,

                landingPage: customer.landingPage

            }

        });

    } catch (error) {

        console.error(
            'Register customer error:',
            error
        );

        return res.status(500).json({

            message: 'אירעה שגיאה בשרת'

        });
    }
};
// ==========================================
// הסרת לקוחה מרשימת הדיוור
// ==========================================

const removeCustomerFromMailingList = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                message: 'יש להזין כתובת אימייל'
            });
        }

        const deletedCustomer =
            await Customer.findOneAndDelete({ email });

        if (!deletedCustomer) {

            return res.status(404).json({
                message: 'כתובת האימייל לא נמצאה במערכת'
            });
        }

        return res.status(200).json({
            message: 'הוסרת בהצלחה מרשימת הדיוור'
        });

    } catch (error) {

        console.error(
            'Remove customer error:',
            error
        );

        return res.status(500).json({
            message: 'אירעה שגיאה בשרת'
        });
    }
};

// ==========================================
// Export
// ==========================================

module.exports = {

    registerCustomer,
    removeCustomerFromMailingList

};

