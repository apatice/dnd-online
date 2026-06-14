/* profile.js */

document.addEventListener('DOMContentLoaded', () => {
    let isEditing = false;

    // ── Tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const id = 'tab-' + tab.getAttribute('data-tab');
            document.getElementById(id)?.classList.add('active');
        });
    });

    // ── Edit Profile toggle
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
        isEditing = !isEditing;
        setEditMode(isEditing);
    });

    function setEditMode(editing) {
        // Switch to description tab
        if (editing) {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="description"]')?.classList.add('active');
            document.getElementById('tab-description')?.classList.add('active');
        }

        const editables = document.querySelectorAll('.desc-value.editable');
        editables.forEach(el => el.setAttribute('contenteditable', editing ? 'true' : 'false'));

        const selects = document.querySelectorAll('.desc-select');
        selects.forEach(el => el.disabled = !editing);

        const aboutBox = document.getElementById('aboutBox');
        if (aboutBox) aboutBox.setAttribute('contenteditable', editing ? 'true' : 'false');

        const editControls = document.getElementById('editControls');
        if (editControls) editControls.style.display = editing ? 'block' : 'none';

        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) editBtn.querySelector('span').textContent = editing ? '✎ Stop Editing' : '✎ Edit Profile';
    }

    // ── Save profile
    document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
        isEditing = false;
        setEditMode(false);
        showToast('✓ Profile saved!');
    });

    // ── Cancel edit
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        isEditing = false;
        setEditMode(false);
    });

    // ── About counter & limits
    const aboutBox = document.getElementById('aboutBox');
    const counter = document.getElementById('aboutCounter');
    if (aboutBox && counter) {
        const updateCounter = () => {
            const len = aboutBox.textContent.length;
            counter.textContent = len + '/500';
            counter.style.color = len >= 500 ? 'var(--color-red)' : 'rgba(212,175,55,0.3)';
        };
        updateCounter();
        aboutBox.addEventListener('input', updateCounter);
        
        aboutBox.addEventListener('keydown', (e) => {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (aboutBox.textContent.length >= 500 && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
            }
        });
        aboutBox.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const remaining = 500 - aboutBox.textContent.length;
            if (remaining > 0) {
                document.execCommand('insertText', false, text.substring(0, remaining));
            }
        });
    }

    // ── Age limits
    const editAge = document.getElementById('editAge');
    if (editAge) {
        editAge.addEventListener('input', () => {
            if (editAge.value === '') return;
            let val = parseInt(editAge.value, 10);
            if (val > 99) editAge.value = 99;
            if (val < 1) editAge.value = 1;
        });
    }

    // ── Change avatar
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarUploadInput');
    const profileAvatar = document.getElementById('profileAvatar');

    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    localStorage.setItem('userAvatar', dataUrl);
                    if (profileAvatar) {
                        profileAvatar.style.background = `url('${dataUrl}') center/cover no-repeat`;
                    }
                    showToast('🖼 Avatar updated!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load saved avatar
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar && profileAvatar) {
        profileAvatar.style.background = `url('${savedAvatar}') center/cover no-repeat`;
    }

    // ── Archive (WIP)
    // ── Archive Modal Logic
    const archiveBtn = document.getElementById('archiveBtn');
    const archiveModal = document.getElementById('archiveModal');
    const closeArchiveBtn = document.getElementById('closeArchiveBtn');

    if (archiveBtn && archiveModal) {
        archiveBtn.addEventListener('click', () => {
            archiveModal.classList.add('active');
        });
        
        closeArchiveBtn.addEventListener('click', () => {
            archiveModal.classList.remove('active');
        });
        
        archiveModal.addEventListener('click', (e) => {
            if (e.target === archiveModal) {
                archiveModal.classList.remove('active');
            }
        });
    }

    // ── Share profile
    document.getElementById('shareBtn')?.addEventListener('click', () => {
        navigator.clipboard?.writeText(window.location.href);
        showToast('🔗 Profile link copied!');
    });

    // ── Preferences toggle
    document.querySelectorAll('.pref-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // ── History filters
    document.querySelectorAll('.hist-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.hist-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ── Load Active Character
    const activeCharData = localStorage.getItem('activeCharacter');
    if (activeCharData) {
        try {
            const char = JSON.parse(activeCharData);
            const portrait = document.querySelector('.char-portrait-lg');
            const nameEl = document.querySelector('.char-name-lg');
            const classEl = document.querySelector('.char-class-lg');
            
            if (portrait && char.image) {
                const cleanImg = char.image.replace(/['"]/g, '');
                portrait.style.backgroundImage = `url('${cleanImg}')`;
                portrait.style.backgroundPosition = 'center top';
                portrait.style.backgroundRepeat = 'no-repeat';
                portrait.style.backgroundSize = 'cover';
                portrait.classList.remove('img-placeholder');
                portrait.style.border = '1px solid rgba(212,175,55,0.3)';
            }
            if (nameEl && char.name) nameEl.textContent = char.name;
            if (classEl && char.classLevel) classEl.textContent = char.classLevel;

            // Update stats
            const stats = document.querySelectorAll('.char-attr span:not(.attr-icon)');
            if (stats.length >= 3) {
                if (char.hp) stats[0].textContent = char.hp + ' HP';
                if (char.energy) stats[1].textContent = char.energy + ' MP';
                if (char.ac) stats[2].textContent = char.ac;
            }
        } catch (e) {
            console.error('Error loading active character:', e);
        }
    }

    // ── Animate XP bar
    const xpFill = document.getElementById('xpFill');
    if (xpFill) {
        xpFill.style.width = '0%';
        setTimeout(() => { xpFill.style.width = '68%'; }, 400);
    }
});