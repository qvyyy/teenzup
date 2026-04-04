/**
 * TeenzUp Core Engine (app.js)
 * Handles View Routing, Visual Backgrounds, and Initialization.
 */

// Global State
window.currentView = 'home';

// --- Visual Background Engine (Nebula V3) ---
function initNebula() {
    const container = document.getElementById('ambient-container');
    if (!container) return;
    
    // Create 12 random glow balls (4-12 range)
    for (let i = 0; i < 12; i++) {
        createGlowBall(container);
    }
}

function createGlowBall(container) {
    const ball = document.createElement('div');
    ball.className = 'glow-ball';
    
    // Random position
    ball.style.top = Math.random() * 100 + "%";
    ball.style.left = Math.random() * 100 + "%";
    
    // Random size
    const size = 150 + Math.random() * 250;
    ball.style.width = size + "px";
    ball.style.height = size + "px";
    
    // Random duration (15s - 25s)
    const duration = 15000 + Math.random() * 10000;
    ball.style.animationDuration = duration + "ms";
    
    // Random initial delay so they don't all start at once
    ball.style.animationDelay = Math.random() * 10000 + "ms";
    
    container.appendChild(ball);
    
    // Periodically reposition the ball after it fades out (1 cycle)
    // Add 600ms buffer to ensure it's fully transparent
    setInterval(() => {
        ball.style.top = Math.random() * 100 + "%";
        ball.style.left = Math.random() * 100 + "%";
    }, duration + 600);
}

function initStarfield() {
    const sf = document.getElementById('starfield');
    if (!sf) return;
    for(let i=0; i<120; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.width = (Math.random() * 2 + 1) + 'px';
        s.style.height = s.style.width;
        s.style.setProperty('--d', (Math.random() * 3 + 2) + 's');
        sf.appendChild(s);
    }
}

// --- View Engine (Router) ---
function showView(v) {
    // Hide all views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    
    // Show target view
    const target = document.getElementById(v + 'View');
    if (target) {
        target.classList.add('active');
        window.currentView = v;
    }
    
    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.view === v) el.classList.add('active');
    });

    // Trigger module-specific renders
    if (v === 'market' && typeof renderMarket === 'function') renderMarket();
    if (v === 'home' && typeof renderLeaderboards === 'function') renderLeaderboards();
    if (v === 'profile' && typeof loadProfile === 'function') loadProfile();
    
    window.scrollTo(0, 0);
}

// --- Soft Physics 3D Interaction Logic ---
function initHeroTilt() {
    const card = document.getElementById('heroCard');
    const layers = document.querySelectorAll('.parallax-layer');
    if (!card) return;

    window.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 600;

        if (dist < maxDist) {
            card.classList.add('is-tilting');
            const strength = 1 - (dist / maxDist);
            const rX = (dy / 25) * strength;
            const rY = -(dx / 25) * strength;
            
            card.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
        } else {
            resetHero();
        }
    });

    window.addEventListener('mouseleave', resetHero);

    function resetHero() {
        card.classList.remove('is-tilting');
        card.style.transform = 'rotateX(0) rotateY(0)';
    }
}

function enterNetwork() {
    const g1 = document.getElementById('g1').checked;
    const g2 = document.getElementById('g2').checked;
    const g3 = document.getElementById('g3').checked;
    
    if(!g1 || !g2 || !g3) {
        return alert("ACCESS DENIED: You must accept all data protection protocols to enter the TeenzUp network.");
    }
    
    document.getElementById('gdprGuard').style.display = 'none';
    // Persistent Consent
    localStorage.setItem('teenzup_gdpr_accepted', 'true');
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initNebula();
    initHeroTilt();
    
    // Global exposure for HTML onclicks
    window.showView = showView;
    window.enterNetwork = enterNetwork;
    
    // Persistent GDPR Check
    const isAccepted = localStorage.getItem('teenzup_gdpr_accepted');
    if (isAccepted === 'true') {
        const guard = document.getElementById('gdprGuard');
        if (guard) guard.style.display = 'none';
    }

    // Landing View (will be blurred/blocked by GDPR Guard if not accepted)
    showView('home');
});
