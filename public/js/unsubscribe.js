const form = document.getElementById('unsubscribeForm');
const emailInput = document.getElementById('email');
const message = document.getElementById('message');


// ==========================================
// הסרה מרשימת הדיוור
// ==========================================

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {

        message.textContent = 'יש להזין כתובת אימייל';
        message.style.color = '#dc3545';

        return;
    }


    try {

        const response = await fetch('/customers/remove', {

            method: 'DELETE',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: email
            })

        });


        const data = await response.json();


        // ==========================================
        // הצלחה
        // ==========================================

        if (response.ok) {

            message.textContent = data.message;
            message.style.color = '#198754';

            form.reset();

            return;
        }


        // ==========================================
        // שגיאה
        // ==========================================

        message.textContent = data.message;
        message.style.color = '#dc3545';


    } catch (error) {

        console.error('Unsubscribe error:', error);

        message.textContent =
            'אירעה שגיאה בתקשורת עם השרת';

        message.style.color = '#dc3545';
    }

});

