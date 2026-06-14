/* main.js */

document.addEventListener('DOMContentLoaded', () => {
    // ── Load Custom User Avatar
    const customAvatar = localStorage.getItem('userAvatar');
    if (customAvatar) {
        const mainProfileAvatar = document.querySelector('.profile-card .profile-avatar');
        if (mainProfileAvatar) {
            mainProfileAvatar.style.background = `url('${customAvatar}') center/cover no-repeat`;
            mainProfileAvatar.style.border = 'none';
        }
    }
    // ── Load Active Character
    const activeCharData = localStorage.getItem('activeCharacter');
    if (activeCharData) {
        try {
            const char = JSON.parse(activeCharData);
            const previewCard = document.querySelector('.char-preview-card');
            if (previewCard) {
                if (char.name) previewCard.querySelector('.char-name').textContent = char.name;
                if (char.classLevel) previewCard.querySelector('.char-class').textContent = char.classLevel;
                
                const stats = previewCard.querySelectorAll('.stat-mini');
                if (stats.length >= 3) {
                    stats[0].innerHTML = `<span class="stat-icon">❤</span> ${char.hp}`;
                    stats[1].innerHTML = `<span class="stat-icon">⚡</span> ${char.energy}`;
                    stats[2].innerHTML = `<span class="stat-icon">🛡</span> ${char.ac}`;
                }
                
                if (char.image) {
                    const portrait = previewCard.querySelector('.char-portrait');
                    if (portrait) {
                        portrait.classList.remove('img-placeholder');
                        portrait.style.background = `url('${char.image}') top center/cover no-repeat`;
                        portrait.style.border = '1px solid rgba(212,175,55,0.3)';
                    }
                }
            }
        } catch(e) { console.error('Error loading active character:', e); }
    }

    // ── Flying Runes Background (Only on Main)
    const runesContainer = document.getElementById('runes');
    if (runesContainer) {
        // Clear standard static runes spawned by common.js
        setTimeout(() => runesContainer.innerHTML = '', 100); 
        
        const runes = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ','ᛧ','ᛤ','ᛥ','ᛦ','✡','ᛢ','ᛣ','⚝','✥'];
        function spawnFlyingRuneString() {
            const r = document.createElement('div');
            const isLeftToRight = Math.random() > 0.5;
            r.className = isLeftToRight ? 'rune fly-right' : 'rune fly-left';
            
            // Generate a random string of runes
            const length = Math.floor(Math.random() * 10) + 6; // 6 to 15 runes
            let runeStr = '';
            for (let i = 0; i < length; i++) {
                runeStr += runes[Math.floor(Math.random() * runes.length)];
                if (Math.random() > 0.7) runeStr += ' '; // Occasional spaces
            }
            r.textContent = runeStr.trim();
            
            r.style.top = Math.random() * 90 + '%';
            
            // Parallax layers
            const isForeground = Math.random() > 0.6; // 40% front, 60% back
            
            if (isForeground) {
                // Front layer: big, fast, bright
                r.style.fontSize = (Math.random() * 30 + 25) + 'px'; // 25-55px
                r.style.animationDuration = (Math.random() * 5 + 3) + 's'; // 3-8s flight time
                r.style.setProperty('--rune-opacity', '0.15');
                r.style.zIndex = '2';
            } else {
                // Back layer: small, slow, dim, slightly blurred
                r.style.fontSize = (Math.random() * 12 + 10) + 'px'; // 10-22px
                r.style.animationDuration = (Math.random() * 15 + 10) + 's'; // 10-25s flight time
                r.style.setProperty('--rune-opacity', '0.04');
                r.style.filter = 'blur(1px)';
                r.style.zIndex = '1';
            }
            
            runesContainer.appendChild(r);
            const cleanupTime = isForeground ? 10000 : 30000;
            setTimeout(() => r.remove(), cleanupTime); // Cleanup after max flight time
        }
        
        // Initial spawn
        for (let i = 0; i < 25; i++) {
            setTimeout(spawnFlyingRuneString, Math.random() * 15000);
        }
        
        // Continuous spawn
        setInterval(spawnFlyingRuneString, 1000);
    }
    // ── Play Button
    document.getElementById('playButton')?.addEventListener('click', () => openModal('playModal'));

    // ── Friends Button
    document.getElementById('friendsButton')?.addEventListener('click', () => {
        openModal('friendsModal');
        initSearch('friendsSearch', '#friendsList .friend-item .friend-name');
        initSearch('groupsSearch', '#groupsList .group-item .friend-name');
    });

    // ── Settings Button
    document.getElementById('settingsButton')?.addEventListener('click', () => openModal('settingsModal'));

    // ── Stats Button
    document.getElementById('statsButton')?.addEventListener('click', () => openModal('statsModal'));

    // ── Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Sign out of D&D Online?')) {
            window.location.href = '../authorization/authorization.html';
        }
    });

    // ── WIP buttons
    ['newsBtn', 'shopBtn', 'supportBtn', 'tutorialBtn'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => showWIP());
    });

    // ── Settings tabs
    document.querySelectorAll('.stab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.stab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            document.getElementById('tab-' + tab)?.classList.add('active');
        });
    });

    // ── Settings apply
    document.getElementById('settingsApply')?.addEventListener('click', () => {
        showToast('⚙ Settings saved!');
        closeModal('settingsModal');
    });

    // ── Friends search
    document.getElementById('friendsSearch')?.addEventListener('input', function () {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#friendsList .friend-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    document.getElementById('groupsSearch')?.addEventListener('input', function () {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#groupsList .group-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    // ── Friend action buttons
    document.querySelectorAll('.friend-action-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = btn.closest('.friend-item')?.querySelector('.friend-name')?.textContent || 'Player';
            showToast(`⚔ Invite sent to ${name}`);
        });
    });

    // ── Join code
    document.querySelector('.join-code-btn')?.addEventListener('click', () => {
        const code = document.getElementById('inviteCodeInput')?.value?.trim();
        if (!code) { showToast('Enter an invite code!'); return; }
        showToast(`Joining game: ${code}...`);
        setTimeout(() => window.location.href = '../game/game.html', 1200);
    });

    // ── Add friend / Create group
    document.querySelectorAll('.add-friend-btn').forEach(btn => {
        btn.addEventListener('click', () => showWIP());
    });

    // ── Animate nav buttons on hover with sound effect (optional)
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.style.animationDelay = (i * 0.08) + 's';
        btn.style.animation = 'fadeInUp 0.5s ease both';
    });

    // ── WIP buttons in play modal
    document.querySelectorAll('.play-option').forEach(opt => {
        const href = opt.getAttribute('href');
        if (href === '#') {
            opt.addEventListener('click', (e) => { e.preventDefault(); showWIP(); });
        }
    });

    // ── Escape key closes modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            ['playModal','friendsModal','settingsModal','statsModal'].forEach(id => closeModal(id));
        }
    });
});