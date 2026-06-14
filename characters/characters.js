/* characters.js */

document.addEventListener('DOMContentLoaded', () => {
    // ── WIP buttons
    ['createCharBtn', 'yourCharsBtn', 'premadeBtn'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => showWIP());
    });

    // ── Filter buttons
    document.querySelectorAll('.cf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ── Animate cards
    document.querySelectorAll('.char-card').forEach((card, i) => {
        card.style.animationDelay = (i * 0.1) + 's';
        card.style.animation = 'fadeInUp 0.5s ease both';
    });
});

function selectChar(id) {
    document.querySelectorAll('.char-card').forEach(c => {
        c.classList.remove('active-char');
        const badge = c.querySelector('.char-card-badge');
        if (badge) badge.remove();
    });

    const card = document.getElementById('charCard' + id);
    if (card) {
        card.classList.add('active-char');
        const badge = document.createElement('div');
        badge.className = 'char-card-badge active-badge';
        badge.textContent = 'ACTIVE';
        card.prepend(badge);

        // Save to localStorage
        try {
            const charData = {};
            
            const nameEl = card.querySelector('.char-card-name');
            if (nameEl) charData.name = nameEl.textContent;
            
            const classEl = card.querySelector('.char-card-class');
            const raceEl = card.querySelector('.char-card-race');
            if (classEl && raceEl) {
                const levelMatch = raceEl.textContent.match(/Level\s+\d+/i);
                charData.classLevel = classEl.textContent + ' · ' + (levelMatch ? levelMatch[0] : '');
            }
            
            const getStat = index => {
                const el = card.querySelector(`.char-card-stats .ccs:nth-child(${index})`);
                return el ? el.textContent.replace(/[❤⚡🛡]/g, '').trim() : '';
            };
            
            charData.hp = getStat(1);
            charData.energy = getStat(2);
            let acRaw = getStat(3);
            if (acRaw.startsWith('AC')) {
                charData.ac = acRaw.replace('AC', '') + ' AC';
            } else {
                charData.ac = acRaw;
            }
            
            const artEl = card.querySelector('.char-card-art');
            if (artEl) {
                const bgMatch = artEl.getAttribute('style')?.match(/url\(['"]?(.*?)['"]?\)/);
                if (bgMatch) charData.image = bgMatch[1];
            }
            
            localStorage.setItem('activeCharacter', JSON.stringify(charData));
        } catch (e) {
            console.error('Error saving character:', e);
        }
    }

    showToast('⚔ Character set as active!');
}

function viewChar(id) {
    showWIP();
}

function confirmDelete(id) {
    const card = document.getElementById('charCard' + id);
    const name = card?.querySelector('.char-card-name')?.textContent || 'this character';
    if (confirm(`Delete ${name}? This cannot be undone.`)) {
        card.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => card.remove(), 300);
        showToast('Character deleted.');
    }
}
