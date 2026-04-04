/**
 * TeenzUp Authentication Module (auth.js)
 * Handles Signups (16+ Age Gate), Login, Profile Management, and Persistence.
 */

// Global User State
window.user = JSON.parse(localStorage.getItem('inf_u_v2')) || null;

// --- Auth Toggle Login/Signup ---
function toggleAuth(isLogin) {
    const lForm = document.getElementById('loginForm');
    const sForm = document.getElementById('signupForm');
    if (lForm && sForm) {
        lForm.style.display = isLogin ? 'block' : 'none';
        sForm.style.display = isLogin ? 'none' : 'block';
    }
}

// --- Authenticate ---
function login() {
    const u = document.getElementById('lUser').value || 'User';
    const p = document.getElementById('lPass').value;
    
    if (!u || u.length < 3) return alert("PROTOCOL ERROR: Valid Expert ID or Email required.");
    
    if (u === 'TeenzUpAdmin' && p === 'nigger') {
        window.user = { username: 'TeenzUpAdmin', role: 'admin' };
        window.location.href = 'dashboard.html';
    } else {
        // Support for email-based login (mock)
        const username = u.includes('@') ? u.split('@')[0] : u;
        window.user = { username: username, role: 'member', email: u.includes('@') ? u : `${u.toLowerCase()}@teenzup.com`, bio: '', avatar: '' };
    }
    
    saveUser();
    updateUI();
    window.showView('home');
}

// --- Registration (16+ Gate) ---
function signup() {
    const bInput = document.getElementById('sB').value;
    if (!bInput) return alert("Birthday Protocol Required.");
    
    const birth = new Date(bInput);
    const age = Math.floor((new Date() - birth) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < 16) {
        return alert("ACCESS BLOCKED: TeenzUp requires members to be 16 or older.");
    }
    
    if (document.getElementById('sP1').value !== document.getElementById('sP2').value) {
        return alert("CREDENTIAL ERROR: Passwords do not match.");
    }
    
    window.user = { 
        username: document.getElementById('sU').value, 
        fName: document.getElementById('sF').value, 
        role: 'member', 
        email: document.getElementById('sE').value, 
        phone: document.getElementById('sPhone').value,
        bio: '', 
        avatar: '' 
    };
    
    saveUser();
    updateUI();
    window.showView('home');
}

// --- Logout ---
function logout() {
    window.user = null;
    localStorage.removeItem('inf_u_v2');
    updateUI();
    window.showView('home');
    const m = document.getElementById('mobileMenu');
    if (m) m.classList.remove('active');
    location.reload(); // Reset protocol session
}

// --- Persistence & UI Update ---
function saveUser() {
    localStorage.setItem('inf_u_v2', JSON.stringify(window.user));
}

function updateUI() {
    const zone = document.getElementById('authZone');
    const mZone = document.getElementById('mAuthZone');
    if (!zone || !mZone) return;
    
    if (window.user) {
        const content = `
            <div class="user-pill-container" style="display:flex; align-items:center; gap:12px;">
                <div class="profile-pill">
                    <span style="font-weight:700;">${window.user.username}</span>
                    <div class="p-avatar" style="${window.user.avatar ? `background-image:url(${window.user.avatar});` : ''}">${window.user.avatar ? '' : window.user.username[0]}</div>
                </div>
                <div class="dropdown">
                    ${window.user.role === 'member' ? '<button class="drop-item" onclick="showSellerApp()">Become a Seller</button>' : ''}
                    <button class="drop-item" onclick="window.showView('profile')">Profile Settings</button>
                    ${window.user.role === 'seller' ? `<button class="drop-item" style="color:var(--primary);" onclick="showMySellerProfile()">My Seller Profile</button>` : ''}
                    <div style="border-top:1px solid rgba(255,255,255,0.05); margin:4px 0;"></div>
                    <button class="drop-item" style="color:#FF4477;" onclick="logout()">Log Out</button>
                </div>
            </div>
        `;
        zone.innerHTML = content;
        mZone.innerHTML = content;
    } else {
        const loginBtn = `<button onclick="window.showView('auth')" class="nav-item" style="color: #FFF; font-weight: 810;">Log In</button>`;
        zone.innerHTML = loginBtn;
        mZone.innerHTML = loginBtn;
    }
}

// --- Profile Settings ---
function loadProfile() {
    if (!window.user) return;
    document.getElementById('pEmail').value = window.user.email || '';
    document.getElementById('pBio').value = window.user.bio || '';
    document.getElementById('pPortfolio').value = window.user.portfolio_link || '';
    // File inputs cannot have their value set programmatically for security reasons.
}

async function saveProfile() {
    if (!window.user) return;
    
    const picFile = document.getElementById('pPic').files[0];
    const bannerFile = document.getElementById('pBanner').files[0];
    
    if (picFile) {
        window.user.avatar = await new Promise(r => {
            const reader = new FileReader();
            reader.onload = e => r(e.target.result);
            reader.readAsDataURL(picFile);
        });
    }
    
    if (bannerFile) {
        window.user.banner = await new Promise(r => {
            const reader = new FileReader();
            reader.onload = e => r(e.target.result);
            reader.readAsDataURL(bannerFile);
        });
    }

    window.user.email = document.getElementById('pEmail').value;
    window.user.phone = document.getElementById('pPhone').value;
    window.user.bio = document.getElementById('pBio').value;
    window.user.portfolio_link = document.getElementById('pPortfolio').value;
    
    const newPass = document.getElementById('pPass').value;
    if (newPass) window.user.password = newPass;

    saveUser();
    updateUI();
    alert("Expert Identity Synchronized.");
}

function showSellerApp() {
    const m = document.getElementById('offerModal');
    const content = document.getElementById('mContent');
    if (!m || !content) return;
    
    // Step 1: Agreements
    content.innerHTML = `
        <h1 style="font-family:'Syne'; margin-bottom:16px;">Become a Seller</h1>
        <p style="color:var(--text-muted); margin-bottom:24px;">To join the Expert network, you must verify your identity and set up a payout method.</p>
        
        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; margin-bottom:24px; border:1px solid var(--border);">
            <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:16px;">
                <input type="checkbox" id="agreeId" style="margin-top:4px;">
                <label for="agreeId" style="font-size:13px; color:var(--text-muted);">I agree to provide a valid ID for verification (Passport/European ID).</label>
            </div>
            <div style="display:flex; align-items:flex-start; gap:12px;">
                <input type="checkbox" id="agreePay" style="margin-top:4px;">
                <label for="agreePay" style="font-size:13px; color:var(--text-muted);">I consent to TeenzUp terms for payment processing and escrow handling.</label>
            </div>
        </div>
        
        <div class="input-group">
            <label class="label">Preferred Payout Method</label>
            <select id="payoutMethod" class="input">
                <option value="bank">Bank Transfer (IBAN)</option>
                <option value="revolut">Revolut</option>
                <option value="paypal">PayPal</option>
            </select>
        </div>
        
        <button class="buy-btn" onclick="sellerAppStep2()">CONTINUE TO APPLICATION</button>
        <button onclick="document.getElementById('offerModal').style.display='none'" style="display:block; width:100%; margin-top:12px; font-weight:800; color:var(--text-muted);">CANCEL</button>
    `;
    m.style.display = 'flex';
}

function sellerAppStep2() {
    if (!document.getElementById('agreeId').checked || !document.getElementById('agreePay').checked) {
        return alert("You must agree to the terms to continue.");
    }
    
    const payout = document.getElementById('payoutMethod').value;
    const content = document.getElementById('mContent');
    
    content.innerHTML = `
        <h1 style="font-family:'Syne'; margin-bottom:16px;">Professional Profile</h1>
        
        <div class="input-group">
            <label class="label">Identity Proof (Photo/Scan)</label>
            <input type="file" id="idFile" class="input" style="padding:10px;">
        </div>
        
        <div class="input-group">
            <label class="label">Why do you want to be a seller?</label>
            <textarea id="sellerWhy" class="input" style="height:60px;" placeholder="Describe your passion and expertise..."></textarea>
        </div>
        
        <div class="input-group">
            <label class="label">What digital services can you provide?</label>
            <textarea id="sellerWhat" class="input" style="height:60px;" placeholder="Coding, Design, SEO, etc."></textarea>
        </div>
        
        <div class="input-group">
            <label class="label">Portfolio or Sample Work Link</label>
            <input type="text" id="sellerPortfolio" class="input" placeholder="https://behance.net/yourname">
        </div>
        
        <button class="buy-btn" onclick="submitSellerApp('${payout}')">SUBMIT APPLICATION</button>
        <button onclick="showSellerApp()" style="display:block; width:100%; margin-top:12px; font-weight:800; color:var(--text-muted);">BACK</button>
    `;
}

function submitSellerApp(payout) {
    const why = document.getElementById('sellerWhy').value;
    const what = document.getElementById('sellerWhat').value;
    const port = document.getElementById('sellerPortfolio').value;
    
    if(!why || !what) return alert("Please fill in your application details.");
    
    const app = {
        userId: user.username,
        payout,
        why,
        what,
        portfolio: port,
        status: 'pending',
        timestamp: Date.now()
    };
    
    let apps = JSON.parse(localStorage.getItem('teenzup_seller_apps')) || [];
    apps.push(app);
    localStorage.setItem('teenzup_seller_apps', JSON.stringify(apps));
    
    document.getElementById('offerModal').style.display = 'none';
    alert("Application sent to Admin Dashboard. You will be notified upon verification!");
}

window.showSellerApp = showSellerApp;
window.sellerAppStep2 = sellerAppStep2;
window.submitSellerApp = submitSellerApp;

// Global exposure
window.toggleAuth = toggleAuth;
window.login = login;
window.signup = signup;
window.logout = logout;
window.saveProfile = saveProfile;
window.updateUI = updateUI;
window.loadProfile = loadProfile;

// Global listener
window.addEventListener('DOMContentLoaded', () => {
    updateUI();
});
