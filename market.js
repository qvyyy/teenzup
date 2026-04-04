/**
 * TeenzUp Marketplace Engine (market.js)
 */

// Global State
let offers = [];
let currentCategory = 'ALL';
let currentSearch = '';
let currentSort = 'none';
let customOffers = JSON.parse(localStorage.getItem('teenzup_custom_offers')) || [];

function generateData() {
    const mockCats = ["CODING", "DESIGN", "VIDEO", "UI/UX", "WRITING", "AUDIO", "MOTION", "SOCIAL", "TRANSLATION", "3D", "NFT", "COACHING"];
    
    const mockSellers = ["CodeRider", "PixelGhost", "VlogGen", "Arty", "HexNode"];
    
    offers = [];
    for(let i=0; i<24; i++) {
        const recent24hSales = Math.floor(Math.random() * 12);
        const totalSales = 10 + Math.floor(Math.random() * 200);
        
        offers.push({ 
            id: i, 
            title: `Expert Protocol ${String.fromCharCode(65+i)}`, 
            seller: mockSellers[i % mockSellers.length],
            price: 50 + (i * 15), 
            cat: mockCats[i % mockCats.length], 
            desc: "Professional digital deliverable optimized for high-end results.",
            rating: (4.7 + (Math.random() * 0.3)).toFixed(1), 
            delivery: "2-3 Days", 
            sales: totalSales,
            recentSales24h: recent24hSales,
            isPremium: (i % 7 === 0), 
            hasStreak: recent24hSales >= 3,
            timestamp: Date.now() - (i * 3600000) // Each one hour older
        });
    }
    // Mix in custom user-created offers
    offers = [...customOffers, ...offers];
}

function handleSearch() {
    currentSearch = document.getElementById('marketSearch').value.toLowerCase();
    renderMarket();
}

function handleSort() {
    currentSort = document.getElementById('marketSort').value;
    renderMarket();
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.pill').forEach(p => {
        p.classList.remove('active');
        // Simple text match or data-cat attribute
        if (p.innerText.includes(cat) || (cat === 'ALL' && p.innerText === 'ALL')) p.classList.add('active');
    });
    renderMarket();
}

function renderMarket() {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;
    
    // 1. Filter
    let filtered = offers.filter(o => {
        const matchesCat = (currentCategory === 'ALL' || o.cat === currentCategory);
        const matchesSearch = (o.title.toLowerCase().includes(currentSearch) || o.cat.toLowerCase().includes(currentSearch));
        return matchesCat && matchesSearch;
    });

    // 2. Sort Logic (8 Protocols)
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'price-high': return b.price - a.price; 
            case 'price-low': return a.price - b.price;  
            case 'popular': return b.sales - a.sales;     
            case 'unpopular': return a.sales - b.sales;   
            case 'newest': return b.timestamp - a.timestamp; 
            case 'oldest': return a.timestamp - b.timestamp; 
            case 'rating': return b.rating - a.rating;        
            case 'latency': return parseInt(a.delivery) - parseInt(b.delivery); 
            case 'none': return 0; // Natural order
            default: return 0;
        }
    });

    // Toggle button visibility based on role - REMOVED, button is always visible now

    // Final Protocol Ranking: 1. Premium Priority | 2. Pulse/Streak Volume | 3. Base Sort
    filtered.sort((a, b) => {
        if (a.isPremium !== b.isPremium) return b.isPremium ? 1 : -1;
        if ((b.recentSales24h || 0) !== (a.recentSales24h || 0)) return (b.recentSales24h || 0) - (a.recentSales24h || 0);
        return 0;
    });

    grid.innerHTML = filtered.map(o => `
        <div class="offer-card ${o.isPremium ? 'premium' : ''}">
            ${o.isPremium ? '<div class="premium-star" title="Premium Expert Protocol Active">★</div>' : ''}
            ${o.hasStreak ? `<div class="hot-streak" title="This ad sold ${o.recentSales24h} times in the last 24h">🔥 ${o.recentSales24h} streak</div>` : ''}
            <div class="card-visual" onclick="window.openOffer(${o.id})" style="${o.img ? `background-image:url(${o.img}); background-size:cover; background-position:center;` : ''}">
                <div class="visual-patt"></div>
                ${o.img ? '' : 'Digital Protocol'}
            </div>
            <div class="card-body">
                <div class="card-meta"><span>${o.cat}</span><span style="color:var(--primary); font-weight:800;">★ ${o.rating}</span></div>
                <h3 class="card-title" onclick="window.openOffer(${o.id})">${o.title}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="card-price">€ ${o.price}</div>
                    <div style="font-size:11px; color:var(--primary); font-weight:800; cursor:pointer;" onclick="showSellerProfileModal('${o.seller || 'Expert'}')">VIEW EXPERT</div>
                </div>
            </div>
        </div>
    `).join('');
}

function openOffer(id) {
    const o = offers.find(x => x.id === id);
    if (!o) return;
    const m = document.getElementById('offerModal');
    const content = document.getElementById('mContent');
    if (!m || !content) return;
    
    document.querySelector('.modal-card').classList.remove('large');
    
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px;">
            <h1 style="color:var(--primary); font-size:32px; line-height:1.1;">${o.title}</h1>
            <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:16px; border:1px solid var(--border); min-width:200px; cursor:pointer;" onclick="showSellerProfileModal('${o.seller || 'Expert'}')">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">${(o.seller || 'E')[0]}</div>
                    <div>
                        <div style="font-size:11px; font-weight:800; color:var(--primary); letter-spacing:1px;">VERIFIED EXPERT</div>
                        <div style="font-weight:700; color:#FFF;">${o.seller || 'Expert'}</div>
                    </div>
                </div>
                <div style="margin-top:12px; font-size:12px; color:var(--text-muted);">★ ${o.rating} (42 reviews)</div>
            </div>
        </div>
        
        <p style="color:var(--text-muted); margin-top:16px; line-height:1.6; font-size:15px;">${o.desc || 'Vetted digital expertise. Secure Euro-denominated protocol active.'}</p>
        <div class="m-grid">
            <div class="m-stat"><div class="label">Competence</div><div style="font-weight:800; font-size:18px;">★ ${o.rating}</div></div>
            <div class="m-stat"><div class="label">Latency</div><div style="font-weight:800; font-size:18px;">${o.delivery}</div></div>
            <div class="m-stat"><div class="label">Volume</div><div style="font-weight:800; font-size:18px;">${o.sales} Purchases</div></div>
            <div class="m-stat"><div class="label">Valuation</div><div style="font-weight:800; font-size:18px; color:var(--primary);">€ ${o.price}</div></div>
        </div>
        <div style="margin-top:32px; display:flex; gap:16px;">
            <button class="buy-btn" onclick="buyProduct(${o.id})">BUY NOW</button>
            <button onclick="document.getElementById('offerModal').style.display='none'" style="font-weight:800; color:var(--text-muted); padding:0 24px;">CLOSE</button>
        </div>
    `;
    m.style.display = 'flex';
}

function buyProduct(id) {
    if (!window.user) {
        alert("Please log in to purchase this protocol.");
        window.showView('auth');
        return;
    }
    const o = offers.find(x => x.id === id);
    if (!o) return;
    
    let purchases = JSON.parse(localStorage.getItem('teenzup_purchases')) || [];
    purchases.push({ userId: window.user.username, seller: o.seller, offerId: id, timestamp: Date.now() });
    localStorage.setItem('teenzup_purchases', JSON.stringify(purchases));
    
    alert(`TRANSACTION INITIALIZED: ${o.title} has been linked to your Identity ID.`);
    document.getElementById('offerModal').style.display = 'none';
}

function renderLeaderboards() {
    const sBoard = document.getElementById('sellerBoard');
    const bBoard = document.getElementById('buyerBoard');
    if (!sBoard || !bBoard) return;
    
    const sellers = [{n:"CodeRider", s:152}, {n:"PixelGhost", s:120}, {n:"VlogGen", s:98}, {n:"Arty", s:74}, {n:"HexNode", s:60}];
    const buyers = [{n:"SkyNet_Labs", s:66}, {n:"WebFlow_HQ", s:54}, {n:"Creative_X", s:42}, {n:"Node_Group", s:30}, {n:"TeenzHub", s:18}];
    
    sBoard.innerHTML = sellers.map((s,i) => `
        <div class="board-row"><span class="rank">#${i+1}</span><b>${s.n}</b><span>${s.s} Sales</span></div>
    `).join('');
    
    bBoard.innerHTML = buyers.map((b,i) => `
        <div class="board-row"><span class="rank">#${i+1}</span><b>${b.n}</b><span>${b.s} Purchases</span></div>
    `).join('');
}

// Exposure
window.openOffer = openOffer;
window.renderMarket = renderMarket;
window.renderLeaderboards = renderLeaderboards;
window.handleSearch = handleSearch;
window.handleSort = handleSort;
window.setCategory = setCategory;

// Init
window.addEventListener('DOMContentLoaded', () => {
    generateData();
    if (window.currentView === 'home') renderLeaderboards();
    if (window.currentView === 'market') renderMarket();
});


function showCreateSaleForm() {
    const m = document.getElementById('offerModal');
    const content = document.getElementById('mContent');
    if (!m || !content) return;
    
    document.querySelector('.modal-card').classList.remove('large');
    
    const cats = ["CODING", "DESIGN", "VIDEO", "UI/UX", "WRITING", "AUDIO", "MOTION", "SOCIAL", "TRANSLATION", "3D", "NFT", "COACHING"];
    const catOptions = cats.map(c => `<option value="${c}">${c}</option>`).join('');

    content.innerHTML = `
        <h1 style="color:var(--primary); margin-bottom: 24px;">Create Product Listing</h1>
        <div class="input-group"><label class="label">Product Name</label><input type="text" id="listingTitle" class="input" placeholder="e.g. Professional Logo Design"></div>
        <div class="input-group"><label class="label">Category</label>
            <select id="listingCat" class="input">
                ${catOptions}
            </select>
        </div>
        <div style="display:flex; gap:16px;">
            <div class="input-group" style="flex:1;"><label class="label">Price (€)</label><input type="number" id="listingPrice" class="input" value="50"></div>
            <div class="input-group" style="flex:1;"><label class="label">Delivery Speed</label><div class="input" style="background:rgba(255,255,255,0.02); opacity:0.6;">Auto-Calculated</div></div>
        </div>
        <div class="input-group"><label class="label">Description</label><textarea id="listingDesc" class="input" style="height:80px;"></textarea></div>
        <div class="input-group">
            <label class="label">Product Image (File)</label>
            <input type="file" id="listingFile" class="input" accept="image/*" style="padding-top:10px;">
        </div>
        
        <div style="margin-top:32px; display:flex; gap:16px;">
            <button class="buy-btn" onclick="submitListing()">LAUNCH PRODUCT</button>
            <button onclick="document.getElementById('offerModal').style.display='none'" style="font-weight:800; color:var(--text-muted); padding:0 24px;">CANCEL</button>
        </div>
    `;
    m.style.display = 'flex';
}

function getLatencyEstimate(cat) {
    // Logic: Coding/3D take longer, Design/Writing are fast.
    const speeds = { "CODING": 5, "3D": 6, "NFT": 4, "VIDEO": 3, "DESIGN": 2, "UI/UX": 3, "WRITING": 2, "AUDIO": 2, "MOTION": 4, "SOCIAL": 2, "TRANSLATION": 3, "COACHING": 1 };
    let days = speeds[cat] || 3;
    
    // Bonus for high-rated experts (mock logic: Elite experts are 1 day faster)
    if (window.user && window.user.rating >= 4.8) days = Math.max(1, days - 1);
    
    return `${days} Day${days > 1 ? 's' : ''}`;
}

async function submitListing() {
    const title = document.getElementById('listingTitle').value;
    const price = parseInt(document.getElementById('listingPrice').value);
    const cat = document.getElementById('listingCat').value;
    const desc = document.getElementById('listingDesc').value;
    const fileInput = document.getElementById('listingFile');
    
    if(!title || !price) return alert("Title and Price are required.");

    let imgData = null;
    if (fileInput.files[0]) {
        imgData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }
    
    const delivery = getLatencyEstimate(cat);
    
    const newOffer = {
        id: Date.now(),
        title,
        seller: window.user ? window.user.username : "Expert",
        price,
        cat,
        desc,
        delivery: delivery,
        img: imgData,
        rating: "5.0",
        sales: 0,
        recentSales24h: 0,
        isPremium: false,
        hasStreak: false,
        timestamp: Date.now()
    };
    
    customOffers.unshift(newOffer);
    localStorage.setItem('teenzup_custom_offers', JSON.stringify(customOffers));
    
    document.getElementById('offerModal').style.display = 'none';
    generateData();
    renderMarket();
    alert(`Listing live! Auto-Delivery Protocol set to: ${delivery}`);
}

function showSellerProfileModal(name) {
    const m = document.getElementById('offerModal');
    const content = document.getElementById('mContent');
    if (!m || !content) return;

    const card = document.querySelector('.modal-card');
    card.classList.add('large');
    m.style.display = 'flex';

    // Mock fetch seller data (in real app, fetch from DB or window.user if self)
    const sellerData = {
        name: name,
        bio: "Top-tier high school expert specializing in digital production and protocol execution. Vetted by TeenzUp Quality Control.",
        rating: 4.9,
        reviews: 42,
        email: `${name.toLowerCase()}@teenzup.com`,
        banner: "", 
        pfp: "", 
        portfolio: offers.filter(o => o.seller === name).slice(0, 4)
    };

    const reviews = JSON.parse(localStorage.getItem('teenzup_reviews')) || [];
    const sellerReviews = reviews.filter(r => r.seller === name);
    
    const purchases = JSON.parse(localStorage.getItem('teenzup_purchases')) || [];
    const hasBought = window.user && purchases.some(p => p.userId === window.user.username && p.seller === name);
    const alreadyReviewed = window.user && sellerReviews.some(r => r.buyer === window.user.username);

    // Calculate dynamic rating
    let displayRating = sellerData.rating;
    if (sellerReviews.length > 0) {
        const sum = sellerReviews.reduce((a, b) => a + b.rating, 0);
        displayRating = (sum / sellerReviews.length).toFixed(1);
    }
    const starsCount = Math.round(displayRating);
    const starHTML = '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount) + ` <span style="font-size:12px; opacity:0.5;">(${sellerReviews.length + 42} Reviews)</span>`;

    content.innerHTML = `
        <div class="seller-banner" style="background-image: url(${sellerData.banner || ''}); display: flex; align-items: flex-end; padding: 24px;">
        </div>
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 40px; margin-top: -60px;">
            <div class="seller-sidebar">
                <div class="seller-pfp-large" style="background-image: url(${sellerData.pfp || ''})">${sellerData.pfp ? '' : name[0]}</div>
                <h1 style="margin-top:20px; font-size:32px;">${sellerData.name}</h1>
                <div class="seller-rating" style="margin-top:8px;">${starHTML}</div>
                <p style="color:var(--text-muted); margin-top:16px; font-size:14px; line-height:1.6;">${sellerData.bio}</p>
                
                <div style="margin-top:32px; padding-top:24px; border-top:1px solid var(--border);">
                    <div class="label">Contact Info</div>
                    <p style="font-size:14px; margin-top:8px;">${sellerData.email}</p>
                </div>
                <button class="buy-btn" style="background:var(--bg-card); border:1px solid var(--border); margin-top:32px;" onclick="document.getElementById('offerModal').style.display='none'">CLOSE PROFILE</button>
            </div>
            
            <div style="max-height: 700px; overflow-y: auto; padding-right: 20px;">
                <h2 style="margin-bottom:24px;">Portfolio</h2>
                <div class="portfolio-grid" style="margin-bottom:60px;">
                    ${sellerData.portfolio.length === 0 ? '<p style="opacity:0.5;">No items yet.</p>' : sellerData.portfolio.map(o => `
                        <div class="offer-card" onclick="window.openOffer(${o.id})">
                             <div class="card-visual"><div class="visual-patt"></div></div>
                             <div class="card-body">
                                <div class="card-meta"><span>${o.cat}</span></div>
                                <div style="font-weight:700; margin-bottom:8px;">${o.title}</div>
                                <div style="color:var(--primary); font-weight:800;">€ ${o.price}</div>
                             </div>
                        </div>
                    `).join('')}
                </div>

                <h2 style="margin-bottom:24px;">Verified Reviews</h2>
                
                ${hasBought && !alreadyReviewed ? `
                    <div style="background:rgba(168, 85, 247, 0.05); border:1px solid var(--primary); padding:24px; border-radius:16px; margin-bottom:32px;">
                        <h4 style="margin-bottom:12px;">Submit Protocol Review</h4>
                        <div style="display:flex; gap:12px; margin-bottom:12px;">
                            <select id="revRating" class="input" style="width:120px;">
                                <option value="5">★★★★★</option>
                                <option value="4">★★★★☆</option>
                                <option value="3">★★★☆☆</option>
                                <option value="2">★★☆☆☆</option>
                                <option value="1">★☆☆☆☆</option>
                            </select>
                            <input type="text" id="revText" class="input" placeholder="Feedback on deliverable...">
                        </div>
                        <button class="buy-btn" style="padding:10px;" onclick="submitReview('${name}')">POST REVIEW</button>
                    </div>
                ` : ''}

                <div style="display:flex; flex-direction:column; gap:20px;">
                    ${sellerReviews.length === 0 ? '<p style="opacity:0.3; font-size:12px;">No protocol reviews yet for this identity.</p>' : sellerReviews.map(r => `
                        <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:12px; border:1px solid var(--border);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span style="font-weight:800;">${r.buyer}</span>
                                <span style="color:var(--primary);">${'★'.repeat(r.rating)}</span>
                            </div>
                            <p style="color:var(--text-muted); font-size:14px; line-height:1.5;">${r.text}</p>
                        </div>
                    `).reverse().join('')}
                </div>
            </div>
        </div>
    `;
}

function submitReview(sellerName) {
    const rating = parseInt(document.getElementById('revRating').value);
    const text = document.getElementById('revText').value;
    if (!text) return alert("Feedback content required.");

    let reviews = JSON.parse(localStorage.getItem('teenzup_reviews')) || [];
    reviews.push({
        seller: sellerName,
        buyer: window.user.username,
        rating,
        text,
        timestamp: Date.now()
    });
    localStorage.setItem('teenzup_reviews', JSON.stringify(reviews));
    
    alert("Review deployed to expert protocol.");
    showSellerProfileModal(sellerName); // Refresh modal
}

function showMySellerProfile() {
    if(window.user) showSellerProfileModal(window.user.username);
}

function handleCreateSaleClick() {
    if (!window.user) {
        alert("Please log in first.");
        window.showView('auth');
        return;
    }
    
    if (window.user.role === 'seller') {
        showCreateSaleForm();
    } else {
        alert("You need to become a seller to be able to create ads.");
        window.showSellerApp(); // Prompt the application directly
    }
}

window.showSellerProfileModal = showSellerProfileModal;
window.submitReview = submitReview;
window.buyProduct = buyProduct;
window.showMySellerProfile = showMySellerProfile;

// Global exposure
window.openOffer = openOffer;
window.renderMarket = renderMarket;
window.renderLeaderboards = renderLeaderboards;

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    generateData();
    // Re-render if current view is home or market
    const path = window.location.pathname;
    if (window.currentView === 'home') renderLeaderboards();
    if (window.currentView === 'market') renderMarket();
});
