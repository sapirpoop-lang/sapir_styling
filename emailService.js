const nodemailer = require('nodemailer');


// ==========================================
// יצירת Transporter
// ==========================================

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD

    }

});


// ==========================================
// שליחת אימייל
// ==========================================

const sendEmail = async ({

    to,
    from,
    subject,
    body

}) => {

    try {

        // ==========================================
        // כתובת האתר
        // ==========================================

        const baseUrl =
            process.env.BASE_URL ||
            'http://localhost:3000';


        // ==========================================
        // קישור להסרה מרשימת הדיוור
        // ==========================================

        const unsubscribeUrl =
            `${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}`;


        // ==========================================
        // גוף המייל
        // ==========================================

        const emailBody = `

            <div dir="rtl"
                 style="
                    font-family: Arial, sans-serif;
                 ">

                ${body}

                <br>
                <br>

                <hr>

                <div style="
                    text-align: center;
                    font-size: 13px;
                    color: #777;
                    padding: 15px;
                ">

                    <p>
                        אינך מעוניינת לקבל מאיתנו הודעות נוספות?
                    </p>

                    <p>

                        <a
                            href="${unsubscribeUrl}"
                            style="
                                color: #2563eb;
                                text-decoration: underline;
                            "
                        >

                            להסרה מרשימת הדיוור לחצי כאן

                        </a>

                    </p>

                </div>

            </div>

        `;


        // ==========================================
        // הגדרות המייל
        // ==========================================

        const mailOptions = {

            from:
                from ||
                process.env.EMAIL_USER,

            to: to,

            subject: subject,

            html: emailBody

        };


        // ==========================================
        // שליחה
        // ==========================================

        const result =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            'Email sent:',
            result.messageId
        );


        return result;

    } catch (error) {

        console.error(
            'Email sending error:',
            error
        );

        throw error;

    }

};


// ==========================================
// Export
// ==========================================

module.exports = {

    sendEmail

};