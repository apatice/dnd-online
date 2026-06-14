/* common.js — D&D Online shared scripts */

/* ── WIP Overlay ── */
function showWIP() {
    const overlay = document.querySelector('.wip-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('show'));
}

function hideWIP() {
    const overlay = document.querySelector('.wip-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

/* ── Particle System ── */
function initParticles(containerId = 'particles') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const count = 60;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
        p.style.animationDuration = (Math.random() * 15 + 8) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        p.style.opacity = Math.random() * 0.6;
        container.appendChild(p);
    }
}

/* ── Rune background ── */
function initRunes(containerId = 'runes') {
    const runes = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < 12; i++) {
        const r = document.createElement('div');
        r.className = 'rune';
        r.textContent = runes[Math.floor(Math.random() * runes.length)];
        r.style.left = Math.random() * 100 + '%';
        r.style.top = Math.random() * 100 + '%';
        r.style.fontSize = (Math.random() * 60 + 30) + 'px';
        r.style.animationDelay = (Math.random() * 8) + 's';
        r.style.animationDuration = (Math.random() * 8 + 6) + 's';
        container.appendChild(r);
    }
}

/* ── Loading Screen ── */
function initLoading() {
    const screen = document.getElementById('loadingScreen');
    if (!screen) return;
    screen.style.display = 'flex';
    setTimeout(() => {
        screen.classList.add('hidden');
        setTimeout(() => screen.remove(), 800);
    }, 1800);
}

/* ── Modal System ── */
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

/* ── Toast Notification ── */
function showToast(msg, duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Volume Sliders ── */
function initVolumeSliders() {
    document.querySelectorAll('.volume-slider').forEach(slider => {
        const valueEl = document.getElementById(slider.id + 'Value');
        if (valueEl) valueEl.textContent = slider.value + '%';
        slider.addEventListener('input', () => {
            if (valueEl) valueEl.textContent = slider.value + '%';
        });
    });
}

/* ── Chat System ── */
function initChat(frameId, inputId, sendId, messagesId, toggleId) {
    const frame = document.getElementById(frameId);
    const input = document.getElementById(inputId);
    const sendBtn = document.getElementById(sendId);
    const messages = document.getElementById(messagesId);
    const toggle = document.getElementById(toggleId);

    if (!frame) return;

    if (toggle) toggle.addEventListener('click', () => frame.classList.toggle('open'));

    const addMsg = (text) => {
        if (!text.trim()) return;
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.textContent = 'You: ' + text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        if (input) input.value = '';
    };

    if (sendBtn) sendBtn.addEventListener('click', () => addMsg(input.value));
    if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') addMsg(input.value); });
}

/* ── Search Filter ── */
function initSearch(inputId, itemSelector) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        document.querySelectorAll(itemSelector).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? '' : 'none';
        });
    });
}

/* ── DOMContentLoaded init ── */
document.addEventListener('DOMContentLoaded', () => {
    initParticles('particles');
    initRunes('runes');
    initLoading();
    initVolumeSliders();

    // WIP close on click
    const wip = document.querySelector('.wip-overlay');
    if (wip) {
        wip.addEventListener('click', (e) => {
            if (e.target === wip || e.target.classList.contains('wip-close')) hideWIP();
        });
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
});
