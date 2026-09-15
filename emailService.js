const nodemailer = require('nodemailer');


// ==========================================
// יצירת Transporter
// ==========================================

const transporter = nodemailer.createTransport({

    service: 'gmail',

    pool: true,

    maxConnections: 1,

    maxMessages: 500,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }

});


// ==========================================
// המרת טקסט רגיל ל-HTML בטוח
// ==========================================

const textToHtml = (text = '') => {

    return String(text)

        // ==========================================
        // מניעת הכנסת HTML מתוך הטקסט
        // ==========================================

        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

        // ==========================================
        // המרת ירידות שורה ל-HTML
        // ==========================================

        .replace(/\r\n|\r|\n/g, '<br>');

};


// ==========================================
// שליחת אימייל
// ==========================================

const sendEmail = async ({

    to,
    from,
    subject,
    body,

    // ==========================================
    // תמונה אופציונלית
    // ==========================================

    image

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
        // המרת תוכן ההודעה ל-HTML
        // ==========================================

        const formattedBody =
            textToHtml(body);


        // ==========================================
        // HTML של התמונה
        // ==========================================

        let imageHtml = '';


        if (
            image &&
            image.buffer
        ) {

            imageHtml = `

                <div style="
                    text-align: center;
                    margin: 25px 0;
                ">

                    <img
                        src="cid:email-image"
                        alt=""
                        style="
                            display: block;
                            max-width: 100%;
                            width: auto;
                            height: auto;
                            margin: 0 auto;
                            border: 0;
                        "
                    >

                </div>

            `;

        }


        // ==========================================
        // גוף המייל
        // ==========================================

        const emailBody = `

            <div
                dir="rtl"
                style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                "
            >

                ${formattedBody}

                ${imageHtml}

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
        // הוספת תמונה למייל
        // ==========================================

        if (
            image &&
            image.buffer
        ) {

            mailOptions.attachments = [

                {

                    filename:
                        image.originalname ||
                        'email-image',

                    content:
                        image.buffer,

                    contentType:
                        image.mimetype,

                    cid:
                        'email-image'

                }

            ];

        }


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