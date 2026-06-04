// ════════════════════════════════════════════════════════════════════════════
// דוגמה קוד לשילוב בקשות אישור גישה
// TimeBar Access Request System Integration
// ════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────────
// 1. טופס צור קשר עם דרישה לבחירת סיבה
// ──────────────────────────────────────────────────────────────────────────

<form id="contactForm">
  <div class="form-group">
    <label for="contactEmail">דוא״ל *</label>
    <input 
      type="email" 
      id="contactEmail" 
      name="email" 
      required
      placeholder="your@email.com"
    >
  </div>

  <div class="form-group">
    <label for="contactName">שם מלא *</label>
    <input 
      type="text" 
      id="contactName" 
      name="name" 
      required
      placeholder="דוד כהן"
    >
  </div>

  <div class="form-group">
    <label for="contactReason">בחר נושא בקשה *</label>
    <select id="contactReason" name="reason" required onchange="updateReasonDescription()">
      <option value="">-- בחר נושא --</option>
      <option value="access_after_payment">בקשת אישור גישה לאחר תשלום</option>
      <option value="technical_issue">בעיה טכנית</option>
      <option value="billing">שאלה על תשלום</option>
      <option value="feature_request">בקשת תכונה חדשה</option>
      <option value="other">אחר</option>
    </select>
  </div>

  <!-- שדה נוסף שיופיע רק עבור בקשות אישור גישה -->
  <div id="accessRequestFields" style="display:none;">
    <hr>
    <h3>📋 פרטי בקשת אישור גישה</h3>
    
    <div class="form-group">
      <label for="accessPaymentDate">תאריך התשלום *</label>
      <input 
        type="date" 
        id="accessPaymentDate" 
        name="paymentDate"
      >
    </div>

    <div class="form-group">
      <label for="accessPlan">מסלול המנוי שנרכש *</label>
      <select id="accessPlan" name="plan">
        <option value="">-- בחר מסלול --</option>
        <option value="עצמאי">עצמאי - ₪199/חודש</option>
        <option value="שותפות">שותפות - ₪349/חודש</option>
        <option value="משרד">משרד - ₪599/חודש</option>
      </select>
    </div>

    <div class="form-group">
      <label for="accessInvoice">מספר חשבונית (אם יש) *</label>
      <input 
        type="text" 
        id="accessInvoice" 
        name="invoiceNumber"
        placeholder="חשבונית#123456"
      >
    </div>

    <div class="form-group">
      <label for="accessPaymentMethod">שיטת התשלום</label>
      <select id="accessPaymentMethod" name="paymentMethod">
        <option value="">-- בחר --</option>
        <option value="card">כרטיס אשראי</option>
        <option value="bank">העברה בנקאית</option>
        <option value="paypal">PayPal</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="contactMessage">הודעה *</label>
    <textarea 
      id="contactMessage" 
      name="message" 
      rows="5"
      required
      placeholder="תאר את הבעיה או הבקשה שלך..."
    ></textarea>
  </div>

  <div class="form-group">
    <label>
      <input type="checkbox" id="agreeTerms" required>
      אני מסכים/ה להשתמש בנתוני לצורכי סיוע ותמיכה
    </label>
  </div>

  <button type="submit" class="btn-submit">שלח בקשה</button>
  <div id="formMessage" style="margin-top:10px;"></div>
</form>

<!-- ──────────────────────────────────────────────────────────────────────────
     2. JavaScript להטיפול בטופס
     ────────────────────────────────────────────────────────────────────────── -->

<script>
// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (אם עדיין לא אתחלת)
if (!window.firebase) {
  firebase.initializeApp(firebaseConfig);
}

// ────────────────────────────────────────────────────────────────────────────
// שליטה בתצוגת שדות אישור גישה
// ────────────────────────────────────────────────────────────────────────────

function updateReasonDescription() {
  var reason = document.getElementById('contactReason').value;
  var accessFields = document.getElementById('accessRequestFields');
  
  if (reason === 'access_after_payment') {
    accessFields.style.display = 'block';
    // עשה את השדות חובה
    document.getElementById('accessPaymentDate').required = true;
    document.getElementById('accessPlan').required = true;
    document.getElementById('accessInvoice').required = true;
  } else {
    accessFields.style.display = 'none';
    // הסר חובה
    document.getElementById('accessPaymentDate').required = false;
    document.getElementById('accessPlan').required = false;
    document.getElementById('accessInvoice').required = false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// שליחת הטופס
// ────────────────────────────────────────────────────────────────────────────

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  var email = document.getElementById('contactEmail').value;
  var name = document.getElementById('contactName').value;
  var reason = document.getElementById('contactReason').value;
  var message = document.getElementById('contactMessage').value;
  
  // Validation
  if (!email || !name || !reason || !message) {
    showMessage('❌ אנא מלא את כל השדות החובה', 'error');
    return;
  }
  
  try {
    showMessage('🔄 שולח בקשה...', 'loading');
    
    // עבור בקשות אישור גישה
    if (reason === 'access_after_payment') {
      await submitAccessApprovalRequest();
    } else {
      // עבור בקשות רגילות
      await submitContactRequest();
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    showMessage('❌ שגיאה בשליחת הבקשה: ' + error.message, 'error');
  }
});

// ────────────────────────────────────────────────────────────────────────────
// שלח בקשת אישור גישה
// ────────────────────────────────────────────────────────────────────────────

async function submitAccessApprovalRequest() {
  // איסוף הנתונים
  var formData = {
    email: document.getElementById('contactEmail').value.toLowerCase(),
    firstName: document.getElementById('contactName').value.split(' ')[0],
    lastName: document.getElementById('contactName').value.split(' ').slice(1).join(' '),
    plan: document.getElementById('accessPlan').value,
    paymentDate: document.getElementById('accessPaymentDate').value,
    invoiceNumber: document.getElementById('accessInvoice').value,
    paymentMethod: document.getElementById('accessPaymentMethod').value,
    paymentStatus: 'pending', // יבדקו מנהלים
    message: document.getElementById('contactMessage').value,
    requestDate: new Date().toISOString(),
    status: 'pending', // ממתין לאישור
    submittedFrom: 'web_form'
  };
  
  // יצירת key ייחודי
  var requestKey = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // שמירה ל-Firebase
  var db = firebase.database();
  
  try {
    // שמור בקשה
    await db.ref('access_requests/' + requestKey).set(formData);
    
    // שמור גם בטבלה של יצירות קשר רגילות לארכיון
    var contactData = {
      email: formData.email,
      name: formData.firstName + ' ' + formData.lastName,
      reason: 'access_after_payment',
      message: formData.message,
      plan: formData.plan,
      invoiceNumber: formData.invoiceNumber,
      submissionDate: formData.requestDate,
      linkedAccessRequest: requestKey
    };
    
    await db.ref('contacts/' + requestKey).set(contactData);
    
    // נקה טופס
    document.getElementById('contactForm').reset();
    
    // הצג הודעת הצלחה
    showMessage(
      '✅ בקשתך התקבלה!\n\n' +
      'מנהלי הפלטפורמה יבדקו את פרטיך בקרוב.\n' +
      'בקרוב תקבל דוא״ל עם עדכון.',
      'success'
    );
    
    // שלח דוא״ל עם התראה למנהל
    await notifyAdminNewAccessRequest(formData, requestKey);
    
  } catch (error) {
    console.error('Access request submission error:', error);
    throw new Error('בעיה בשמירת הבקשה: ' + error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// שלח בקשת יצירת קשר רגילה
// ────────────────────────────────────────────────────────────────────────────

async function submitContactRequest() {
  var formData = {
    email: document.getElementById('contactEmail').value.toLowerCase(),
    name: document.getElementById('contactName').value,
    reason: document.getElementById('contactReason').value,
    message: document.getElementById('contactMessage').value,
    submissionDate: new Date().toISOString()
  };
  
  var contactKey = 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  var db = firebase.database();
  
  try {
    await db.ref('contacts/' + contactKey).set(formData);
    
    document.getElementById('contactForm').reset();
    showMessage(
      '✅ בקשתך נשלחה בהצלחה!\n\n' +
      'צוות התמיכה שלנו יחזור אליך בקרוב.',
      'success'
    );
    
  } catch (error) {
    console.error('Contact submission error:', error);
    throw new Error('בעיה בשמירת הבקשה: ' + error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// התראה למנהל על בקשה חדשה
// ────────────────────────────────────────────────────────────────────────────

async function notifyAdminNewAccessRequest(formData, requestKey) {
  // זה יכול להיות גם שליחת דוא״ל דרך Firebase Cloud Functions
  
  // דוגמה: שיחה ל-API שלך
  try {
    await fetch('/api/notify-admin-access-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestKey: requestKey,
        email: formData.email,
        name: formData.firstName + ' ' + formData.lastName,
        plan: formData.plan,
        invoiceNumber: formData.invoiceNumber,
        message: formData.message
      })
    });
  } catch (error) {
    // אם התראה נכשלה, זה לא קריטי
    console.warn('Admin notification failed (non-critical):', error);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// עדכון הודעות משתמש
// ────────────────────────────────────────────────────────────────────────────

function showMessage(msg, type) {
  var msgDiv = document.getElementById('formMessage');
  msgDiv.innerHTML = msg.replace(/\n/g, '<br>');
  msgDiv.className = 'form-message form-message-' + type;
  
  if (type === 'success') {
    setTimeout(function() {
      msgDiv.innerHTML = '';
      msgDiv.className = '';
    }, 5000);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// CSS לטופס
// ────────────────────────────────────────────────────────────────────────────

var styles = `
  #contactForm {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Heebo', sans-serif;
    direction: rtl;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #0a1628;
    font-size: 14px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Heebo', sans-serif;
    direction: rtl;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #c9922a;
    box-shadow: 0 0 0 3px rgba(201, 146, 42, 0.1);
  }

  .btn-submit {
    width: 100%;
    padding: 12px;
    background: #c9922a;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;
    font-family: 'Heebo', sans-serif;
  }

  .btn-submit:hover {
    background: #e8b84b;
  }

  .form-message {
    padding: 12px;
    border-radius: 8px;
    text-align: right;
    font-size: 14px;
    line-height: 1.5;
  }

  .form-message-success {
    background: #f0fbf5;
    color: #1a7a4a;
    border: 1px solid #dcf4e8;
  }

  .form-message-error {
    background: #fff5f5;
    color: #b91c1c;
    border: 1px solid #fde8e8;
  }

  .form-message-loading {
    background: #eff6ff;
    color: #1a4fa0;
    border: 1px solid #dbeafe;
  }

  #accessRequestFields {
    padding: 16px;
    background: #fdf6e8;
    border-right: 4px solid #c9922a;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  #accessRequestFields h3 {
    margin-bottom: 12px;
    color: #0a1628;
    font-size: 16px;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 16px 0;
  }
`;

// הוסף את ה-CSS לדף
var styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

</script>

<!-- ──────────────────────────────────────────────────────────────────────────
     3. Cloud Function לשליחת דוא״ל לציבור
     (אם אתה משתמש ב-Firebase Cloud Functions)
     ────────────────────────────────────────────────────────────────────────── -->

/*
// functions/notifyAdminAccessRequest.js

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// הגדרת אימייל (זה דוגמה בלבד)
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@timebar.co.il',
    pass: 'your-email-password'
  }
});

// פונקציה שנקראת כשמשתמש שולח בקשה חדשה
exports.notifyAdminAccessRequest = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const data = req.body;
    
    const mailOptions = {
      from: 'admin@timebar.co.il',
      to: 'admin@timebar.co.il', // דוא״ל המנהל
      subject: '🔔 בקשה חדשה לאישור גישה!',
      html: `
        <h2>בקשה חדשה לאישור גישה</h2>
        <p><strong>שם:</strong> ${data.name}</p>
        <p><strong>דוא״ל:</strong> ${data.email}</p>
        <p><strong>מסלול:</strong> ${data.plan}</p>
        <p><strong>מספר חשבונית:</strong> ${data.invoiceNumber}</p>
        <p><strong>הודעה:</strong></p>
        <p>${data.message}</p>
        <p><a href="https://admin.timebar.co.il/#access-requests/${data.requestKey}">
          👉 אשר או דחה בקשה בממשק הניהול
        </a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      success: true,
      message: 'Admin notified successfully'
    });
    
  } catch (error) {
    console.error('Error notifying admin:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
*/

</script>

<!-- ──────────────────────────────────────────────────────────────────────────
     4. Firebase Realtime Database Rules
     ────────────────────────────────────────────────────────────────────────── -->

/*
{
  "rules": {
    // חוקים לבקשות אישור גישה
    "access_requests": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": "root.child('admins').child(auth.uid).exists()",
      "$requestId": {
        ".validate": "newData.hasChildren(['email','firstName','lastName','plan','message','requestDate','status'])"
      }
    },
    
    // חוקים ליצירות קשר
    "contacts": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": "true", // כל אחד יכול לשלוח בקשה
      "$contactId": {
        ".validate": "newData.hasChildren(['email','name','reason','message','submissionDate'])"
      }
    },
    
    // חוקים למנויים
    "subscribers": {
      ".read": "root.child('admins').child(auth.uid).exists() || (auth.uid !== null && root.child('subscribers').child(auth.uid).exists())",
      ".write": "root.child('admins').child(auth.uid).exists()",
      "$subscriberId": {
        "accessApproved": {
          ".write": "root.child('admins').child(auth.uid).exists()"
        }
      }
    }
  }
}
*/
