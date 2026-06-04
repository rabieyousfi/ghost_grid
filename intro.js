/**
 * Ghost Grid — Animated Intro Controller
 * Full cinematic boot sequence with:
 *  - Animated grid canvas background
 *  - Glitching title reveal
 *  - Module loading sequence with status messages
 *  - Smooth exit transition into main site
 */

(function () {
    'use strict';

    /* ============================================================
       CONFIG
    ============================================================ */
    const TOTAL_DURATION_MS = 3800; // Total intro length in ms
    const MODULES = [
        { id: 'n1', label: 'WEB_SYSTEMS',   status: 'LOADING WEB SYSTEMS...',    pct: 25  },
        { id: 'n2', label: 'DESIGN_CORE',   status: 'INITIALIZING DESIGN CORE...', pct: 50 },
        { id: 'n3', label: 'MOTION_ENGINE', status: 'ENGAGING MOTION ENGINE...',   pct: 75  },
        { id: 'n4', label: 'GRID_ONLINE',   status: 'GHOST GRID ONLINE.',          pct: 100 },
    ];

    /* ============================================================
       ELEMENTS
    ============================================================ */
    const overlay    = document.getElementById('intro-overlay');
    const fill       = document.getElementById('intro-fill');
    const pctEl      = document.getElementById('intro-pct');
    const statusMsg  = document.getElementById('intro-status-msg');
    const clockEl    = document.getElementById('intro-clock');
    const canvas     = document.getElementById('intro-canvas');
    const ctx        = canvas.getContext('2d');

    if (!overlay) return; // Guard if DOM not ready

    /* ============================================================
       LOCK BODY SCROLL & RESET POSITION
    ============================================================ */
    document.body.classList.add('intro-active');
    // Prevent any scroll drift before and during intro
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'auto';

    /* ============================================================
       LIVE CLOCK
    ============================================================ */
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
    }
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    /* ============================================================
       CANVAS GRID + PARTICLES
    ============================================================ */
    let W, H, particles = [], animFrame;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* Grid parameters */
    const GRID_SIZE   = 60;
    const GRID_COLOR  = 'rgba(0, 240, 255, 0.04)';
    const ACCENT_COL  = 'rgba(217, 0, 255, 0.025)';

    /* Particle pool */
    function spawnParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.8 - 0.2,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.2,
            color: Math.random() > 0.6 ? '#d900ff' : '#00f0ff',
            life: 1,
            decay: Math.random() * 0.004 + 0.002,
        };
    }

    for (let i = 0; i < 80; i++) particles.push(spawnParticle());

    /* Horizontal sweep line */
    let sweepY = 0;

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);

        /* === Perspective grid === */
        ctx.lineWidth = 0.5;

        // Vertical lines
        ctx.strokeStyle = GRID_COLOR;
        for (let x = 0; x <= W; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        // Horizontal lines
        for (let y = 0; y <= H; y += GRID_SIZE) {
            ctx.strokeStyle = (Math.floor(y / GRID_SIZE) % 4 === 0) ? 'rgba(0,240,255,0.07)' : GRID_COLOR;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Diagonal accent lines
        ctx.strokeStyle = ACCENT_COL;
        ctx.lineWidth = 0.3;
        for (let d = -H; d < W + H; d += GRID_SIZE * 3) {
            ctx.beginPath();
            ctx.moveTo(d, 0);
            ctx.lineTo(d + H, H);
            ctx.stroke();
        }

        /* === Sweep line === */
        sweepY = (sweepY + 0.8) % H;
        const grad = ctx.createLinearGradient(0, sweepY - 40, 0, sweepY + 40);
        grad.addColorStop(0,   'transparent');
        grad.addColorStop(0.5, 'rgba(0,240,255,0.12)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, sweepY - 40, W, 80);

        /* === Particles === */
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0 || p.y < -10) {
                particles[i] = spawnParticle();
                particles[i].y = H + 5;
                return;
            }

            ctx.globalAlpha = p.alpha * p.life;
            ctx.fillStyle   = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur  = 0;
            ctx.globalAlpha = 1;
        });

        animFrame = requestAnimationFrame(drawFrame);
    }

    drawFrame();

    /* ============================================================
       ADD SKIP BUTTON
    ============================================================ */
    const skipBtn = document.createElement('div');
    skipBtn.className = 'intro-skip';
    skipBtn.textContent = '[ SKIP ]';
    overlay.appendChild(skipBtn);
    skipBtn.addEventListener('click', () => exitIntro(true));

    /* ============================================================
       LOADER SEQUENCE
    ============================================================ */
    let currentPct = 0;
    let targetPct  = 0;
    let pctRaf;

    function animatePct() {
        if (currentPct < targetPct) {
            currentPct = Math.min(currentPct + 0.8, targetPct);
            fill.style.width = currentPct + '%';
            pctEl.textContent = Math.floor(currentPct) + '%';
            pctRaf = requestAnimationFrame(animatePct);
        }
    }

    function activateModule(idx) {
        // Deactivate previous
        if (idx > 0) {
            const prev = document.getElementById(MODULES[idx - 1].id);
            if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
        }
        const mod = MODULES[idx];
        const el  = document.getElementById(mod.id);
        if (el) el.classList.add('active');

        statusMsg.textContent = mod.status;
        targetPct = mod.pct;
        cancelAnimationFrame(pctRaf);
        animatePct();
    }

    /* Schedule module activations spread over TOTAL_DURATION_MS */
    const moduleDelay = TOTAL_DURATION_MS / (MODULES.length + 1);
    MODULES.forEach((_, idx) => {
        setTimeout(() => activateModule(idx), (idx + 1) * moduleDelay);
    });

    /* Exit after full duration */
    setTimeout(() => exitIntro(false), TOTAL_DURATION_MS + 400);

    /* ============================================================
       EXIT SEQUENCE
    ============================================================ */
    function exitIntro(immediate) {
        // Flash burst effect
        const flash = document.createElement('div');
        flash.className = 'intro-flash';
        overlay.appendChild(flash);

        const delay = immediate ? 50 : 300;
        setTimeout(() => {
            // Mark all modules done
            MODULES.forEach(m => {
                const el = document.getElementById(m.id);
                if (el) { el.classList.remove('active'); el.classList.add('done'); }
            });
            fill.style.width = '100%';
            pctEl.textContent = '100%';
            statusMsg.textContent = 'GHOST GRID ONLINE.';

            overlay.classList.add('intro-exit');

            // After CSS transition completes, remove overlay entirely
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
                cancelAnimationFrame(animFrame);
                clearInterval(clockInterval);
                document.body.classList.remove('intro-active');
                // Always land at the very top after intro
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                // Restore smooth scrolling for the site navigation
                document.documentElement.style.scrollBehavior = '';
            }, { once: true });
        }, delay);
    }

})();
