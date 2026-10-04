// ==========================================
// KMUTNB Admission System (ระบบจำลองเพื่อการศึกษา)
// script.js — JavaScript กลางสำหรับทุกหน้า
// ==========================================

const APPLICANT_KEY = 'kmutnb_applicant';
const SESSION_KEY = 'kmutnb_session';

// ==========================================
// Data Helpers
// ==========================================
function getApplicant() {
    try {
        const raw = localStorage.getItem(APPLICANT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveApplicant(data) {
    localStorage.setItem(APPLICANT_KEY, JSON.stringify(data));
}

function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setSession(idCard) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, idCard: idCard }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
    const session = getSession();
    return !!(session && session.loggedIn);
}

function currentPage() {
    const path = window.location.pathname.split('/').pop().split('?')[0];
    return path || 'index.html';
}

function goTo(page) {
    window.location.href = page;
}

document.addEventListener('DOMContentLoaded', function () {
    const page = currentPage();

    // ==========================================
    // 0. Route Guard — ป้องกันการเข้าถึงหน้าขั้นตอนโดยตรง
    // ==========================================
    if (page === 'status.html') {
        if (!isLoggedIn()) {
            alert('กรุณาเข้าสู่ระบบก่อนเข้าดูหลักฐานการสมัคร');
            goTo('login.html');
            return;
        }
    }

    const stepPages = ['step2.html', 'step3.html', 'step4.html'];
    if (stepPages.indexOf(page) !== -1) {
        const applicant = getApplicant();
        if (!applicant || !applicant.idCard) {
            alert('กรุณากรอกข้อมูลในขั้นตอนที่ 1 ก่อน');
            goTo('step1.html');
            return;
        }
    }

    // ==========================================
    // 1. Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });
    }

    // ==========================================
    // 2. Active Nav Link Highlighting
    // ==========================================
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('nav-active');
        }
    });

    // ==========================================
    // 3. Password Visibility Toggle
    // ==========================================
    const eyeIcons = document.querySelectorAll('.toggle-password');
    eyeIcons.forEach(function (icon) {
        icon.addEventListener('click', function () {
            const container = this.closest('.input-icon-group, .relative') || this.parentElement;
            const input = container ? container.querySelector('input') : null;
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    // ==========================================
    // 4. Auth State UI
    // ==========================================
    function renderAuthUI() {
        const authGuest = document.getElementById('auth-guest');
        const authUser = document.getElementById('auth-user');
        if (!authGuest || !authUser) return;

        if (isLoggedIn()) {
            const applicant = getApplicant();
            authGuest.classList.add('hidden');
            authUser.classList.remove('hidden');
            authUser.classList.add('flex');
            const nameEl = authUser.querySelector('[data-field="firstName"]');
            if (nameEl && applicant) {
                nameEl.textContent = (applicant.title || '') + (applicant.firstName || 'ผู้สมัคร');
            }
        } else {
            authGuest.classList.remove('hidden');
            authUser.classList.add('hidden');
            authUser.classList.remove('flex');
        }
    }
    renderAuthUI();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            clearSession();
            goTo('index.html');
        });
    }

    // ==========================================
    // 5. terms.html — จัดการการยอมรับเงื่อนไขและเปิดปุ่ม
    // ==========================================
    const acceptTerms = document.getElementById('accept-terms');
    const acceptBtn = document.getElementById('accept-btn');

    if (acceptTerms && acceptBtn) {
        function updateAcceptButton() {
            if (acceptTerms.checked) {
                acceptBtn.disabled = false;
                acceptBtn.removeAttribute('disabled');
                acceptBtn.style.backgroundColor = 'var(--brand-orange)';
                acceptBtn.style.color = '#ffffff';
                acceptBtn.style.cursor = 'pointer';
                acceptBtn.style.opacity = '1';
                acceptBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                acceptBtn.classList.add('bg-brand-orange', 'hover-bg-brand-orange', 'text-white', 'cursor-pointer', 'shadow');
            } else {
                acceptBtn.disabled = true;
                acceptBtn.setAttribute('disabled', 'disabled');
                acceptBtn.style.backgroundColor = '#CBD5E1';
                acceptBtn.style.color = '#64748B';
                acceptBtn.style.cursor = 'not-allowed';
                acceptBtn.style.opacity = '0.7';
                acceptBtn.classList.remove('bg-brand-orange', 'hover-bg-brand-orange', 'text-white', 'cursor-pointer', 'shadow');
                acceptBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
            }
        }

        acceptTerms.addEventListener('change', updateAcceptButton);
        acceptTerms.addEventListener('click', updateAcceptButton);

        // ดึงสถานะเริ่มต้นกรณีเบราว์เซอร์จำค่า checkbox ไว้
        updateAcceptButton();

        acceptBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (acceptTerms.checked) {
                goTo('step1.html');
            } else {
                alert('กรุณาติ๊กเครื่องหมายถูกในช่อง "ข้าพเจ้าได้อ่านและเข้าใจข้อตกลง..." เพื่อเปิดใช้งานปุ่มก่อนดำเนินการต่อ');
            }
        });
    }

    // ==========================================
    // Campus & Faculty Mapping
    // ==========================================
    const CAMPUS_FACULTIES = {
        'วิทยาเขตกรุงเทพฯ': [
            'คณะวิศวกรรมศาสตร์',
            'คณะครุศาสตร์อุตสาหกรรม',
            'วิทยาลัยเทคโนโลยีอุตสาหกรรม',
            'คณะวิทยาศาสตร์ประยุกต์',
            'คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล',
            'คณะศิลปศาสตร์ประยุกต์',
            'คณะสถาปัตยกรรมและการออกแบบ',
            'คณะพัฒนาธุรกิจและอุตสาหกรรม',
            'บัณฑิตวิทยาลัยวิศวกรรมศาสตร์นานาชาติสิรินธร ไทย-เยอรมัน (TGGS)'
        ],
        'วิทยาเขตปราจีนบุรี': [
            'คณะเทคโนโลยีและการจัดการอุตสาหกรรม',
            'คณะบริหารธุรกิจและอุตสาหกรรมบริการ',
            'คณะอุตสาหกรรมเกษตรดิจิทัล',
            'วิทยาลัยนานาชาติ'
        ],
        'วิทยาเขตระยอง': [
            'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
            'คณะวิทยาศาสตร์ พลังงานและสิ่งแวดล้อม',
            'คณะบริหารธุรกิจ'
        ]
    };

    // ==========================================
    // 6. step1.html — กรอกประวัติส่วนตัว และเลือกวิทยาเขต/คณะ
    // ==========================================
    const step1Form = document.getElementById('step1-form');
    if (step1Form) {
        const campusSelect = document.getElementById('campus');
        const facultySelect = document.getElementById('faculty');

        function updateFacultyOptions(selectedCampus, selectedFaculty) {
            if (!facultySelect) return;
            facultySelect.innerHTML = '';

            const faculties = CAMPUS_FACULTIES[selectedCampus] || [];
            if (faculties.length === 0) {
                facultySelect.disabled = true;
                const defOpt = document.createElement('option');
                defOpt.value = '';
                defOpt.textContent = '-- กรุณาเลือกวิทยาเขตก่อน --';
                facultySelect.appendChild(defOpt);
                return;
            }

            facultySelect.disabled = false;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- เลือกคณะ --';
            facultySelect.appendChild(defaultOption);

            faculties.forEach(function (fac) {
                const opt = document.createElement('option');
                opt.value = fac;
                opt.textContent = fac;
                if (selectedFaculty && selectedFaculty === fac) {
                    opt.selected = true;
                }
                facultySelect.appendChild(opt);
            });
        }

        if (campusSelect) {
            campusSelect.addEventListener('change', function () {
                updateFacultyOptions(this.value);
            });
        }

        const saved = getApplicant();
        if (saved) {
            if (document.getElementById('prefix')) document.getElementById('prefix').value = saved.title || '';
            if (document.getElementById('id-card')) document.getElementById('id-card').value = saved.idCard || '';
            if (document.getElementById('first-name')) document.getElementById('first-name').value = saved.firstName || '';
            if (document.getElementById('last-name')) document.getElementById('last-name').value = saved.lastName || '';
            if (document.getElementById('dob')) document.getElementById('dob').value = saved.dob || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = saved.phone || '';
            if (document.getElementById('email')) document.getElementById('email').value = saved.email || '';
            if (document.getElementById('address')) document.getElementById('address').value = saved.address || '';
            if (campusSelect && saved.campus) {
                campusSelect.value = saved.campus;
                updateFacultyOptions(saved.campus, saved.faculty);
            }
        }

        step1Form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();
            let hasError = false;

            const idCard = document.getElementById('id-card');
            const phone = document.getElementById('phone');
            const email = document.getElementById('email');
            const campus = document.getElementById('campus');
            const faculty = document.getElementById('faculty');

            if (idCard && !/^\d{13}$/.test(idCard.value.trim())) {
                showError(idCard, 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก (ตัวเลขเท่านั้น)');
                hasError = true;
            }

            if (phone && !/^0\d{8,9}$/.test(phone.value.trim())) {
                showError(phone, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (0XXXXXXXXX)');
                hasError = true;
            }

            if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
                showError(email, 'กรุณากรอกอีเมลให้ถูกต้อง');
                hasError = true;
            }

            if (campus && !campus.value) {
                showError(campus, 'กรุณาเลือกวิทยาเขต');
                hasError = true;
            }

            if (faculty && !faculty.value) {
                showError(faculty, 'กรุณาเลือกคณะที่ต้องการสมัคร');
                hasError = true;
            }

            if (hasError) return;

            const applicantData = saved || {};
            applicantData.title = getValue('prefix');
            applicantData.idCard = getValue('id-card');
            applicantData.firstName = getValue('first-name');
            applicantData.lastName = getValue('last-name');
            applicantData.dob = getValue('dob');
            applicantData.phone = getValue('phone');
            applicantData.email = getValue('email');
            applicantData.address = getValue('address');
            applicantData.campus = getValue('campus');
            applicantData.faculty = getValue('faculty');
            if (!applicantData.appNumber) {
                applicantData.appNumber = 'APP70-' + String(Math.floor(Math.random() * 900000) + 100000);
            }
            if (!applicantData.documents) {
                applicantData.documents = {};
            }
            if (!applicantData.paymentStatus) {
                applicantData.paymentStatus = 'pending';
            }

            saveApplicant(applicantData);
            setSession(applicantData.idCard);
            goTo('step2.html');
        });
    }

    // ==========================================
    // 7. step2.html — อัปโหลดเอกสาร
    // ==========================================
    const step2Form = document.getElementById('step2-form');
    if (step2Form) {
        const idCardFile = document.getElementById('id-card-file');
        const transcriptFile = document.getElementById('transcript-file');
        const idCardName = document.getElementById('id-card-file-name');
        const transcriptName = document.getElementById('transcript-file-name');

        if (idCardFile && idCardName) {
            idCardFile.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    idCardName.textContent = '✓ ' + this.files[0].name;
                }
            });
        }

        if (transcriptFile && transcriptName) {
            transcriptFile.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    transcriptName.textContent = '✓ ' + this.files[0].name;
                }
            });
        }

        // Drag & Drop สำหรับ upload zones
        function setupDragDrop(zone, fileInput, nameDisplay) {
            if (!zone || !fileInput) return;

            zone.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('drag-over');
                var files = e.dataTransfer.files;
                if (files && files.length > 0) {
                    fileInput.files = files;
                    if (nameDisplay) {
                        nameDisplay.textContent = '✓ ' + files[0].name;
                    }
                }
            });
        }

        var uploadZones = document.querySelectorAll('.upload-zone');
        if (uploadZones.length >= 2) {
            setupDragDrop(uploadZones[0], idCardFile, idCardName);
            setupDragDrop(uploadZones[1], transcriptFile, transcriptName);
        }

        step2Form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();
            let hasError = false;

            if (idCardFile && (!idCardFile.files || !idCardFile.files[0])) {
                showError(idCardFile.parentNode, 'กรุณาอัปโหลดสำเนาบัตรประจำตัวประชาชน');
                hasError = true;
            }

            if (transcriptFile && (!transcriptFile.files || !transcriptFile.files[0])) {
                showError(transcriptFile.parentNode, 'กรุณาอัปโหลดใบแสดงผลการเรียน (ปพ.1)');
                hasError = true;
            }

            if (hasError) return;

            const applicant = getApplicant() || {};
            applicant.documents = {
                idCard: idCardFile.files[0].name,
                transcript: transcriptFile.files[0].name
            };
            saveApplicant(applicant);
            goTo('step3.html');
        });
    }

    // ==========================================
    // 8. step3.html — ชำระเงิน
    // ==========================================
    const payConfirmBtn = document.getElementById('pay-confirm-btn') || document.getElementById('pay-btn');
    if (payConfirmBtn) {
        payConfirmBtn.addEventListener('click', function () {
            const applicant = getApplicant() || {};
            applicant.paymentStatus = 'paid';
            applicant.paidAt = new Date().toLocaleString('th-TH');
            saveApplicant(applicant);
            goTo('step4.html');
        });
    }

    // ==========================================
    // 9. login.html — เข้าสู่ระบบ
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();

            const loginId = document.getElementById('login-id');
            const loginPassword = document.getElementById('login-password');

            if (!loginId || !loginId.value.trim()) {
                showError(loginId, 'กรุณากรอกเลขประจำตัวประชาชน');
                return;
            }

            const applicant = getApplicant();
            if (!applicant || applicant.idCard !== loginId.value.trim()) {
                showError(loginId, 'ไม่พบข้อมูลผู้สมัครด้วยเลขประจำตัวนี้ กรุณาลงทะเบียนก่อน');
                return;
            }

            // ตรวจสอบรหัสผ่าน (ถ้ามีการลงทะเบียนรหัสผ่านไว้)
            if (applicant.password && loginPassword && loginPassword.value !== applicant.password) {
                showError(loginPassword, 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
                return;
            }

            setSession(applicant.idCard);
            goTo('status.html');
        });
    }

    // ==========================================
    // 9.2. Apply/Registration.html — ลงทะเบียนเข้าใช้งาน
    // ==========================================
    const regForm = document.getElementById('registration-form');
    if (regForm) {
        regForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();
            let hasError = false;

            const regId = document.getElementById('reg-id-card');
            const regPassword = document.getElementById('reg-password');
            const regConfirmPassword = document.getElementById('reg-confirm-password');
            const regFirstName = document.getElementById('reg-first-name');
            const regLastName = document.getElementById('reg-last-name');
            const regEmail = document.getElementById('reg-email');
            const regConfirmEmail = document.getElementById('reg-confirm-email');
            const regAlert = document.getElementById('register-alert');

            // 1. ตรวจสอบเลขประจำตัวประชาชน 13 หลัก
            const idVal = regId ? regId.value.trim() : '';
            if (!/^\d{13}$/.test(idVal)) {
                showError(regId, 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก (เฉพาะตัวเลขเท่านั้น)');
                hasError = true;
            }

            // 2. ตรวจสอบรหัสผ่าน (ความยาวไม่ต่ำกว่า 8 ตัวอักษร, เป็นตัวเลขและตัวอักษรภาษาอังกฤษรวมกัน)
            const passVal = regPassword ? regPassword.value : '';
            const hasLetter = /[a-zA-Z]/.test(passVal);
            const hasDigit = /\d/.test(passVal);
            if (passVal.length < 8 || !hasLetter || !hasDigit) {
                showError(regPassword, 'รหัสผ่านต้องมีความยาวไม่ต่ำกว่า 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขรวมกัน');
                hasError = true;
            }

            // 3. ตรวจสอบยืนยันรหัสผ่าน (เหมือนกับรหัสผ่าน)
            const confirmPassVal = regConfirmPassword ? regConfirmPassword.value : '';
            if (confirmPassVal !== passVal) {
                showError(regConfirmPassword, 'รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
                hasError = true;
            }

            // 4. ตรวจสอบชื่อ (ภาษาไทย ไม่ต้องมีคำนำหน้าชื่อ)
            const fNameVal = regFirstName ? regFirstName.value.trim() : '';
            if (!fNameVal) {
                showError(regFirstName, 'กรุณากรอกชื่อ (ภาษาไทย)');
                hasError = true;
            } else if (/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)/.test(fNameVal)) {
                showError(regFirstName, 'กรุณากรอกชื่อโดยไม่ต้องใส่คำนำหน้าชื่อ (เช่น นาย, นางสาว)');
                hasError = true;
            }

            // 5. ตรวจสอบนามสกุล
            const lNameVal = regLastName ? regLastName.value.trim() : '';
            if (!lNameVal) {
                showError(regLastName, 'กรุณากรอกนามสกุล (ภาษาไทย)');
                hasError = true;
            }

            // 6. ตรวจสอบอีเมล์
            const emailVal = regEmail ? regEmail.value.trim() : '';
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)) {
                showError(regEmail, 'กรุณากรอกอีเมล์ให้ถูกต้อง เช่น name@kmutnb.ac.th');
                hasError = true;
            }

            // 7. ตรวจสอบยืนยันอีเมล์ (ต้องตรงกับอีเมล์ด้านบน)
            const confirmEmailVal = regConfirmEmail ? regConfirmEmail.value.trim() : '';
            if (confirmEmailVal.toLowerCase() !== emailVal.toLowerCase()) {
                showError(regConfirmEmail, 'อีเมล์ยืนยันไม่ตรงกับอีเมล์ที่ระบุด้านบน');
                hasError = true;
            }

            if (hasError) return;

            // บันทึกข้อมูลการลงทะเบียน
            const existingApplicant = getApplicant() || {};
            const updatedApplicant = Object.assign({}, existingApplicant, {
                idCard: idVal,
                password: passVal,
                firstName: fNameVal,
                lastName: lNameVal,
                email: emailVal,
                registeredAt: new Date().toISOString()
            });

            // สร้างเลขที่ใบสมัครจำลองหากยังไม่มี
            if (!updatedApplicant.appNumber) {
                updatedApplicant.appNumber = 'APP70-' + String(Math.floor(Math.random() * 900000) + 100000);
            }

            saveApplicant(updatedApplicant);

            // แสดงการแจ้งเตือนสำเร็จ
            if (regAlert) {
                regAlert.className = 'mb-6 p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700 fade-in';
                regAlert.innerHTML = '<i class="fa-solid fa-circle-check mr-2 text-green-600"></i><strong>ลงทะเบียนสำเร็จ!</strong> กำลังนำท่านเข้าสู่หน้าเข้าสู่ระบบ...';
                regAlert.classList.remove('hidden');
            }

            const submitBtn = document.getElementById('reg-submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> กำลังบันทึกข้อมูล...';
            }

            // นำทางไปหน้าเข้าสู่ระบบ
            setTimeout(function () {
                const isInsideFolder = window.location.pathname.indexOf('/Apply/') !== -1 || window.location.pathname.indexOf('\\Apply\\') !== -1;
                window.location.href = isInsideFolder ? '../login.html' : 'login.html';
            }, 1200);
        });
    }

    // ==========================================
    // 9.5. forgot_password.html — ลืมรหัสผ่าน
    // ==========================================
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();

            const forgotId = document.getElementById('forgot-id');
            const forgotEmail = document.getElementById('forgot-email');
            const forgotResult = document.getElementById('forgot-result');

            if (forgotId && !/^\d{13}$/.test(forgotId.value.trim())) {
                showError(forgotId, 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก');
                return;
            }

            if (forgotEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail.value.trim())) {
                showError(forgotEmail, 'กรุณากรอกอีเมลให้ถูกต้อง');
                return;
            }

            // แสดงข้อความสำเร็จ (ระบบจำลอง)
            if (forgotResult) {
                forgotResult.classList.remove('hidden');
                forgotResult.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> ระบบได้ส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปที่อีเมล <strong>' + forgotEmail.value.trim() + '</strong> แล้ว กรุณาตรวจสอบกล่องข้อความ';
            }
        });
    }

    // ==========================================
    // 10. result.html — ค้นหาผลการคัดเลือก
    // ==========================================
    const resultSearchBtn = document.getElementById('result-search-btn');
    const resultSearchInput = document.getElementById('result-search-input');
    const resultBox = document.getElementById('result-box');
    const resultNotFound = document.getElementById('result-not-found');

    if (resultSearchBtn && resultSearchInput) {
        function runSearch() {
            const val = resultSearchInput.value.trim();
            if (resultBox) resultBox.classList.add('hidden');
            if (resultNotFound) resultNotFound.classList.add('hidden');

            if (!val) {
                showError(resultSearchInput, 'กรุณากรอกเลขประจำตัวประชาชน');
                return;
            }

            const applicant = getApplicant();
            if (applicant && applicant.idCard === val) {
                if (resultBox) {
                    resultBox.classList.remove('hidden');
                    const nameEl = resultBox.querySelector('[data-field="resultName"]');
                    if (nameEl) nameEl.textContent = (applicant.title || '') + (applicant.firstName || '') + ' ' + (applicant.lastName || '');
                    const campusEl = resultBox.querySelector('[data-field="campus"]');
                    if (campusEl) campusEl.textContent = applicant.campus || 'วิทยาเขตกรุงเทพฯ';
                    const facultyEl = resultBox.querySelector('[data-field="faculty"]');
                    if (facultyEl) facultyEl.textContent = applicant.faculty || 'คณะวิศวกรรมศาสตร์';
                }
            } else {
                if (resultNotFound) resultNotFound.classList.remove('hidden');
            }
        }

        resultSearchBtn.addEventListener('click', runSearch);
        resultSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') runSearch();
        });
    }

    // ==========================================
    // 11. เติมข้อมูลอัตโนมัติ (data-field)
    // ==========================================
    function fillField(el, data) {
        const field = el.getAttribute('data-field');
        if (field === 'fullName') {
            el.textContent = (data.title || '') + (data.firstName || '') + ' ' + (data.lastName || '');
        } else if (field === 'idCardMasked') {
            el.textContent = data.idCard ? data.idCard.substring(0, 3) + 'XXXXXXXXXX' : '—';
        } else if (field === 'paymentStatusText') {
            el.textContent = data.paymentStatus === 'paid' ? 'ชำระเงินเรียบร้อยแล้ว' : 'รอการชำระเงิน';
        } else if (field === 'documentsList') {
            const docs = data.documents || {};
            const names = Object.values(docs).filter(Boolean);
            el.textContent = names.length ? names.join(', ') : 'สำเนาบัตรประชาชน, ปพ.1';
        } else if (field === 'campus') {
            el.textContent = data.campus || 'วิทยาเขตกรุงเทพฯ';
        } else if (field === 'faculty') {
            el.textContent = data.faculty || 'คณะวิศวกรรมศาสตร์';
        } else if (data[field]) {
            el.textContent = data[field];
        }
    }

    const applicantData = getApplicant();
    if (applicantData) {
        document.querySelectorAll('main [data-field]').forEach(function (el) {
            fillField(el, applicantData);
        });
    }

    // ==========================================
    // Helper Functions
    // ==========================================
    function showError(element, message) {
        element.classList.add('input-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-600 text-xs mt-1';
        errorDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i>' + message;
        const container = element.closest('.input-icon-group') || element;
        if (container.parentNode) {
            container.parentNode.insertBefore(errorDiv, container.nextSibling);
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(function (el) { el.remove(); });
        document.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }
});
