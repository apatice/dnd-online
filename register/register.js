/* register.js */

let selectedAvatar = 0;
let currentStep = 1;

function nextStep(step) {
    if (step > currentStep && !validateStep(currentStep)) return;

    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.getElementById('step' + step)?.classList.add('active');

    document.querySelectorAll('.step').forEach((el, i) => {
        const n = i / 2 + 1;
        el.classList.remove('active', 'done');
        if (n < step) el.classList.add('done');
        if (n === step) el.classList.add('active');
    });

    if (step === 3) updateSummary();
    currentStep = step;
}

function validateStep(step) {
    if (step === 1) {
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        const conf = document.getElementById('regPassConfirm').value;
        if (!email || !pass || !conf) { showToast('Please fill all fields.'); return false; }
        if (pass !== conf) { showToast('Passwords do not match!'); return false; }
        if (pass.length < 8) { showToast('Password must be at least 8 characters.'); return false; }
    }
    if (step === 2) {
        const nick = document.getElementById('regNick').value;
        if (!nick) { showToast('Choose a nickname for your hero!'); return false; }
    }
    return true;
}

function updateSummary() {
    const nick = document.getElementById('regNick').value || 'Hero';
    const email = document.getElementById('regEmail').value || 'email@domain.com';
    document.getElementById('summaryName').textContent = nick;
    document.getElementById('summaryEmail').textContent = email;

    const selectedAvaEl = document.querySelector('.avatar-pick[data-selected="true"]');
    if (selectedAvaEl) {
        const bg = getComputedStyle(selectedAvaEl).backgroundImage;
        const summaryAva = document.getElementById('summaryAvatar');
        summaryAva.style.backgroundImage = bg;
        summaryAva.style.backgroundSize = 'cover';
        summaryAva.style.backgroundPosition = 'center';
        summaryAva.style.border = '2px solid var(--color-gold)';
        summaryAva.classList.remove('img-placeholder');
    }
}

function selectAvatar(el, id) {
    document.querySelectorAll('.avatar-pick').forEach(a => a.setAttribute('data-selected', 'false'));
    el.setAttribute('data-selected', 'true');
    selectedAvatar = id;
}

function togglePass(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    btn.textContent = isPass ? '🙈' : '👁';
}

function handleRegister() {
    if (!document.getElementById('tosCheck').checked) {
        showToast('Please accept the Terms of Service.');
        return;
    }
    const btn = document.getElementById('finalRegBtn');
    btn.querySelector('.btn-text').textContent = 'Creating account...';
    btn.disabled = true;
    setTimeout(() => window.location.href = '../authorization/authorization.html', 1500);
}

// Password strength checker
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('regPass');
    if (!passInput) return;
    passInput.addEventListener('input', () => {
        const val = passInput.value;
        const fill = document.getElementById('strengthFill');
        const label = document.getElementById('strengthLabel');
        if (!fill || !label) return;
        fill.className = 'strength-fill';
        if (val.length === 0) { fill.style.width = '0'; label.textContent = ''; return; }
        if (val.length < 6) { fill.classList.add('weak'); label.textContent = 'Weak'; }
        else if (val.length < 10 && !/[!@#$%^&*]/.test(val)) { fill.classList.add('fair'); label.textContent = 'Fair'; }
        else if (val.length >= 10 && /[A-Z]/.test(val) && /[0-9]/.test(val)) { fill.classList.add('strong'); label.textContent = 'Strong!'; }
        else { fill.classList.add('good'); label.textContent = 'Good'; }
    });
});
