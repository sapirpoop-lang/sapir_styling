const registerForm = document.getElementById('registerForm');

const message = document.getElementById('message');


// ==========================================
// שליחת טופס הרשמה
// ==========================================

registerForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    // ==========================================
    // קבלת הנתונים מהטופס
    // ==========================================

    const fullName =
        document.getElementById('fullName').value;

    const phone =
        document.getElementById('phone').value;

    const birthDate =
        document.getElementById('birthDate').value;

    const email =
        document.getElementById('email').value;

    const privacy =
        document.getElementById('privacy').checked;


    // ==========================================
    // בדיקת פרטיות
    // ==========================================

    if (!privacy) {

        message.innerHTML =
            'יש לאשר את מדיניות הפרטיות והתקנון';

        message.className =
            'form-message mb-3 text-danger';

        return;
    }


    // ==========================================
    // יצירת אובייקט לקוח
    // ==========================================

    const customerData = {

        fullName,

        email,

        phone,

        birthDate

    };


    try {

        // ==========================================
        // שליחה לשרת
        // ==========================================

        const response = await fetch(
            '/customers/register',
            {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(customerData)

            }
        );


        // ==========================================
        // קבלת תשובת השרת
        // ==========================================

        const data = await response.json();


        // ==========================================
        // בדיקת הצלחה
        // ==========================================

        if (!response.ok) {

            message.innerHTML =
                data.message;

            message.className =
                'form-message mb-3 text-danger';

            return;
        }


        // ==========================================
        // הרשמה הצליחה
        // ==========================================

        message.innerHTML =
            `${data.message}<br>
             מעבירים אותך למפה האישית שלך...`;

        message.className =
            'form-message mb-3 text-success';


        // ==========================================
        // קבלת אובייקט הלקוח
        // ==========================================

        const customer = data.customer;


        // ==========================================
        // בדיקה שקיים עמוד נחיתה
        // ==========================================

        if (customer && customer.landingPage) {

            const landingPage =
                customer.landingPage;


            // ==========================================
            // מעבר לעמוד הנחיתה
            // ==========================================

            setTimeout(() => {

                window.location.href =
                    `landing${landingPage}.html`;

            }, 3000);

        }

    }

    catch (error) {

        console.error(
            'Registration error:',
            error
        );


        message.innerHTML =
            'אירעה שגיאה בתקשורת עם השרת. נסו שוב.';

        message.className =
            'form-message mb-3 text-danger';

    }

});