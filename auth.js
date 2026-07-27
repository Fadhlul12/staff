// =========================================================
// AUTH.JS - Manajemen Akun Admin
// =========================================================

// Akun default Admin (tersimpan di localStorage)
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    name: 'Admin Utama',
    role: 'Administrator',
    email: 'admin@bkpsdmdumai.go.id'
};

// Inisialisasi akun jika belum ada
function initAdminAccount() {
    if (!localStorage.getItem('bkpsdm_admin')) {
        localStorage.setItem('bkpsdm_admin', JSON.stringify(DEFAULT_ADMIN));
    }
}

function getAdminAccount() {
    initAdminAccount();
    return JSON.parse(localStorage.getItem('bkpsdm_admin'));
}

function saveAdminAccount(data) {
    localStorage.setItem('bkpsdm_admin', JSON.stringify(data));
}

// =========================================================
// SESSION MANAGEMENT
// =========================================================
function setSession(admin) {
    sessionStorage.setItem('bkpsdm_session', JSON.stringify({
        username: admin.username,
        name: admin.name,
        role: admin.role,
        email: admin.email,
        loginTime: new Date().toISOString()
    }));
}

function getSession() {
    const s = sessionStorage.getItem('bkpsdm_session');
    return s ? JSON.parse(s) : null;
}

function clearSession() {
    sessionStorage.removeItem('bkpsdm_session');
}

// =========================================================
// SIDEBAR TOGGLE FEATURE
// =========================================================
function toggleSidebar() {
    const layout = document.querySelector('.dashboard-layout');
    if (!layout) return;
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        layout.classList.toggle('sidebar-mobile-open');
    } else {
        layout.classList.toggle('sidebar-collapsed');
        const isCollapsed = layout.classList.contains('sidebar-collapsed');
        localStorage.setItem('bkpsdm_sidebar_collapsed', isCollapsed ? 'true' : 'false');
        updateSidebarIcon(isCollapsed);
    }
}

function updateSidebarIcon(isCollapsed) {
    const icon = document.getElementById('sidebarToggleIcon');
    if (!icon) return;
    if (isCollapsed) {
        icon.className = 'ph-bold ph-sidebar-simple';
    } else {
        icon.className = 'ph-bold ph-list';
    }
}

function initSidebarState() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return; // Pada HP sidebar tersembunyi secara default (drawer overlay)

    const isCollapsed = localStorage.getItem('bkpsdm_sidebar_collapsed') === 'true';
    const layout = document.querySelector('.dashboard-layout');
    if (layout && isCollapsed) {
        layout.classList.add('sidebar-collapsed');
        updateSidebarIcon(true);
    }
}

// =========================================================
// AUTH GUARD: Dipanggil di admin.html
// Jika tidak ada sesi, redirect ke login
// =========================================================
function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    
    // Inisialisasi status sidebar saat halaman admin dimuat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebarState);
    } else {
        initSidebarState();
    }
    return session;
}

// =========================================================
// LOGIN
// =========================================================
function handleLogin(e) {
    if (e) e.preventDefault();

    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorMsg = document.getElementById('loginError');
    const btnLogin = document.getElementById('btnLogin');

    if (!usernameInput || !passwordInput) return;

    const inputUsername = usernameInput.value.trim();
    const inputPassword = passwordInput.value;

    const admin = getAdminAccount();

    btnLogin.classList.add('loading');
    btnLogin.disabled = true;

    // Simulasi delay jaringan
    setTimeout(() => {
        if (inputUsername === admin.username && inputPassword === admin.password) {
            setSession(admin);
            window.location.href = 'admin.html';
        } else {
            errorMsg.style.display = 'flex';
            passwordInput.value = '';
            btnLogin.classList.remove('loading');
            btnLogin.disabled = false;

            // Animasi shake
            document.querySelector('.login-card').classList.add('shake');
            setTimeout(() => document.querySelector('.login-card').classList.remove('shake'), 600);
        }
    }, 800);
}

// =========================================================
// LOGOUT
// =========================================================
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari Portal Admin?')) {
        clearSession();
        window.location.href = 'login.html';
    }
}

// =========================================================
// TAMPILKAN INFO PROFIL ADMIN DI HEADER
// =========================================================
function renderAdminProfile() {
    const session = getSession();
    if (!session) return;

    const nameEl = document.getElementById('adminName');
    const roleEl = document.getElementById('adminRole');
    const initEl = document.getElementById('adminInitial');

    if (nameEl) nameEl.innerText = session.name;
    if (roleEl) roleEl.innerText = session.role;
    if (initEl) initEl.innerText = session.name.charAt(0).toUpperCase();
}

// =========================================================
// DROPDOWN TOGGLE PROFIL + CARET ANIMATION
// =========================================================
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const caret = document.getElementById('profileCaretIcon');
    if (dropdown) {
        const isOpen = dropdown.classList.toggle('active');
        if (caret) {
            caret.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

// Tutup dropdown kalau klik di luar
document.addEventListener('click', (e) => {
    const profile = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    const caret = document.getElementById('profileCaretIcon');
    if (dropdown && profile && !profile.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        if (caret) caret.style.transform = 'rotate(0deg)';
    }
});

// =========================================================
// ADMIN PROFILE PHOTO MANAGEMENT
// =========================================================
function getAdminPhoto() {
    return localStorage.getItem('bkpsdm_admin_photo') || null;
}

function saveAdminPhoto(dataUrl) {
    localStorage.setItem('bkpsdm_admin_photo', dataUrl);
}

function removeAdminPhotoData() {
    localStorage.removeItem('bkpsdm_admin_photo');
}

function handleAdminPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        if (typeof showToast === 'function') showToast('Ukuran foto terlalu besar! Maksimal 3MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        saveAdminPhoto(dataUrl);
        renderAdminPhotoEverywhere();
        if (typeof showToast === 'function') showToast('Foto profil admin berhasil diperbarui!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function removeAdminPhoto() {
    removeAdminPhotoData();
    renderAdminPhotoEverywhere();
    const fileInput = document.getElementById('adminPhotoInput');
    if (fileInput) fileInput.value = '';
    if (typeof showToast === 'function') showToast('Foto profil admin dihapus.', 'success');
}

function renderAdminPhotoEverywhere() {
    const photo = getAdminPhoto();
    const admin = getAdminAccount();
    const initial = admin.name ? admin.name.charAt(0).toUpperCase() : 'A';

    // Header avatar
    const headerPhoto = document.getElementById('adminHeaderPhoto');
    const headerInitialText = document.getElementById('adminInitialText');
    if (headerPhoto && headerInitialText) {
        if (photo) {
            headerPhoto.src = photo;
            headerPhoto.style.display = 'block';
            headerInitialText.style.display = 'none';
        } else {
            headerPhoto.style.display = 'none';
            headerInitialText.style.display = 'block';
            headerInitialText.innerText = initial;
        }
    }

    // Sidebar avatar
    const sidebarEl = document.getElementById('sidebarInitial');
    if (sidebarEl) {
        if (photo) {
            sidebarEl.innerHTML = `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            sidebarEl.innerText = initial;
        }
    }

    // Dropdown avatar
    const dropdownAvatar = document.getElementById('dropdownInitial');
    if (dropdownAvatar) {
        if (photo) {
            dropdownAvatar.innerHTML = `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            dropdownAvatar.innerText = initial;
        }
    }

    // Edit profile modal avatar
    const editPhoto = document.getElementById('editProfilePhoto');
    const editInitial = document.getElementById('editProfileInitial');
    const removeBtn = document.getElementById('btnRemoveAdminPhoto');
    if (editPhoto && editInitial) {
        if (photo) {
            editPhoto.src = photo;
            editPhoto.style.display = 'block';
            editInitial.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        } else {
            editPhoto.style.display = 'none';
            editInitial.style.display = 'block';
            editInitial.innerText = initial;
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }
}

// =========================================================
// MODAL EDIT PROFIL ADMIN
// =========================================================
function openEditProfileModal() {
    const admin = getAdminAccount();
    const nameEl = document.getElementById('editAdminName');
    const emailEl = document.getElementById('editAdminEmail');
    const usernameEl = document.getElementById('editAdminUsername');
    const roleEl = document.getElementById('editAdminRole');
    const passEl = document.getElementById('editAdminPassword');
    const confirmEl = document.getElementById('editAdminPasswordConfirm');
    const errorEl = document.getElementById('editProfileError');

    if (nameEl) nameEl.value = admin.name || '';
    if (emailEl) emailEl.value = admin.email || '';
    if (usernameEl) usernameEl.value = admin.username || '';
    if (roleEl) roleEl.value = admin.role || 'Administrator';
    if (passEl) passEl.value = '';
    if (confirmEl) confirmEl.value = '';

    if (errorEl) errorEl.style.display = 'none';

    const avatarEl = document.getElementById('editProfileAvatar');
    if (avatarEl && admin.name) {
        avatarEl.innerText = admin.name.charAt(0).toUpperCase();
    }

    document.getElementById('profileModal')?.classList.add('active');
    document.getElementById('profileDropdown')?.classList.remove('active');
}

function closeProfileModal() {
    document.getElementById('profileModal')?.classList.remove('active');
}

document.getElementById('profileModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeProfileModal();
});

function saveAdminProfile() {
    const nameEl = document.getElementById('editAdminName');
    const emailEl = document.getElementById('editAdminEmail');
    const usernameEl = document.getElementById('editAdminUsername');
    const roleEl = document.getElementById('editAdminRole');
    const passEl = document.getElementById('editAdminPassword');
    const confirmEl = document.getElementById('editAdminPasswordConfirm');
    const errorEl = document.getElementById('editProfileError');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const username = usernameEl ? usernameEl.value.trim() : '';
    const role = roleEl ? roleEl.value.trim() : 'Administrator';
    const newPassword = passEl ? passEl.value : '';
    const confirmPassword = confirmEl ? confirmEl.value : '';

    const showError = (msg) => {
        if (!errorEl) return;
        const span = errorEl.querySelector('span');
        if (span) span.innerText = msg;
        else errorEl.innerText = msg;
        errorEl.style.display = 'flex';
    };

    if (errorEl) errorEl.style.display = 'none';

    if (!name || !username || !email) {
        showError('Nama, Username, dan Email tidak boleh kosong!');
        return;
    }

    if (newPassword && newPassword !== confirmPassword) {
        showError('Konfirmasi password tidak cocok!');
        return;
    }

    const currentAdmin = getAdminAccount();
    const updated = {
        ...currentAdmin,
        name,
        email,
        username,
        role: role || currentAdmin.role || 'Administrator',
        password: newPassword ? newPassword : currentAdmin.password
    };

    saveAdminAccount(updated);
    setSession(updated);
    renderAdminProfile();
    closeProfileModal();
    if (typeof showToast === 'function') {
        showToast('Profil admin berhasil diperbarui!', 'success');
    }
}

// =========================================================
// MODAL GANTI PASSWORD ADMIN
// =========================================================
function openChangePasswordModal() {
    const currentPassEl = document.getElementById('currentPasswordInput');
    const newPassEl = document.getElementById('newPasswordInput');
    const confirmPassEl = document.getElementById('confirmNewPasswordInput');
    const errorEl = document.getElementById('passwordModalError');

    if (currentPassEl) currentPassEl.value = '';
    if (newPassEl) newPassEl.value = '';
    if (confirmPassEl) confirmPassEl.value = '';
    if (errorEl) errorEl.style.display = 'none';

    document.getElementById('passwordModal')?.classList.add('active');
    document.getElementById('profileDropdown')?.classList.remove('active');
}

function closePasswordModal() {
    document.getElementById('passwordModal')?.classList.remove('active');
}

document.getElementById('passwordModal')?.addEventListener('click', function(e) {
    if (e.target === this) closePasswordModal();
});

function saveNewPassword() {
    const currentPass = document.getElementById('currentPasswordInput')?.value || '';
    const newPass = document.getElementById('newPasswordInput')?.value || '';
    const confirmPass = document.getElementById('confirmNewPasswordInput')?.value || '';
    const errorEl = document.getElementById('passwordModalError');

    const showError = (msg) => {
        if (!errorEl) return;
        const span = errorEl.querySelector('span');
        if (span) span.innerText = msg;
        else errorEl.innerText = msg;
        errorEl.style.display = 'flex';
    };

    if (errorEl) errorEl.style.display = 'none';

    const admin = getAdminAccount();

    // Debug: tampilkan password tersimpan di console untuk membantu troubleshoot
    console.log('[BKPSDM] Password tersimpan saat ini:', admin.password);
    console.log('[BKPSDM] Password yang diinput:', currentPass);

    if (!currentPass) {
        showError('Masukkan password saat ini!');
        return;
    }

    if (currentPass.trim() !== admin.password.trim()) {
        showError('Password saat ini salah! (Tips: cek password default: admin123)');
        return;
    }

    if (!newPass || newPass.length < 4) {
        showError('Password baru minimal 4 karakter!');
        return;
    }

    if (newPass !== confirmPass) {
        showError('Konfirmasi password baru tidak cocok!');
        return;
    }

    const updated = {
        ...admin,
        password: newPass
    };

    saveAdminAccount(updated);

    // Update session juga
    sessionStorage.setItem('bkpsdm_session', JSON.stringify({
        username: updated.username,
        name: updated.name,
        role: updated.role,
        email: updated.email,
        loginTime: new Date().toISOString()
    }));

    closePasswordModal();

    // Reset caret jika ada
    const caret = document.getElementById('profileCaretIcon');
    if (caret) caret.style.transform = 'rotate(0deg)';

    if (typeof showToast === 'function') {
        showToast('✅ Password admin berhasil diubah!', 'success');
    }
}

// Inisialisasi saat halaman dimuat
initAdminAccount();
