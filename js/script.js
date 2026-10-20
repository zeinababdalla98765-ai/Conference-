/* ============================================
   منصة إدارة المؤتمرات - JavaScript
   ============================================ */

// ============================================
// 1. إعدادات عامة
// ============================================

const STORAGE_KEY = 'conference_user';
const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

// الصفحات التي تحتاج تسجيل دخول
const PROTECTED_PAGES = [
    'conferences.html',
    'conference-details.html',
    'contact.html'
];


// ============================================
// 2. أدوات مساعدة (Helpers)
// ============================================

// حفظ بيانات المستخدم
function setUser(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

// جلب بيانات المستخدم
function getUser() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

// حذف بيانات المستخدم (خروج)
function removeUser() {
    localStorage.removeItem(STORAGE_KEY);
}

// هل المستخدم مسجل دخول؟
function isLoggedIn() {
    return getUser() !== null;
}


// ============================================
// 3. حماية الصفحات (Page Protection)
// ============================================

function protectPage() {
    if (PROTECTED_PAGES.includes(CURRENT_PAGE) && !isLoggedIn()) {
        // إذا لم يكن مسجلاً دخول → أرجعه لصفحة الدخول
        window.location.href = 'index.html';
    }
}

// إذا كان المستخدم مسجل دخول وحاول فتح صفحة تسجيل الدخول → أرجعه للمؤتمرات
function redirectIfLoggedIn() {
    if (CURRENT_PAGE === 'index.html' && isLoggedIn()) {
        window.location.href = 'conferences.html';
    }
}


// ============================================
// 4. نموذج تسجيل الدخول (index.html)
// ============================================

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // --- التحقق من الحقول ---
        if (!email || !password) {
            showMessage('الرجاء إدخال البريد وكلمة المرور', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('البريد الإلكتروني غير صحيح', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        // --- محاكاة تسجيل الدخول (مؤقتاً حتى نصل إلى PHP) ---
        // لاحقاً: سيتم استبدال هذا بطلب إلى login.php

        // حسابات تجريبية
        const demoUsers = [
            { email: 'admin@conference.com', password: 'admin123', name: 'المدير' },
            { email: 'user@conference.com', password: 'user123', name: 'مستخدم' },
            { email: 'test@test.com', password: 'test123', name: 'تجريبي' }
        ];

        const foundUser = demoUsers.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            // نجح تسجيل الدخول
            setUser({
                email: foundUser.email,
                name: foundUser.name,
                loginTime: new Date().toISOString()
            });

            showMessage('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');

            setTimeout(() => {
                window.location.href = 'conferences.html';
            }, 800);

        } else {
            showMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    });
}


// ============================================
// 5. زر تسجيل الخروج (في كل الصفحات المحمية)
// ============================================

function initLogout() {
    const logoutBtn = document.querySelector('.btn-logout');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (confirm('هل تريد تسجيل الخروج؟')) {
            removeUser();
            window.location.href = 'index.html';
        }
    });
}


// ============================================
// 6. نموذج التواصل (contact.html)
// ============================================

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        // التحقق
        if (!name || name.length < 3) {
            showMessage('الاسم يجب أن يكون 3 أحرف على الأقل', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('البريد الإلكتروني غير صحيح', 'error');
            return;
        }

        if (subject.length < 3) {
            showMessage('الموضوع قصير جداً', 'error');
            return;
        }

        if (message.length < 10) {
            showMessage('الرسالة يجب أن تكون 10 أحرف على الأقل', 'error');
            return;
        }

        // نجاح (لاحقاً: يُرسل إلى contact.php)
        showMessage(`شكراً ${name}! تم استلام رسالتك بنجاح.`, 'success');
        contactForm.reset();
    });
}


// ============================================
// 7. البحث في المؤتمرات (conferences.html)
// ============================================

function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');
    if (!searchInput || !searchBtn) return;

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.conference-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const badge = card.querySelector('.badge').textContent.toLowerCase();

            if (title.includes(query) || desc.includes(query) || badge.includes(query)) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // رسالة إذا لم يوجد أي نتيجة
        let noResultMsg = document.getElementById('no-results');
        if (visibleCount === 0) {
            if (!noResultMsg) {
                noResultMsg = document.createElement('p');
                noResultMsg.id = 'no-results';
                noResultMsg.style.cssText = 'text-align:center;color:#64748b;font-size:1.1rem;padding:2rem;grid-column:1/-1;';
                noResultMsg.textContent = 'لا توجد نتائج مطابقة لبحثك 🔍';
                document.querySelector('.conferences-grid').appendChild(noResultMsg);
            }
        } else if (noResultMsg) {
            noResultMsg.remove();
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') performSearch();
        if (searchInput.value === '') performSearch();
    });
}


// ============================================
// 8. زر "سجّل الآن" في صفحة التفاصيل
// ============================================

function initRegisterButton() {
    const registerBtn = document.querySelector('.sidebar-box .btn-primary');
    if (!registerBtn) return;

    registerBtn.addEventListener('click', function () {
        if (!isLoggedIn()) {
            showMessage('يجب تسجيل الدخول أولاً', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            return;
        }

        const user = getUser();
        showMessage(`مرحباً ${user.name}! تم تسجيلك في المؤتمر بنجاح ✅`, 'success');
        registerBtn.textContent = '✓ تم التسجيل';
        registerBtn.disabled = true;
        registerBtn.style.background = '#10b981';
        registerBtn.style.cursor = 'default';
    });
}


// ============================================
// 9. إظهار اسم المستخدم في الصفحات المحمية
// ============================================

function showUserName() {
    if (!isLoggedIn()) return;
    const user = getUser();
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // منع التكرار
    if (document.querySelector('.user-greeting')) return;

    const greeting = document.createElement('span');
    greeting.className = 'user-greeting';
    greeting.innerHTML = `👋 أهلاً، ${user.name}`;
    greeting.style.cssText = 'color:#2563eb;font-weight:600;padding:0.5rem 1rem;background:#eff6ff;border-radius:8px;font-size:0.9rem;';

    navbar.querySelector('.logo').insertAdjacentElement('afterend', greeting);
}


// ============================================
// 10. دالة التحقق من البريد الإلكتروني
// ============================================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ============================================
// 11. دالة عرض الرسائل (Alert مخصص)
// ============================================

function showMessage(text, type = 'info') {
    // حذف أي رسالة سابقة
    const oldMsg = document.getElementById('js-message');
    if (oldMsg) oldMsg.remove();

    const colors = {
        success: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
        error: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
        info: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
    };

    const c = colors[type] || colors.info;

    const msg = document.createElement('div');
    msg.id = 'js-message';
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${c.bg};
        color: ${c.color};
        border-right: 5px solid ${c.border};
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        font-weight: 600;
        font-family: inherit;
        z-index: 9999;
        transition: transform 0.4s ease;
        max-width: 90%;
        text-align: center;
    `;
    document.body.appendChild(msg);

    // حركة دخول
    setTimeout(() => {
        msg.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    // إزالة تلقائية
    setTimeout(() => {
        msg.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => msg.remove(), 400);
    }, 3000);
}


// ============================================
// 12. زر "نسيت كلمة المرور"
// ============================================

function initForgotPassword() {
    const forgotLink = document.querySelector('.form-options a');
    if (!forgotLink) return;

    forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        showMessage('يرجى التواصل مع الدعم الفني لاستعادة كلمة المرور', 'info');
    });
}


// ============================================
// 13. التشغيل التلقائي عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    protectPage();
    redirectIfLoggedIn();
    initLoginForm();
    initLogout();
    initContactForm();
    initSearch();
    initRegisterButton();
    initForgotPassword();
    showUserName();
});
