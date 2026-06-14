/* game.js */

document.addEventListener('DOMContentLoaded', () => {
    initParticles('particles');

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
        const rightPortrait = document.getElementById('playerPortraitRight');
        if (rightPortrait) rightPortrait.style.backgroundImage = `url('${savedAvatar}')`;
        const token1 = document.getElementById('playerToken1');
        if (token1) token1.style.backgroundImage = `url('${savedAvatar}')`;
    }

    const chatFrame = document.getElementById('chatFrame');
    const dicePanel = document.getElementById('dicePanel');
    const actionPanel = document.getElementById('actionPanel');
    const menuFrame = document.getElementById('menuFrame');
    const charPanel = document.getElementById('charPanel');

    // ── Prevent clicks on panels from bubbling
    [chatFrame, dicePanel, actionPanel, charPanel, menuFrame].forEach(p => {
        if (p) p.addEventListener('click', (e) => e.stopPropagation());
    });

    // ── Chat toggle (чат открыт по умолчанию)
    document.getElementById('chatToggle')?.classList.add('active');

    document.getElementById('chatToggle')?.addEventListener('click', () => {
        chatFrame?.classList.toggle('open');
        toggleNav('chatToggle');
    });

    document.getElementById('sheetToggle')?.addEventListener('click', () => {
        charPanel?.classList.toggle('open');
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

    ['handbookBtn', 'playersBtn', 'settingsGameBtn'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            if (menuFrame) menuFrame.style.display = 'none';
            showWIP();
        });
    });

    // ── Chat
    const chatInput = document.getElementById('chatInput');

    const sendChatMsg = () => {
        const val = chatInput?.value?.trim();
        if (!val) return;

        if (val.startsWith('/roll')) {
            // Parse dice command: /roll 2d6+3
            const match = val.match(/\/roll\s*(\d*)d(\d+)([+-]\d+)?/i);
            if (match) {
                const count = parseInt(match[1] || '1');
                const sides = parseInt(match[2]);
                const mod = parseInt(match[3] || '0');
                if (sides === 6 && count === 1) {
                    // Trigger 3D animation
                    rollD6WithAnimation(mod);
                } else {
                    rollDice(sides, count, mod);
                }
            } else {
                showRollNotification('?', 'Invalid format: /roll 1d20');
            }
        } else {
            addChatMsg('You', val, 'self');
        }
        chatInput.value = '';
    };

    document.getElementById('chatSendBtn')?.addEventListener('click', sendChatMsg);
    chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMsg(); });

    // ── Chat tabs
    document.querySelectorAll('.chat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // ── Click on 3D dice to roll it
    document.getElementById('dice3dWrap')?.addEventListener('click', () => {
        const activeBtn = document.querySelector('.die-btn.active-die');
        const sides = activeBtn ? parseInt(activeBtn.getAttribute('data-sides')) : 6;
        const count = parseInt(document.getElementById('diceCount')?.value || '1');
        const mod = parseInt(document.getElementById('diceModifier')?.value || '0');
        
        if (count === 1) rollUniversalDie3D(sides, mod);
        else rollDice(sides, count, mod);
    });

    // ── Dice grid buttons
    document.querySelectorAll('.die-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.die-btn').forEach(b => b.classList.remove('active-die'));
            btn.classList.add('active-die');

            const sides = parseInt(btn.getAttribute('data-sides'));
            const count = parseInt(document.getElementById('diceCount')?.value || '1');
            const mod = parseInt(document.getElementById('diceModifier')?.value || '0');
            
            if (count === 1) rollUniversalDie3D(sides, mod);
            else rollDice(sides, count, mod);
        });
    });

    // ── Action tabs
    document.querySelectorAll('.at-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.at-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ── End turn
    document.getElementById('endTurnBtn')?.addEventListener('click', () => {
        showRollNotification('→', 'Turn Ended');
        const roundEl = document.getElementById('roundNum');
        if (roundEl) roundEl.textContent = parseInt(roundEl.textContent) + 1;
        addChatMsg('System', 'Aldric ended their turn.', 'system');
    });

    // ── Click on map background to close panels
    document.getElementById('gameMap')?.addEventListener('click', () => {
        if (dicePanel) dicePanel.style.display = 'none';
        if (actionPanel) actionPanel.style.display = 'none';
        document.querySelectorAll('.gnav-btn').forEach(b => b.classList.remove('active'));
        // restore chat toggle state
        if (chatFrame?.classList.contains('open')) {
            document.getElementById('chatToggle')?.classList.add('active');
        }
    });
});

function toggleNav(activeId) {
    const btn = document.getElementById(activeId);
    btn?.classList.toggle('active');
}

function addChatMsg(author, text, type = 'player') {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    if (type === 'system' || type === 'dice') {
        div.innerHTML = text;
    } else {
        div.innerHTML = `<span class="msg-author ${type === 'self' ? 'self-author' : ''}">${author}:</span> ${text}`;
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ══════════════════════════════════
//  3D d6 Roll Animation
// ══════════════════════════════════

let isRolling = false;

function rollUniversalDie3D(sides, modifier = 0) {
    if (typeof rollThreeJSDice !== 'function') return;

    const btn = document.querySelector('.die-btn.active-die');
    const resultEl = document.getElementById('diceResultText');

    // Generate result first
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;

    if (btn) btn.disabled = true;

    // Call our new Three.js logic
    rollThreeJSDice(sides, result, () => {
        // This callback runs when animation finishes

        if (resultEl) {
            let label = `d${sides} = ${result}`;
            if (modifier !== 0) label = `d${sides}${modifier > 0 ? '+' : ''}${modifier} = ${total}`;
            resultEl.textContent = label;

            // Special coloring
            if (result === sides) {
                resultEl.style.color = '#FFD700';
                resultEl.style.textShadow = '0 0 20px rgba(255,215,0,0.8)';
            } else if (result === 1) {
                resultEl.style.color = '#c0392b';
                resultEl.style.textShadow = '0 0 20px rgba(192,57,43,0.6)';
            } else {
                resultEl.style.color = 'var(--color-gold)';
                resultEl.style.textShadow = 'none';
            }
        }

        // Dice history
        const hist = document.getElementById('diceHistory');
        if (hist) {
            const entry = modifier !== 0 ? `d${sides}+${modifier}=${total}` : `d${sides}=${result}`;
            hist.textContent = entry + (hist.textContent ? ' | ' + hist.textContent.substring(0, 50) : '');
        }

        // Roll notification
        const special = result === sides ? '🎉 Max Roll!' : result === 1 ? '💀 Min Roll!' : `d${sides} = ${result}`;
        showRollNotification(result, special);

        // Add to chat
        const chatMsg = result === sides
            ? `🎲 <strong>Max Roll! d${sides} = ${sides}</strong>${modifier !== 0 ? ` (+${modifier} = ${total})` : ''}`
            : `🎲 Rolled d${sides} = ${result}${modifier !== 0 ? ` (+${modifier} = ${total})` : ''}`;
        addChatMsg('', chatMsg, 'dice');

        if (btn) btn.disabled = false;
    });
}

// ══════════════════════════════════
//  Generic dice roller (non-d6)
// ══════════════════════════════════

function rollDice(sides, count = 1, modifier = 0) {
    let total = 0;
    const rolls = [];
    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        total += r;
    }
    total += modifier;

    const isNat20 = sides === 20 && count === 1 && rolls[0] === 20;
    const isNat1 = sides === 20 && count === 1 && rolls[0] === 1;

    let label = `${count}d${sides}`;
    if (modifier !== 0) label += (modifier > 0 ? '+' : '') + modifier;
    label += ` = ${total}`;

    // Update result display
    const resultEl = document.getElementById('diceResultText');
    if (resultEl) {
        resultEl.textContent = total;
        resultEl.style.color = isNat20 ? '#FFD700' : isNat1 ? '#c0392b' : 'var(--color-gold)';
        resultEl.style.textShadow = 'none';
    }

    // Dice history
    const hist = document.getElementById('diceHistory');
    if (hist) {
        hist.textContent = label + (hist.textContent ? ' | ' + hist.textContent : '');
        hist.textContent = hist.textContent.substring(0, 80);
    }

    // Notification
    const notifLabel = isNat20 ? '🎉 Natural 20!' : isNat1 ? '💀 Natural 1' : label;
    showRollNotification(total, notifLabel);

    // Chat
    const msg = isNat20
        ? `🎲 <strong>Natural 20!</strong> (${label})`
        : `🎲 Rolled ${label}`;
    addChatMsg('', msg, 'dice');
}

function showRollNotification(num, label) {
    const notif = document.getElementById('rollNotif');
    if (!notif) return;
    document.getElementById('rollNum').textContent = num;
    document.getElementById('rollLabel').textContent = label;
    notif.style.display = 'block';
    notif.style.animation = 'none';
    void notif.offsetWidth;
    notif.style.animation = 'rollNotifIn 0.4s cubic-bezier(0.34,1.56,0.64,1), rollNotifOut 0.4s ease 2.5s forwards';
    setTimeout(() => { notif.style.display = 'none'; }, 3000);
}

function useAction(actionName) {
    addChatMsg('You', `uses <strong>${actionName}</strong>!`, 'self');
    showRollNotification('⚔', actionName);
    if (actionName === 'Attack') {
        setTimeout(() => rollDice(20, 1, 5), 500);
    }
}