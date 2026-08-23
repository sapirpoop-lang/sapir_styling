const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');

const {
    sendEmail
} = require('../emailService');


// ==========================================
// התחברות מנהל
// ==========================================

const loginAdmin = async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // ==========================================
        // בדיקת שדות
        // ==========================================

        if (!username || !password) {

            return res.status(400).json({

                message: 'יש להזין שם משתמש וסיסמה'

            });
        }


        // ==========================================
        // חיפוש מנהל
        // ==========================================

        const admin = await Admin.findOne({
            username: username
        });


        if (!admin) {

            return res.status(401).json({

                message: 'שם משתמש או סיסמה שגויים'

            });
        }


        // ==========================================
        // בדיקת סיסמה
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.passwordHash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message: 'שם משתמש או סיסמה שגויים'

            });
        }


        // ==========================================
        // יצירת JWT
        // ==========================================

        const token = jwt.sign(

            {
                id: admin._id,
                username: admin.username
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '8h'
            }

        );


        // ==========================================
        // התחברות הצליחה
        // ==========================================

        return res.status(200).json({

            message: 'ההתחברות הצליחה',

            token: token,

            admin: {

                id: admin._id,

                username: admin.username

            }

        });

    } catch (error) {

        console.error(
            'Admin login error:',
            error
        );

        return res.status(500).json({

            message: 'אירעה שגיאה בשרת'

        });
    }
};


// ==========================================
// קבלת כל הלקוחות
// ==========================================

const getAllCustomers = async (req, res) => {

    try {

        const customers =
            await Customer.find()
                .sort({ createdAt: -1 });


        return res.status(200).json({

            count: customers.length,

            customers: customers

        });

    } catch (error) {

        console.error(
            'Get customers error:',
            error
        );

        return res.status(500).json({

            message: 'אירעה שגיאה בשרת'

        });
    }
};


// ==========================================
// שליחת מייל לכל הלקוחות
// ==========================================

// ==========================================
// שליחת מייל לכל הלקוחות / לקבוצה
// ==========================================

const sendEmailToAllCustomers = async (req, res) => {

    try {

        const {
            subject,
            body,
            group
        } = req.body;


        // ==========================================
        // בדיקת תוכן ההודעה
        // ==========================================

        if (!body || body.trim() === '') {

            return res.status(400).json({

                message: 'יש להזין תוכן למייל'

            });

        }


        // ==========================================
        // בניית שאילתה
        // ==========================================

        const query = {

            email: {
                $exists: true,
                $ne: ''
            }

        };


        // ==========================================
        // אם נבחרה קבוצה - סינון לפי קבוצה
        // ==========================================

        if (group) {

            query.group = group;

        }


        // ==========================================
        // קבלת הלקוחות
        // ==========================================

        const customers = await Customer.find(query);


        if (customers.length === 0) {

            return res.status(404).json({

                message: 'לא נמצאו לקוחות לשליחת המייל'

            });

        }


        // ==========================================
        // שליחת המיילים
        // ==========================================

        let sentCount = 0;
        let failedCount = 0;


        for (const customer of customers) {

            try {

                await sendEmail({

                    to: customer.email,

                    subject:
                        subject || 'ספיר סרוסי סטיילינג רוחני',

                    body: body

                });


                sentCount++;

            } catch (error) {

                console.error(

                    `Failed sending email to ${customer.email}:`,

                    error

                );

                failedCount++;

            }

        }


        // ==========================================
        // תשובה
        // ==========================================

        return res.status(200).json({

            message: group
                ? `הדיוור לקבוצת "${group}" הסתיים`
                : 'הדיוור לכל הלקוחות הסתיים',

            totalCustomers: customers.length,

            sent: sentCount,

            failed: failedCount

        });

    } catch (error) {

        console.error(

            'Send email to customers error:',

            error

        );


        return res.status(500).json({

            message: 'אירעה שגיאה בשליחת הדיוור'

        });

    }

};


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
// ייבוא לקוחות מקובץ Excel
// ==========================================

const importCustomersFromExcel = async (req, res) => {

    try {

        // ==========================================
        // בדיקה שהועלה קובץ
        // ==========================================

        if (!req.file) {

            return res.status(400).json({

                message:
                    'לא הועלה קובץ Excel'

            });
        }


        // ==========================================
        // בדיקת סוג הקובץ
        // ==========================================

        const allowedExtensions = [
            '.xlsx',
            '.xls'
        ];

        const fileName =
            req.file.originalname.toLowerCase();

        const isExcel =
            allowedExtensions.some(
                extension =>
                    fileName.endsWith(extension)
            );


        if (!isExcel) {

            return res.status(400).json({

                message:
                    'ניתן להעלות רק קבצי Excel מסוג XLS או XLSX'

            });
        }


        // ==========================================
        // קריאת קובץ Excel
        // ==========================================

        const workbook =
            XLSX.read(
                req.file.buffer,
                {
                    type: 'buffer'
                }
            );


        // ==========================================
        // קבלת הגיליון הראשון
        // ==========================================

        const sheetName =
            workbook.SheetNames[0];


        if (!sheetName) {

            return res.status(400).json({

                message:
                    'קובץ Excel אינו מכיל גיליון'

            });
        }


        const worksheet =
            workbook.Sheets[sheetName];


        // ==========================================
        // המרת Excel למערך
        // ==========================================

        const rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: ''
                }
            );


        if (!rows.length) {

            return res.status(400).json({

                message:
                    'קובץ Excel ריק'

            });
        }


        // ==========================================
        // מערכים לבדיקות
        // ==========================================

        const customersToProcess = [];

        const skippedCustomers = [];

        const emailsInFile = new Set();


        // ==========================================
        // מעבר על כל שורות האקסל
        // ==========================================

        for (
            let index = 0;
            index < rows.length;
            index++
        ) {

            const row = rows[index];

            // Excel מתחיל את הנתונים בשורה 2
            const excelRow =
                index + 2;


            // ==========================================
            // קבלת נתונים מהאקסל
            // ==========================================

            const fullName =
                String(
                    row.name || ''
                ).trim();


            const phone =
                String(
                    row.phone || ''
                ).trim();


            const email =
                String(
                    row.email || ''
                )
                .trim()
                .toLowerCase();


            const dob =
                row.dob;


            // ==========================================
            // בדיקת שדות חובה
            // ==========================================

            if (
                !fullName ||
                !phone ||
                !email ||
                !dob
            ) {

                skippedCustomers.push({

                    row: excelRow,

                    email:
                        email || null,

                    reason:
                        'חסרים נתונים חובה'

                });

                continue;
            }


            // ==========================================
            // בדיקת אימייל
            // ==========================================

            if (
                !email.includes('@') ||
                !email.includes('.')
            ) {

                skippedCustomers.push({

                    row: excelRow,

                    email: email,

                    reason:
                        'כתובת אימייל אינה תקינה'

                });

                continue;
            }


            // ==========================================
            // כפילות בתוך קובץ Excel
            // ==========================================

            if (
                emailsInFile.has(email)
            ) {

                skippedCustomers.push({

                    row: excelRow,

                    email: email,

                    reason:
                        'האימייל מופיע יותר מפעם אחת בקובץ'

                });

                continue;
            }


            emailsInFile.add(email);


            // ==========================================
            // יצירת תאריך לידה
            // ==========================================

            let birthDate;


            if (dob instanceof Date) {

                birthDate = dob;

            } else {

                birthDate =
                    new Date(dob);

            }


            // ==========================================
            // בדיקת תאריך
            // ==========================================

            if (
                isNaN(
                    birthDate.getTime()
                )
            ) {

                skippedCustomers.push({

                    row: excelRow,

                    email: email,

                    reason:
                        'תאריך הלידה אינו תקין'

                });

                continue;
            }


            // ==========================================
            // הוצאת יום הלידה
            // ==========================================

            const birthDay =
                birthDate.getUTCDate();


            // ==========================================
            // חישוב מספר אנרגיה
            // ==========================================

            const energyNumber =
                calculateEnergyNumber(
                    birthDay
                );


            // ==========================================
            // קביעת קבוצה
            // ==========================================

            const group =
                getGroupByNumber(
                    energyNumber
                );


            // ==========================================
            // קביעת עמוד נחיתה
            // ==========================================

            const landingPage =
                getLandingPageByNumber(
                    energyNumber
                );


            // ==========================================
            // createdAt
            // ==========================================

            let createdAt =
                new Date();


            if (row.createdAt) {

                const excelCreatedAt =
                    new Date(
                        row.createdAt
                    );


                if (
                    !isNaN(
                        excelCreatedAt.getTime()
                    )
                ) {

                    createdAt =
                        excelCreatedAt;

                }

            }


            // ==========================================
            // הכנת הלקוח
            // ==========================================

            customersToProcess.push({

                fullName:

                    fullName,

                email:

                    email,

                phone:

                    phone,

                birthDate:

                    birthDate,

                birthDay:

                    birthDay,

                energyNumber:

                    energyNumber,

                group:

                    group,

                landingPage:

                    landingPage,

                createdAt:

                    createdAt

            });

        }


        // ==========================================
        // אין לקוחות תקינים
        // ==========================================

        if (
            customersToProcess.length === 0
        ) {

            return res.status(200).json({

                message:
                    'לא נמצאו לקוחות חדשים לייבוא',

                totalRows:
                    rows.length,

                imported:
                    0,

                skipped:
                    skippedCustomers.length,

                skippedCustomers:
                    skippedCustomers

            });
        }


        // ==========================================
        // קבלת כל האימיילים מהאקסל
        // ==========================================

        const emails =
            customersToProcess.map(
                customer =>
                    customer.email
            );


        // ==========================================
        // בדיקה מול MongoDB
        // ==========================================

        const existingCustomers =
            await Customer.find(

                {
                    email: {
                        $in: emails
                    }
                },

                {
                    email: 1
                }

            ).lean();


        // ==========================================
        // יצירת Set של לקוחות קיימים
        // ==========================================

        const existingEmails =
            new Set(

                existingCustomers.map(
                    customer =>
                        customer.email
                            .toLowerCase()
                )

            );


        // ==========================================
        // הכנת לקוחות חדשים בלבד
        // ==========================================

        const customersToInsert = [];


        for (
            const customer
            of customersToProcess
        ) {

            if (
                existingEmails.has(
                    customer.email
                )
            ) {

                skippedCustomers.push({

                    row: null,

                    email:
                        customer.email,

                    reason:
                        'הלקוח כבר קיים במערכת'

                });

                continue;
            }


            customersToInsert.push(
                customer
            );

        }


        // ==========================================
        // הכנסת הלקוחות ל-MongoDB
        // ==========================================

        let insertedCustomers = [];


        if (
            customersToInsert.length > 0
        ) {

            insertedCustomers =
                await Customer.insertMany(
                    customersToInsert,
                    {
                        ordered: false
                    }
                );

        }


        // ==========================================
        // תשובה ל-Frontend
        // ==========================================

        return res.status(201).json({

            message:
                'ייבוא הלקוחות הסתיים בהצלחה',

            totalRows:
                rows.length,

            imported:
                insertedCustomers.length,

            skipped:
                skippedCustomers.length,

            skippedCustomers:
                skippedCustomers

        });


    } catch (error) {

        console.error(
            'Import customers error:',
            error
        );


        return res.status(500).json({

            message:
                'אירעה שגיאה בייבוא הלקוחות'

        });
    }
};
// ==========================================
// מחיקת לקוח
// ==========================================

const deleteCustomer = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        // ==========================================
        // בדיקת ID
        // ==========================================

        if (!id) {

            return res.status(400).json({

                message:
                    'לא נמסר מזהה לקוח'

            });

        }


        // ==========================================
        // מחיקת הלקוח
        // ==========================================

        const deletedCustomer =
            await Customer.findByIdAndDelete(id);


        // ==========================================
        // לקוח לא נמצא
        // ==========================================

        if (!deletedCustomer) {

            return res.status(404).json({

                message:
                    'הלקוח לא נמצא במערכת'

            });

        }


        // ==========================================
        // הצלחה
        // ==========================================

        return res.status(200).json({

            message:
                'הלקוח נמחק בהצלחה',

            customer: {

                id:
                    deletedCustomer._id,

                fullName:
                    deletedCustomer.fullName,

                email:
                    deletedCustomer.email

            }

        });


    } catch (error) {

        console.error(
            'Delete customer error:',
            error
        );


        return res.status(500).json({

            message:
                'אירעה שגיאה במחיקת הלקוח'

        });

    }

};
// ==========================================
// ייצוא כל הלקוחות ל-Excel
// ==========================================

const exportCustomersToExcel = async (req, res) => {

    try {

        // ==========================================
        // קבלת כל הלקוחות
        // ==========================================

        const customers = await Customer.find()
            .sort({ createdAt: -1 })
            .lean();


        // ==========================================
        // אין לקוחות
        // ==========================================

        if (customers.length === 0) {

            return res.status(404).json({

                message: 'לא נמצאו לקוחות'

            });

        }


        // ==========================================
        // הכנת הנתונים לאקסל
        // ==========================================

        const data = customers.map(customer => ({

            name: customer.fullName,

            email: customer.email,

            phone: customer.phone,

            dob: customer.birthDate,

            birthDay: customer.birthDay,

            energyNumber: customer.energyNumber,

            group: customer.group,

            landingPage: customer.landingPage,

            createdAt: customer.createdAt

        }));


        // ==========================================
        // יצירת Workbook
        // ==========================================

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            'Customers'

        );


        // ==========================================
        // יצירת Buffer
        // ==========================================

        const buffer = XLSX.write(

            workbook,

            {

                type: 'buffer',

                bookType: 'xlsx'

            }

        );


        // ==========================================
        // הורדת הקובץ
        // ==========================================

        res.setHeader(

            'Content-Type',

            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        );

        res.setHeader(

            'Content-Disposition',

            `attachment; filename=customers-${Date.now()}.xlsx`

        );

        return res.send(buffer);

    } catch (error) {

        console.error(

            'Export customers error:',

            error

        );

        return res.status(500).json({

            message: 'אירעה שגיאה בייצוא הלקוחות'

        });

    }

};

// ==========================================
// Export
// ==========================================

module.exports = {

    loginAdmin,

    getAllCustomers,

    sendEmailToAllCustomers,

    importCustomersFromExcel,
    deleteCustomer,
    exportCustomersToExcel

};

