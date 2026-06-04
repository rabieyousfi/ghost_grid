/**
 * Ghost Grid — Main Application Script
 * Handles: custom cursor, nav scroll, typing effect,
 *          grid canvas, portfolio filter, terminal comms
 */

(function () {
    'use strict';

    /* ============================================================
       CUSTOM CURSOR
    ============================================================ */
    const cursor    = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');

    let mouseX = 0, mouseY = 0;
    let dotX   = 0, dotY   = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot snaps immediately
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
    });

    // Ring follows with a slight lag
    function animateCursor() {
        dotX += (mouseX - dotX) * 0.12;
        dotY += (mouseY - dotY) * 0.12;
        cursor.style.left = dotX + 'px';
        cursor.style.top  = dotY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll(
        'a, button, .filter-btn, .service-card, .portfolio-item, .channel-item, .terminal-input'
    );
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    /* ============================================================
       HEADER SCROLL STATE
    ============================================================ */
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    /* ============================================================
       TYPING / TAGLINE EFFECT
    ============================================================ */
    const typingEl = document.getElementById('typing-text');
    if (typingEl) {
        const phrases = [
            'DESIGNING THE FUTURE',
            'BUILDING THE GRID',
            'MOTION IN THE DARK',
            'BRANDING THE UNKNOWN',
        ];
        let pi = 0, ci = 0, deleting = false;

        function type() {
            const phrase = phrases[pi];
            if (!deleting) {
                typingEl.textContent = phrase.slice(0, ++ci);
                if (ci === phrase.length) {
                    deleting = true;
                    setTimeout(type, 1800);
                    return;
                }
            } else {
                typingEl.textContent = phrase.slice(0, --ci);
                if (ci === 0) {
                    deleting = false;
                    pi = (pi + 1) % phrases.length;
                }
            }
            setTimeout(type, deleting ? 45 : 80);
        }
        setTimeout(type, 1200);
    }

    /* ============================================================
       BACKGROUND GRID CANVAS
    ============================================================ */
    const gridCanvas = document.getElementById('grid-canvas');
    if (gridCanvas) {
        const gc = gridCanvas.getContext('2d');
        let gW, gH, gOffset = 0;

        function resizeGrid() {
            gW = gridCanvas.width  = gridCanvas.offsetWidth;
            gH = gridCanvas.height = gridCanvas.offsetHeight;
        }
        resizeGrid();
        window.addEventListener('resize', resizeGrid, { passive: true });

        function drawGrid() {
            gc.clearRect(0, 0, gW, gH);
            const SIZE  = 50;
            const COLOR = 'rgba(0,240,255,0.04)';
            gc.strokeStyle = COLOR;
            gc.lineWidth   = 0.5;

            // Vertical
            for (let x = 0; x <= gW; x += SIZE) {
                gc.beginPath(); gc.moveTo(x, 0); gc.lineTo(x, gH); gc.stroke();
            }
            // Horizontal (with slow drift)
            const offset = gOffset % SIZE;
            for (let y = -SIZE + offset; y <= gH; y += SIZE) {
                gc.beginPath(); gc.moveTo(0, y); gc.lineTo(gW, y); gc.stroke();
            }
            gOffset += 0.3;
            requestAnimationFrame(drawGrid);
        }
        drawGrid();
    }

    /* ============================================================
       PORTFOLIO FILTER
    ============================================================ */
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            portfolioItems.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity    = match ? '1' : '0.15';
                item.style.transform  = match ? 'scale(1)' : 'scale(0.96)';
                item.style.pointerEvents = match ? '' : 'none';
            });
        });
    });

    /* ============================================================
       SCROLL-IN ANIMATIONS (Intersection Observer)
    ============================================================ */
    const animEls = document.querySelectorAll('.service-card, .portfolio-item, .section-header');
    animEls.forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    animEls.forEach(el => observer.observe(el));

    /* ============================================================
       CYBER TERMINAL COMMS
    ============================================================ */
    const termInput  = document.getElementById('terminal-input');
    const termLog    = document.getElementById('terminal-log-output');
    const termBody   = document.getElementById('terminal-body');

    if (termInput && termLog) {
        const BOOT_LINES = [
            '> Ghost Grid Secure Comms v2.10',
            '> Encryption: AES-512 active.',
            '> Type your message and press ENTER.',
            '> Available commands: name, email, message, send, clear',
            '─'.repeat(42),
        ];

        let state = { name: '', email: '', message: '' };
        let step  = 'name';

        function log(text, color) {
            const line = document.createElement('div');
            line.textContent = text;
            line.style.color = color || '#a4b4e3';
            line.style.marginBottom = '4px';
            termLog.appendChild(line);
            termBody.scrollTop = termBody.scrollHeight;
        }

        function prompt(text) {
            log('> ' + text, '#00f0ff');
        }

        // Boot sequence
        let delay = 0;
        BOOT_LINES.forEach((line, i) => {
            setTimeout(() => log(line, i === 0 ? '#00f0ff' : undefined), delay);
            delay += 180;
        });
        setTimeout(() => prompt('Enter operative name:'), delay);

        termInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const val = termInput.value.trim();
            termInput.value = '';
            if (!val) return;

            log('» ' + val, '#d900ff');

            if (val.toLowerCase() === 'clear') {
                termLog.innerHTML = '';
                state = { name: '', email: '', message: '' };
                step = 'name';
                prompt('Enter operative name:');
                return;
            }

            switch (step) {
                case 'name':
                    state.name = val;
                    step = 'email';
                    prompt('Enter comms frequency (email):');
                    break;
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                        log('⚠ Invalid frequency. Re-enter:', '#ffbd2e');
                    } else {
                        state.email = val;
                        step = 'message';
                        prompt('Transmit your message:');
                    }
                    break;
                case 'message':
                    state.message = val;
                    step = 'confirm';
                    log('─'.repeat(42));
                    log(`  NAME   : ${state.name}`);
                    log(`  EMAIL  : ${state.email}`);
                    log(`  MSG    : ${state.message}`);
                    log('─'.repeat(42));
                    prompt('Type "send" to transmit or "clear" to reset:');
                    break;
                case 'confirm':
                    if (val.toLowerCase() === 'send') {
                        log('⟳ Encrypting payload...', '#ffbd2e');
                        setTimeout(() => {
                            log('✓ Signal transmitted. Ghost Grid will respond.', '#27c93f');
                            log('─'.repeat(42));
                            state = { name: '', email: '', message: '' };
                            step = 'name';
                            setTimeout(() => prompt('Enter operative name:'), 800);
                        }, 900);
                    } else {
                        prompt('Type "send" to transmit or "clear" to reset:');
                    }
                    break;
            }
        });
    }

})();
