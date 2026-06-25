let currentUser = null

// Page navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
    document.getElementById('page-' + page).classList.add('active')
    if (page === 'profile') loadProfile()
    if (page === 'shop') loadShop()
    if (page === 'leaderboard') loadLeaderboard('xp')
    closeMenu()
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open')
}
function closeMenu() {
    document.getElementById('navLinks').classList.remove('open')
}

// Auth
function toggleAuth() {
    const lf = document.getElementById('loginForm')
    const rf = document.getElementById('registerForm')
    const title = document.getElementById('authTitle')
    if (lf.style.display === 'none') {
        lf.style.display = 'block'
        rf.style.display = 'none'
        title.textContent = 'Login'
    } else {
        lf.style.display = 'none'
        rf.style.display = 'block'
        title.textContent = 'Register'
    }
}

async function login() {
    const phone = document.getElementById('loginPhone').value.trim()
    const password = document.getElementById('loginPassword').value
    const msg = document.getElementById('authMsg')
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    })
    const data = await res.json()
    if (data.success) {
        currentUser = { phone, username: data.username }
        onLoggedIn()
        showPage('profile')
    } else {
        msg.style.color = '#f55'
        msg.textContent = data.error
    }
}

async function register() {
    const username = document.getElementById('regUsername').value.trim()
    const phone = document.getElementById('regPhone').value.trim()
    const password = document.getElementById('regPassword').value
    const msg = document.getElementById('authMsg')
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, password })
    })
    const data = await res.json()
    if (data.success) {
        msg.style.color = '#5f5'
        msg.textContent = 'Registered! Please login.'
        toggleAuth()
    } else {
        msg.style.color = '#f55'
        msg.textContent = data.error
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    currentUser = null
    onLoggedOut()
    showPage('home')
}

function onLoggedIn() {
    document.getElementById('loginBtn').style.display = 'none'
    document.getElementById('logoutBtn').style.display = 'block'
    document.getElementById('navShop').style.display = 'block'
    document.getElementById('navProfile').style.display = 'block'
}

function onLoggedOut() {
    document.getElementById('loginBtn').style.display = 'block'
    document.getElementById('logoutBtn').style.display = 'none'
    document.getElementById('navShop').style.display = 'none'
    document.getElementById('navProfile').style.display = 'none'
}

// Profile
async function loadProfile() {
    const res = await fetch('/api/profile/me')
    if (res.status === 401) { showPage('login'); return }
    const data = await res.json()
    document.getElementById('profileName').textContent = data.username
    document.getElementById('profileTitle').textContent = data.title || ''
    document.getElementById('profileBio').textContent = data.bio || ''
    document.getElementById('statXP').textContent = data.xp
    document.getElementById('statLevel').textContent = data.level
    document.getElementById('statWallet').textContent = data.wallet
    document.getElementById('statVault').textContent = data.vault
    document.getElementById('profileRank').textContent = '⚔️ ' + data.rank
    if (data.avatar) document.getElementById('profileAvatar').src = data.avatar
    if (data.cover) {
        document.getElementById('profileCover').style.backgroundImage = `url(${data.cover})`
        document.getElementById('profileCover').style.backgroundSize = 'cover'
    }
    const xpPerLevel = 1000
    const pct = ((data.xp % xpPerLevel) / xpPerLevel) * 100
    document.getElementById('xpBar').style.width = pct + '%'
}

async function uploadImage(type) {
    const fileInput = document.getElementById(type + 'File')
    const file = fileInput.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append(type, file)

    const res = await fetch('/api/upload/' + type, {
        method: 'POST',
        body: formData
    })
    const data = await res.json()
    if (data.success) {
        if (type === 'avatar') {
            document.getElementById('profileAvatar').src = data.url
        } else {
            document.getElementById('profileCover').style.backgroundImage = `url(${data.url})`
            document.getElementById('profileCover').style.backgroundSize = 'cover'
        }
        alert('✅ ' + type + ' uploaded!')
    } else {
        alert('❌ ' + data.error)
    }
}

async function updateProfile() {
    const bio = document.getElementById('editBio').value.trim()
    const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio })
    })
    const data = await res.json()
    if (data.success) { loadProfile(); alert('✅ Bio updated!') }
    else alert('❌ ' + data.error)
}

// Shop
async function loadShop() {
    const pRes = await fetch('/api/profile/me')
    if (pRes.status === 401) { showPage('login'); return }
    const profile = await pRes.json()
    document.getElementById('shopWallet').textContent = profile.wallet
    document.getElementById('shopVault').textContent = profile.vault

    const res = await fetch('/api/shop/items')
    const data = await res.json()
    const grid = document.getElementById('shopGrid')
    grid.innerHTML = ''
    data.items.forEach(item => {
        grid.innerHTML += `
        <div class="shop-item">
            <div class="item-category">${item.category}</div>
            <div class="item-emoji">${item.emoji}</div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="item-price">💰 ${item.price.toLocaleString()}</div>
            ${item.owned
                ? `<button class="btn-owned">Owned</button>`
                : `<button class="btn-buy" onclick="buyItem('${item.id}')">Buy</button>`
            }
        </div>`
    })
}

async function buyItem(itemId) {
    const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
    })
    const data = await res.json()
    if (data.success) { alert(data.message); loadShop() }
    else alert('❌ ' + data.error)
}

// Leaderboard
async function loadLeaderboard(type, btn) {
    if (btn) {
        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'))
        btn.classList.add('active')
    }
    const res = await fetch('/api/leaderboard?type=' + type)
    if (!res.ok) return
    const data = await res.json()
    const users = data.users || []

    const podium = document.getElementById('lbPodium')
    const list = document.getElementById('lbList')
    const label = type === 'xp' ? 'XP' : 'Coins'

    const top3 = users.slice(0, 3)
    const rest = users.slice(3)
    const medals = ['🥇', '🥈', '🥉']
    const classes = ['first', 'second', 'third']
    const order = [1, 0, 2]

    podium.innerHTML = ''
    order.forEach(i => {
        if (!top3[i]) return
        podium.innerHTML += `
        <div class="podium-card ${classes[i]}">
            <div class="podium-rank">${medals[i]}</div>
            <div class="podium-name">${top3[i].username}</div>
            <div class="podium-score">${top3[i].score.toLocaleString()} ${label}</div>
        </div>`
    })

    list.innerHTML = ''
    rest.forEach((u, i) => {
        list.innerHTML += `
        <div class="lb-row">
            <span class="lb-num">#${i + 4}</span>
            <span class="lb-name">${u.username}</span>
            <span class="lb-score">${u.score.toLocaleString()} ${label}</span>
        </div>`
    })
}

// Check session on load
window.onload = async () => {
    const res = await fetch('/api/profile/me')
    if (res.ok) {
        const data = await res.json()
        currentUser = { username: data.username }
        onLoggedIn()
        showPage('profile')
    } else {
        showPage('home')
    }
}
