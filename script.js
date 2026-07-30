// =========================================================
// DATA STAFF (Tersimpan di localStorage agar permanen)
// =========================================================
const staffData = [
  { id: 1, name: "Drs. Bambang Wijaya, M.Si", role: "Kepala Badan BKPSDM Kota Contoh", status: "dikantor", statusText: "Di Kantor", time: "07.30-16.00 Wib", gender: "male", phone: "0812-1111-0001", email: "bambang.wijaya@bkpsdmcontoh.go.id" },
  { id: 2, name: "Sri Handayani, S.Sos., M.A.P", role: "Sekretaris BKPSDM Kota Contoh", status: "cuti", statusText: "Cuti", time: "07.30-16.00 Wib", gender: "female", phone: "0813-2222-0002", email: "sri.handayani@bkpsdmcontoh.go.id" },
  { id: 3, name: "Rudi Hartono, SKM., M.Si", role: "Kabid Pengadaan, Pemberhentian dan Informasi", status: "luarkantor", statusText: "Dinas Luar", time: "07.30-16.00 Wib", gender: "male", phone: "0821-3333-0003", email: "rudi.hartono@bkpsdmcontoh.go.id" },
  { id: 4, name: "Dedi Kurniawan, S.Sos", role: "Kabid Mutasi dan Kepangkatan", status: "dikantor", statusText: "Di Kantor", time: "07.30-16.00 Wib", gender: "male", phone: "0852-4444-0004", email: "dedi.kurniawan@bkpsdmcontoh.go.id" },
  { id: 5, name: "Yusuf Firmansyah, S.T., MM", role: "Kabid Pengembangan, Penilaian Kinerja dan Penghargaan", status: "cuti", statusText: "Cuti", time: "07.30-16.00 Wib", gender: "male", phone: "0812-5555-0005", email: "yusuf.firmansyah@bkpsdmcontoh.go.id" },
  { id: 6, name: "Rina Marlina, S.Sos., M.Si", role: "Kasubbag Tata Usaha", status: "dikantor", statusText: "Di Kantor", time: "07.30-16.00 Wib", gender: "female", phone: "0813-6666-0006", email: "rina.marlina@bkpsdmcontoh.go.id" },
  { id: 7, name: "Fitri Ramadhani, S.Psi., M.Si", role: "Kasubbag Perencanaan, Keuangan dan Aset", status: "luarkantor", statusText: "Dinas Luar", time: "07.30-16.00 Wib", gender: "female", phone: "0822-7777-0007", email: "fitri.ramadhani@bkpsdmcontoh.go.id" },
  { id: 8, name: "Agus Salim", role: "Subbag Perencanaan, Keuangan dan Aset", status: "cuti", statusText: "Cuti", time: "07.30-16.00 Wib", gender: "male", phone: "0853-8888-0008", email: "agus.salim@bkpsdmcontoh.go.id" },
];
const DATA_VERSION = 'v2';

// Ambil data dari localStorage. Jika belum ada, pakai data default.
function getData() {
    const stored = localStorage.getItem('bkpsdm_staff');
    return stored ? JSON.parse(stored) : staffData;
}

// Simpan data ke localStorage.
function saveToStorage(data) {
    localStorage.setItem('bkpsdm_staff', JSON.stringify(data));
}

// Inisialisasi / reset data jika versi berubah atau localStorage kosong
if (localStorage.getItem('bkpsdm_data_version') !== DATA_VERSION) {
    saveToStorage(staffData);
    localStorage.setItem('bkpsdm_data_version', DATA_VERSION);
}

// =========================================================
// VARIABEL GLOBAL
// =========================================================
const staffContainer = document.getElementById('staff-container');
const radioFilters = document.querySelectorAll('input[name="status"]');
const isAdminMode = staffContainer ? staffContainer.getAttribute('data-mode') === 'admin' : false;

let currentFilter = 'semua';
let currentSearch = '';  // Menyimpan kata kunci pencarian aktif
let editingId = null; // Menyimpan ID pegawai yang sedang di-edit

// =========================================================
// FUNGSI RENDER KARTU
// =========================================================
function getStatusInfo(status) {
    const map = {
        dikantor: { cls: 'badge-dikantor', text: 'Di Kantor' },
        luarkantor: { cls: 'badge-luar', text: 'Dinas Luar' },
        cuti: { cls: 'badge-cuti', text: 'Cuti' }
    };
    return map[status] || { cls: '', text: '-' };
}

function renderStaffCards(filterStatus = 'semua', keyword = null) {
    if (!staffContainer) return;
    currentFilter = filterStatus;
    if (keyword !== null) currentSearch = keyword;

    const q = currentSearch.toLowerCase().trim();
    const data = getData();

    // Filter berdasarkan status
    let filteredData = filterStatus === 'semua'
        ? data
        : data.filter(s => s.status === filterStatus);

    // Filter berdasarkan kata kunci pencarian (nama atau jabatan)
    if (q) {
        filteredData = filteredData.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.role.toLowerCase().includes(q)
        );
    }

    staffContainer.innerHTML = '';

    if (filteredData.length === 0) {
        const emptyMsg = q
            ? `Tidak ditemukan pegawai dengan nama/jabatan "${currentSearch}".`
            : 'Tidak ada pegawai dengan status ini.';
        staffContainer.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-magnifying-glass"></i>
                <p>${emptyMsg}</p>
            </div>`;
        return;
    }

    filteredData.forEach((staff, index) => {
        const { cls, text } = getStatusInfo(staff.status);
        const iconClass = staff.gender === 'female' ? 'ph-user-focus' : 'ph-user';

        const adminButtons = isAdminMode ? `
            <div class="admin-actions">
                <button class="action-btn btn-edit" title="Edit Data Lengkap" onclick="openEditModal(${staff.id})">
                    <i class="ph-bold ph-pencil-simple"></i>
                </button>
                <button class="action-btn btn-delete" title="Hapus Data" onclick="deleteData(${staff.id})">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </div>
        ` : '';

        const quickStatusSelector = isAdminMode ? `
            <div class="quick-status-bar">
                <button class="status-btn btn-st-kantor ${staff.status === 'dikantor' ? 'active' : ''}" onclick="quickChangeStatus(${staff.id}, 'dikantor')">
                    <i class="ph-bold ph-check"></i> Kantor
                </button>
                <button class="status-btn btn-st-dinas ${staff.status === 'luarkantor' ? 'active' : ''}" onclick="quickChangeStatus(${staff.id}, 'luarkantor')">
                    <i class="ph-bold ph-briefcase"></i> Dinas
                </button>
                <button class="status-btn btn-st-cuti ${staff.status === 'cuti' ? 'active' : ''}" onclick="quickChangeStatus(${staff.id}, 'cuti')">
                    <i class="ph-bold ph-calendar-x"></i> Cuti
                </button>
            </div>
        ` : '';

        // Check if staff has custom photo
        const avatarContent = staff.photo
            ? `<img src="${staff.photo}" class="avatar-img" alt="${staff.name}">`
            : `<i class="ph-fill ${iconClass} avatar-icon"></i>`;

        const avatarClickableClass = isAdminMode ? 'clickable-avatar' : '';
        const avatarOverlayBtn = isAdminMode ? `
            <div class="avatar-camera-btn" title="Ganti Foto Profil">
                <i class="ph-bold ph-camera"></i>
            </div>
        ` : '';

        const avatarOnClick = isAdminMode ? `onclick="triggerDirectPhotoUpload(${staff.id})"` : '';

        const adminCardClass = isAdminMode ? 'admin-staff-card' : '';
        const cardHTML = `
            <article class="staff-card ${adminCardClass}" style="animation-delay: ${index * 60}ms">
                ${isAdminMode ? '<div class="card-header-bg"></div>' : ''}
                ${!isAdminMode ? `<span class="status-badge ${cls}">${text}</span>` : ''}
                ${adminButtons}
                <div class="avatar-wrapper">
                    <div class="avatar-placeholder ${avatarClickableClass}" ${avatarOnClick}>
                        ${avatarContent}
                        ${avatarOverlayBtn}
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="staff-name">${staff.name}</h3>
                    <p class="staff-role">${staff.role}</p>
                    ${isAdminMode ? `
                    <div class="admin-working-hours">
                        <i class="ph-fill ph-clock"></i> <span>${staff.time}</span>
                    </div>
                    ` : ''}
                    ${quickStatusSelector}
                    ${!isAdminMode ? `
                    <div class="working-hours">
                        <i class="ph-fill ph-clock"></i> ${staff.time}
                    </div>` : ''}
                    <button class="btn-detail" onclick="showDetail(${staff.id})">
                        Lihat Detail <i class="ph-bold ph-arrow-right"></i>
                    </button>
                </div>
            </article>
        `;
        staffContainer.innerHTML += cardHTML;
    });

    // Update stats counter
    updateStats();
}

// =========================================================
// FITUR UPLOAD FOTO LANGSUNG DARI KARTU (ADMIN)
// =========================================================
let photoUploadTargetId = null;

function triggerDirectPhotoUpload(id) {
    photoUploadTargetId = id;
    const fileInput = document.getElementById('directPhotoInput');
    if (fileInput) fileInput.click();
}

function handleDirectPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file || photoUploadTargetId === null) return;

    // Check size limit (max 3MB for localStorage safety)
    if (file.size > 3 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar! Maksimal 3MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const photoData = event.target.result;
        const data = getData();
        const idx = data.findIndex(s => s.id === photoUploadTargetId);
        if (idx !== -1) {
            data[idx].photo = photoData;
            saveToStorage(data);
            showToast(`Foto profil ${data[idx].name.split(',')[0]} berhasil diperbarui!`, 'success');
            renderStaffCards(currentFilter);
        }
        e.target.value = ''; // Reset file input
    };
    reader.readAsDataURL(file);
}

// =========================================================
// UBAH STATUS CEPAT (1 KLIK UNTUK ADMIN)
// =========================================================
function quickChangeStatus(id, newStatus) {
    const data = getData();
    const idx = data.findIndex(s => s.id === id);
    if (idx !== -1) {
        if (data[idx].status === newStatus) return; // Tidak ada perubahan
        
        data[idx].status = newStatus;
        data[idx].statusText = getStatusInfo(newStatus).text;
        saveToStorage(data);
        
        const shortName = data[idx].name.split(',')[0];
        showToast(`Status ${shortName} diubah ke ${data[idx].statusText}!`, 'success');
        renderStaffCards(currentFilter);
    }
}

// =========================================================
// FUNGSI UPDATE STATS DI HEADER ADMIN
// =========================================================
function updateStats() {
    const data = getData();
    const elTotal = document.getElementById('stat-total');
    const elDikantor = document.getElementById('stat-dikantor');
    const elLuar = document.getElementById('stat-luar');
    const elCuti = document.getElementById('stat-cuti');

    if (elTotal) elTotal.innerText = data.length;
    if (elDikantor) elDikantor.innerText = data.filter(s => s.status === 'dikantor').length;
    if (elLuar) elLuar.innerText = data.filter(s => s.status === 'luarkantor').length;
    if (elCuti) elCuti.innerText = data.filter(s => s.status === 'cuti').length;
}

// =========================================================
// FILTER EVENT LISTENERS
// =========================================================
if (radioFilters.length > 0) {
    radioFilters.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Render ulang dengan filter status baru + kata kunci yang sedang aktif
            renderStaffCards(e.target.value);
        });
    });
}

// SEARCH (Live Search + Sinkron dengan Filter Status)
const searchInputs = document.querySelectorAll('.search-bar input');
searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const keyword = e.target.value;
        // Show or hide clear button
        const clearBtn = input.parentElement.querySelector('.search-clear-btn');
        if (clearBtn) {
            clearBtn.style.display = keyword ? 'block' : 'none';
        }
        // Render ulang dengan filter status aktif + kata kunci baru
        renderStaffCards(currentFilter, keyword);
    });
});

// Clear functions for public and admin search bars
function clearPublicSearch() {
    const input = document.getElementById('publicSearchInput');
    if (input) input.value = '';
    const btn = document.getElementById('publicSearchClear');
    if (btn) btn.style.display = 'none';
    renderStaffCards(currentFilter, '');
}

function clearAdminSearch() {
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    const btn = document.getElementById('adminSearchClear');
    if (btn) btn.style.display = 'none';
    renderStaffCards(currentFilter, '');
}

// =========================================================
// HANDLER FOTO PADA MODAL FORM (TAMBAH / EDIT)
// =========================================================
function handleModalPhotoPreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar! Maksimal 3MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const photoData = event.target.result;
        setModalPhotoPreview(photoData);
    };
    reader.readAsDataURL(file);
}

function setModalPhotoPreview(photoData) {
    const inputPhotoData = document.getElementById('inputPhotoData');
    const modalPhotoPreview = document.getElementById('modalPhotoPreview');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');

    if (inputPhotoData) inputPhotoData.value = photoData || '';

    if (modalPhotoPreview) {
        if (photoData) {
            modalPhotoPreview.innerHTML = `<img src="${photoData}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            if (btnRemovePhoto) btnRemovePhoto.style.display = 'inline-block';
        } else {
            modalPhotoPreview.innerHTML = `<i class="ph-fill ph-image"></i>`;
            if (btnRemovePhoto) btnRemovePhoto.style.display = 'none';
        }
    }
}

function removeModalPhoto() {
    setModalPhotoPreview(null);
    const fileInput = document.getElementById('inputPhotoFile');
    if (fileInput) fileInput.value = '';
}

// =========================================================
// MODAL TAMBAH
// =========================================================
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').innerText = 'Tambah Pegawai Baru';
    document.getElementById('inputName').value = '';
    document.getElementById('inputRole').value = '';
    document.getElementById('inputStatus').value = 'dikantor';
    document.getElementById('inputGender').value = 'male';
    document.getElementById('inputTime').value = '07.30-16.00 Wib';
    if (document.getElementById('inputPhone')) document.getElementById('inputPhone').value = '';
    if (document.getElementById('inputEmail')) document.getElementById('inputEmail').value = '';
    setModalPhotoPreview(null);
    const fileInput = document.getElementById('inputPhotoFile');
    if (fileInput) fileInput.value = '';
    document.getElementById('formModal').classList.add('active');
}

// =========================================================
// MODAL EDIT
// =========================================================
function openEditModal(id) {
    const data = getData();
    const staff = data.find(s => s.id === id);
    if (!staff) return;

    editingId = id;
    document.getElementById('modalTitle').innerText = 'Edit Data Pegawai';
    document.getElementById('inputName').value = staff.name;
    document.getElementById('inputRole').value = staff.role;
    document.getElementById('inputStatus').value = staff.status;
    document.getElementById('inputGender').value = staff.gender;
    document.getElementById('inputTime').value = staff.time;
    if (document.getElementById('inputPhone')) document.getElementById('inputPhone').value = staff.phone || '';
    if (document.getElementById('inputEmail')) document.getElementById('inputEmail').value = staff.email || '';
    setModalPhotoPreview(staff.photo || null);
    const fileInput = document.getElementById('inputPhotoFile');
    if (fileInput) fileInput.value = '';
    document.getElementById('formModal').classList.add('active');
}

// =========================================================
// TUTUP MODAL
// =========================================================
function closeModal() {
    document.getElementById('formModal')?.classList.remove('active');
}

// Tutup modal jika klik di luar kotak
document.getElementById('formModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// =========================================================
// SIMPAN DATA (Tambah/Edit)
// =========================================================
function saveData() {
    const name = document.getElementById('inputName').value.trim();
    const role = document.getElementById('inputRole').value.trim();
    const status = document.getElementById('inputStatus').value;
    const gender = document.getElementById('inputGender').value;
    const time = document.getElementById('inputTime').value.trim();
    const phone = document.getElementById('inputPhone') ? document.getElementById('inputPhone').value.trim() : '';
    const email = document.getElementById('inputEmail') ? document.getElementById('inputEmail').value.trim() : '';
    const photo = document.getElementById('inputPhotoData').value || null;

    if (!name || !role) {
        showToast('Nama dan Jabatan tidak boleh kosong!', 'error');
        return;
    }

    const data = getData();
    const { text: statusText } = getStatusInfo(status);

    if (editingId !== null) {
        // MODE EDIT
        const idx = data.findIndex(s => s.id === editingId);
        if (idx !== -1) {
            data[idx] = { ...data[idx], name, role, status, statusText, gender, time, phone, email, photo };
        }
        showToast('Data pegawai berhasil diperbarui!', 'success');
    } else {
        // MODE TAMBAH
        const newId = data.length > 0 ? Math.max(...data.map(s => s.id)) + 1 : 1;
        data.push({ id: newId, name, role, status, statusText, gender, time, phone, email, photo });
        showToast('Pegawai baru berhasil ditambahkan!', 'success');
    }

    saveToStorage(data);
    closeModal();
    renderStaffCards(currentFilter);
}

// =========================================================
// HAPUS DATA
// =========================================================
function deleteData(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) return;

    const data = getData();
    const updated = data.filter(s => s.id !== id);
    saveToStorage(updated);
    showToast('Data pegawai berhasil dihapus!', 'success');
    renderStaffCards(currentFilter);
}

// =========================================================
// LIHAT DETAIL MODAL
// =========================================================
function showDetail(id) {
    const data = getData();
    const staff = data.find(s => s.id === id);
    if (!staff) return;

    const { cls, text } = getStatusInfo(staff.status);
    const detailModal = document.getElementById('detailModal');
    if (!detailModal) return;

    // Staff Name and Role
    const nameEl = detailModal.querySelector('.detail-name');
    const roleEl = detailModal.querySelector('.detail-role');
    if (nameEl) nameEl.innerText = staff.name;
    if (roleEl) roleEl.innerText = staff.role;

    // Avatar Container (Custom photo or icon placeholder)
    const avatarContainer = detailModal.querySelector('#detailAvatarContainer');
    if (avatarContainer) {
        if (staff.photo) {
            avatarContainer.innerHTML = `<img src="${staff.photo}" class="detail-avatar-img" alt="${staff.name}">`;
        } else {
            const iconClass = staff.gender === 'female' ? 'ph-user-focus' : 'ph-user';
            avatarContainer.innerHTML = `<div class="detail-avatar-placeholder"><i class="ph-fill ${iconClass}"></i></div>`;
        }
    }

    // Status Badge & Value
    const badgeEl = detailModal.querySelector('.detail-badge');
    if (badgeEl) {
        badgeEl.innerText = text;
        badgeEl.className = `status-badge ${cls}`;
    }

    const statusValEl = detailModal.querySelector('#detailStatusValue');
    if (statusValEl) statusValEl.innerText = text;

    const statusIconEl = detailModal.querySelector('#detailStatusIcon');
    if (statusIconEl) {
        if (staff.status === 'dikantor') statusIconEl.className = 'ph-fill ph-check-circle';
        else if (staff.status === 'luarkantor') statusIconEl.className = 'ph-fill ph-briefcase';
        else statusIconEl.className = 'ph-fill ph-calendar-x';
    }

    // Jam Kerja
    const timeEl = detailModal.querySelector('.detail-time');
    if (timeEl) timeEl.innerText = staff.time;

    // Jenis Kelamin
    const genderEl = detailModal.querySelector('.detail-gender');
    if (genderEl) genderEl.innerText = staff.gender === 'female' ? 'Perempuan' : 'Laki-laki';

    const genderIconEl = detailModal.querySelector('#detailGenderIcon');
    if (genderIconEl) genderIconEl.className = `ph-fill ${staff.gender === 'female' ? 'ph-gender-female' : 'ph-gender-male'}`;

    // Kontak Pegawai (WA ke Admin, Email)
    const adminPhone = '0812-7000-8800';
    const cleanAdminPhone = '6281270008800';
    const email = staff.email || (staff.name ? `${staff.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}@bkpsdmdumai.go.id` : 'info@bkpsdmdumai.go.id');

    const btnWa = detailModal.querySelector('#detailBtnWa');
    const btnEmail = detailModal.querySelector('#detailBtnEmail');

    const waVal = detailModal.querySelector('#detailWaVal');
    const emailVal = detailModal.querySelector('#detailEmailVal');

    if (btnWa) {
        btnWa.href = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent('Halo Admin BKPSDM, saya ingin bertanya terkait pegawai: ' + staff.name + ' (' + staff.role + ').')}`;
        if (waVal) waVal.innerText = adminPhone;
    }
    if (btnEmail) {
        btnEmail.href = `mailto:${email}?subject=${encodeURIComponent('BKPSDM Dumai - Pertanyaan/Komunikasi dengan ' + staff.name)}`;
        if (emailVal) emailVal.innerText = email;
    }

    detailModal.classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal')?.classList.remove('active');
}
document.getElementById('detailModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeDetailModal();
});

// =========================================================
// TOAST NOTIFICATION
// =========================================================
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="ph-fill ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================================================
// HANDLER INTERAKTIF SEKSI FAQ & HUBUNGI KAMI
// =========================================================
function toggleFaq(btn) {
    const item = btn.parentElement;
    const allItems = document.querySelectorAll('.faq-item');
    allItems.forEach(i => {
        if (i !== item) i.classList.remove('active');
    });
    item.classList.toggle('active');
}

function handlePublicContactSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('contactName');
    const name = nameInput ? nameInput.value.trim() : 'Pengunjung';
    
    showToast(`Terima kasih ${name}! Pesan Anda telah berhasil terkirim ke tim BKPSDM Kota Dumai.`, 'success');
    
    const form = document.getElementById('publicContactForm');
    if (form) form.reset();
}

// =========================================================
// INITIAL RENDER
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    if (staffContainer) {
        renderStaffCards('semua');
    }
});
