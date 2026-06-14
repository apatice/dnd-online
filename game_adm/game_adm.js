/* game_adm.js - DM interface logic */

document.addEventListener('DOMContentLoaded', () => {
    
    // ── Map Panning Logic ──
    const gameMap = document.getElementById('gameMap');
    const mapLayer = document.getElementById('mapLayer');
    let isDragging = false;
    let startX = 0, startY = 0, panX = 0, panY = 0;

    if (gameMap && mapLayer) {
        gameMap.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            // Prevent panning if clicking on a token
            if (e.target.closest('.player-token') || e.target.closest('.enemy-token')) return;
            isDragging = true;
            mapLayer.classList.add('dragging');
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let targetPanX = e.clientX - startX;
            let targetPanY = e.clientY - startY;

            let maxPanX = Math.max(0, (mapLayer.offsetWidth - window.innerWidth) / 2);
            let maxPanY = Math.max(0, (mapLayer.offsetHeight - window.innerHeight) / 2);
            
            panX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
            panY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

            // Prevent drag drift when hitting bounds
            startX = e.clientX - panX;
            startY = e.clientY - panY;

            mapLayer.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (mapLayer) mapLayer.classList.remove('dragging');
        });
    }

    // ── Load User Avatar ──
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        const leftPortrait = document.getElementById('ingamePortraitLeft');
        if (leftPortrait) leftPortrait.style.backgroundImage = `url('${savedAvatar}')`;
        const token1 = document.getElementById('playerToken1');
        if (token1) token1.style.backgroundImage = `url('${savedAvatar}')`;
    }
    const chatFrame = document.getElementById('chatFrame');
    const dicePanel = document.getElementById('dicePanel');
    const actionPanel = document.getElementById('actionPanel');
    const menuFrame = document.getElementById('menuFrame');
    const dmPanel = document.getElementById('dmPanel');

    // ── Prevent clicks on panels from bubbling to map
    [chatFrame, dicePanel, actionPanel, dmPanel, menuFrame].forEach(p => {
        if (p) p.addEventListener('click', (e) => e.stopPropagation());
    });

    // ── Toggles
    const toggleNav = (id) => {
        document.getElementById(id)?.classList.toggle('active');
    };

    document.getElementById('chatToggle')?.classList.add('active');

    document.getElementById('chatToggle')?.addEventListener('click', () => {
        chatFrame?.classList.toggle('open');
        toggleNav('chatToggle');
    });

    document.getElementById('sheetToggle')?.addEventListener('click', () => {
        dmPanel?.classList.toggle('open');
        toggleNav('sheetToggle');
    });

    document.getElementById('diceToggle')?.addEventListener('click', () => {
        const showing = dicePanel?.style.display !== 'none';
        if (actionPanel) actionPanel.style.display = 'none';
        if (dicePanel) dicePanel.style.display = showing ? 'none' : 'block';
        document.getElementById('actionToggle')?.classList.remove('active');
        toggleNav('diceToggle');
    });

    document.getElementById('actionToggle')?.addEventListener('click', () => {
        const showing = actionPanel?.style.display !== 'none';
        if (dicePanel) dicePanel.style.display = 'none';
        if (actionPanel) actionPanel.style.display = showing ? 'none' : 'block';
        document.getElementById('diceToggle')?.classList.remove('active');
        toggleNav('actionToggle');
    });

    document.getElementById('menuToggle')?.addEventListener('click', () => {
        if (menuFrame) menuFrame.style.display = 'flex';
    });

    // ── Menu close
    document.getElementById('menuCross')?.addEventListener('click', () => {
        if (menuFrame) menuFrame.style.display = 'none';
    });

    // ── Menu options
    document.getElementById('exitGameBtn')?.addEventListener('click', () => {
        if (confirm('Leave the game? Progress will be saved.')) {
            window.location.href = '../main/main.html';
        }
    });
    
    document.getElementById('deleteGameBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this campaign permanently?')) {
            window.location.href = '../main/main.html';
        }
    });

    ['playersBtn', 'saveGameBtn'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            if (menuFrame) menuFrame.style.display = 'none';
            if (typeof showWIP === 'function') showWIP();
        });
    });
    
    // ── DM Panel Tabs
    const tabRoster = document.getElementById('tabRosterBtn');
    const tabBestiary = document.getElementById('tabBestiaryBtn');
    const dmRoster = document.getElementById('dmRoster');
    const dmBestiary = document.getElementById('dmBestiary');
    
    tabRoster?.addEventListener('click', () => {
        tabRoster.classList.add('active');
        tabBestiary?.classList.remove('active');
        if (dmRoster) dmRoster.style.display = 'block';
        if (dmBestiary) dmBestiary.style.display = 'none';
    });
    
    tabBestiary?.addEventListener('click', () => {
        tabBestiary.classList.add('active');
        tabRoster?.classList.remove('active');
        if (dmBestiary) dmBestiary.style.display = 'block';
        if (dmRoster) dmRoster.style.display = 'none';
    });

    // ── Chat logic
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const secretRollToggle = document.getElementById('secretRollToggle');

    const addChatMsg = (author, text, type = 'player') => {
        if (!chatMessages) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;
        
        let authorClass = 'msg-author';
        if (type === 'dm') authorClass += ' dm-author';
        
        // Handle secret rolls purely visual
        const isSecret = secretRollToggle && secretRollToggle.checked;
        const whisperPrefix = isSecret ? '<span style="color:#a855f7">[Secret]</span> ' : '';

        div.innerHTML = `<span class="${authorClass}">${author}:</span> ${whisperPrefix}${text}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const sendChatMsg = () => {
        const val = chatInput?.value?.trim();
        if (!val) return;
        
        if (val.startsWith('/roll')) {
            const isSecret = secretRollToggle && secretRollToggle.checked;
            const match = val.match(/\/roll\s*(\d*)d(\d+)([+-]\d+)?/i);
            
            if (match) {
                const count = parseInt(match[1] || '1');
                const sides = parseInt(match[2]);
                const mod = parseInt(match[3] || '0');
                
                // Fast pseudo roll
                let total = 0;
                for(let i=0; i<count; i++) {
                    total += Math.floor(Math.random() * sides) + 1;
                }
                total += mod;
                
                addChatMsg('DM', `rolled ${count}d${sides}${mod ? (mod > 0 ? '+'+mod : mod) : ''}: <strong>${total}</strong>`, 'dm');
            } else {
                if (typeof showRollNotification === 'function') showRollNotification('?', 'Invalid format');
            }
        } else {
            addChatMsg('DM', val, 'dm');
        }
        
        if (chatInput) chatInput.value = '';
    };

    document.getElementById('chatSendBtn')?.addEventListener('click', sendChatMsg);
    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMsg();
    });
    
    // ── Turn mechanics mock
    const turnActors = ['Aldric', 'Zira', 'Gorrim', 'Vampire Spawn A', 'Vampire Spawn B'];
    let currentTurnIndex = 0;
    document.getElementById('nextTurnBtn')?.addEventListener('click', () => {
        currentTurnIndex = (currentTurnIndex + 1) % turnActors.length;
        const txt = document.getElementById('currentTurnText');
        if (txt) txt.innerText = 'Turn: ' + turnActors[currentTurnIndex];
        
        if (currentTurnIndex === 0) {
            const roundEl = document.getElementById('roundNum');
            if (roundEl) roundEl.innerText = parseInt(roundEl.innerText) + 1;
        }
    });
    
    // ── 3D Dice Integration for DM
    const rollDMDie3D = (sides) => {
        const result = Math.floor(Math.random() * sides) + 1;
        const diceResultText = document.getElementById('diceResultText');
        const notif = document.getElementById('rollNotif');
        const notifNum = document.getElementById('rollNumNotif');
        const notifLabel = document.getElementById('rollLabel');
        
        if (diceResultText) {
            diceResultText.innerText = '...';
            diceResultText.style.color = 'var(--color-text-dim)';
        }
        
        // Disable buttons
        document.querySelectorAll('.dice-grid .die-btn').forEach(b => b.disabled = true);

        if (typeof rollThreeJSDice !== 'undefined') {
            rollThreeJSDice(sides, result, () => {
                // Animation finished
                if (diceResultText) {
                    diceResultText.innerText = result;
                    diceResultText.style.color = (result === sides) ? '#FFD700' : (result === 1) ? '#c0392b' : 'var(--color-gold)';
                }
                
                // Show Notification
                if (notif && notifNum && notifLabel) {
                    notifNum.innerText = result;
                    notifLabel.innerText = `DM Rolled d${sides}`;
                    notif.style.display = 'block';
                    notif.style.animation = 'none';
                    void notif.offsetWidth; // trigger reflow
                    notif.style.animation = 'slideUpFade 4s forwards';
                    setTimeout(() => { notif.style.display = 'none'; }, 4000);
                }
                
                // Add to chat
                const isSecret = secretRollToggle && secretRollToggle.checked;
                const prefix = isSecret ? '<span style="color:#a855f7">[Secret]</span> ' : '';
                addChatMsg('DM', `${prefix}rolled d${sides}: <strong>${result}</strong>`, 'dm');
                
                // Re-enable buttons
                document.querySelectorAll('.dice-grid .die-btn').forEach(b => b.disabled = false);
            });
        }
    };

    document.querySelectorAll('.dice-grid .die-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.die-btn').forEach(b => b.classList.remove('active-die'));
            btn.classList.add('active-die');
            const sides = parseInt(btn.getAttribute('data-sides'));
            rollDMDie3D(sides);
        });
    });

});