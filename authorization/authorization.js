/* authorization.js */

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.querySelector('.btn-text').textContent = 'Entering...';
    btn.disabled = true;
    setTimeout(() => {
        window.location.href = '../main/main.html';
    }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
    // Password toggle
    const passToggle = document.getElementById('passToggle');
    const passInput = document.getElementById('password');
    if (passToggle && passInput) {
        passToggle.addEventListener('click', () => {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            passToggle.textContent = isPass ? '🙈' : '👁';
        });
    }

    // Social buttons => WIP
    document.getElementById('googleBtn')?.addEventListener('click', () => showToast('Google login — Coming soon!'));
    document.getElementById('discordBtn')?.addEventListener('click', () => showToast('Discord login — Coming soon!'));

    // Forgot password
    document.querySelector('.forgot-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Password reset — Coming soon!');
    });

    // Input focus effects
    document.querySelectorAll('.field-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.field-wrap')?.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.field-wrap')?.classList.remove('focused');
        });
    });
});
