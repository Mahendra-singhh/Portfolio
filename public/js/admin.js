// public/js/admin.js

let allAppointments = [];

// Single Section Visibility Switch
function showSection(sectionId, element) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active-section');
    element.classList.add('active');

    const titleText = element.querySelector('span').innerText;
    document.getElementById('currentSectionTitle').innerText = titleText;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openEditModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeEditModal(id) { document.getElementById(id).style.display = 'none'; }

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    btn.classList.add('active');
}

async function loadAdminData() {
    try {
        const contentRes = await fetch('/api/content');
        const contentData = await contentRes.json();
        
        if (contentData.success && contentData.data) {
            const prof = contentData.data.profile;
            document.getElementById('profName').value = prof.name || '';
            document.getElementById('profTitle').value = prof.title || '';
            document.getElementById('profBio').value = prof.bio || '';
            document.getElementById('profEmail').value = prof.email || '';
            document.getElementById('profPhone').value = prof.phone || '';

            document.getElementById('adminBioDisplay').innerText = prof.bio || 'No bio set.';
            document.getElementById('adminEmailDisplay').innerText = prof.email || '-';
            document.getElementById('adminPhoneDisplay').innerText = prof.phone || '-';

            if (prof.profilePic) {
                document.getElementById('adminProfileImgDisplay').style.backgroundImage = `url('${prof.profilePic}')`;
            }

            const certsList = document.getElementById('adminCertsList');
            certsList.innerHTML = '';
            (contentData.data.certifications || []).forEach(c => {
                certsList.innerHTML += `<li><i class="fa-solid fa-award"></i> <strong>${c.title}:</strong> ${c.description}</li>`;
            });

            const galGrid = document.getElementById('adminGalleryGrid');
            galGrid.innerHTML = '';
            (contentData.data.gallery || []).forEach(item => {
                galGrid.innerHTML += `
                    <div class="gallery-item" style="position:relative; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <img src="${item.imageUrl}" style="width:100%; height:180px; object-fit:cover; display:block;">
                        <div style="padding:8px; background:#fff; text-align:center; font-weight:bold; font-size:0.85rem;">${item.title}</div>
                        <button onclick="deleteGalleryItem('${item._id}')" style="position:absolute; top:8px; right:8px; background:red; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
            });
        }

        const appRes = await fetch('/api/appointments');
        const appData = await appRes.json();

        if (appData.success) {
            allAppointments = appData.data;
            renderTables(allAppointments);
        }
    } catch (err) { console.error('Admin Load Error:', err); }
}

function renderTables(data) {
    const todayStr = new Date().toISOString().split('T')[0];

    const upcomingTbody = document.getElementById('upcomingTable');
    const pastTbody = document.getElementById('pastTable');
    const usersTbody = document.getElementById('usersTable');

    upcomingTbody.innerHTML = '';
    pastTbody.innerHTML = '';
    usersTbody.innerHTML = '';

    const userMap = {};

    const upcomingList = data.filter(a => a.appointmentDate >= todayStr);
    const pastList = data.filter(a => a.appointmentDate < todayStr);

    if (upcomingList.length === 0) {
        upcomingTbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No upcoming appointments.</td></tr>';
    } else {
        upcomingList.forEach(app => {
            const cleanPhone = app.whatsappNumber ? app.whatsappNumber.replace(/\D/g, '') : '';
            const waUrl = `https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(app.name)},%20this%20is%20Puneesh%20Kumar.%20Regarding%20your%20yoga%20appointment%20on%20${app.appointmentDate}%20at%20${app.appointmentTime}.`;

            upcomingTbody.innerHTML += `
                <tr>
                    <td><strong>${app.appointmentDate}</strong><br><small>${app.appointmentTime}</small></td>
                    <td>${app.name}</td>
                    <td>${app.whatsappNumber}</td>
                    <td>${app.email}</td>
                    <td>${app.concern}</td>
                    <td>${app.ageGroup}</td>
                    <td>${app.gender}</td>
                    <td><a href="${waUrl}" target="_blank" class="whatsapp-btn"><i class="fa-brands fa-whatsapp"></i> Chat</a></td>
                </tr>
            `;
        });
    }

    if (pastList.length === 0) {
        pastTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No past appointments found.</td></tr>';
    } else {
        pastList.forEach(app => {
            pastTbody.innerHTML += `
                <tr>
                    <td><strong>${app.appointmentDate}</strong></td>
                    <td>${app.name}</td>
                    <td>${app.whatsappNumber}</td>
                    <td>${app.email}</td>
                    <td>${app.concern}</td>
                    <td>${app.ageGroup}</td>
                    <td><span class="badge-status badge-past">Completed</span></td>
                </tr>
            `;
        });
    }

    data.forEach(app => {
        const key = app.email ? app.email.toLowerCase() : app.whatsappNumber;
        if (!userMap[key]) {
            userMap[key] = {
                name: app.name,
                phone: app.whatsappNumber,
                email: app.email,
                gender: app.gender,
                ageGroup: app.ageGroup,
                count: 1,
                lastDate: app.appointmentDate
            };
        } else {
            userMap[key].count += 1;
            if (app.appointmentDate > userMap[key].lastDate) {
                userMap[key].lastDate = app.appointmentDate;
            }
        }
    });

    const users = Object.values(userMap);
    if (users.length === 0) {
        usersTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No users directory data.</td></tr>';
    } else {
        users.forEach(u => {
            usersTbody.innerHTML += `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.phone}</td>
                    <td>${u.email}</td>
                    <td>${u.gender}</td>
                    <td>${u.ageGroup}</td>
                    <td><span class="badge-status badge-upcoming">${u.count} Session(s)</span></td>
                    <td>${u.lastDate}</td>
                </tr>
            `;
        });
    }
}

function filterData() {
    const query = document.getElementById('adminSearchInput').value.toLowerCase();
    const filtered = allAppointments.filter(app => 
        (app.name && app.name.toLowerCase().includes(query)) ||
        (app.whatsappNumber && app.whatsappNumber.includes(query)) ||
        (app.email && app.email.toLowerCase().includes(query)) ||
        (app.concern && app.concern.toLowerCase().includes(query))
    );
    renderTables(filtered);
}

// Form Handlers
document.getElementById('profileForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('profName').value,
        title: document.getElementById('profTitle').value,
        bio: document.getElementById('profBio').value,
        email: document.getElementById('profEmail').value,
        phone: document.getElementById('profPhone').value
    };
    const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert(data.message);
    closeEditModal('profileModal');
    loadAdminData();
};

document.getElementById('picForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profilePic', document.getElementById('picFile').files[0]);
    const res = await fetch('/api/admin/upload-profile-pic', { method: 'POST', body: formData });
    const data = await res.json();
    alert(data.message);
    closeEditModal('picModal');
    loadAdminData();
};

document.getElementById('certForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById('certTitle').value,
        description: document.getElementById('certDesc').value
    };
    const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert(data.message);
    closeEditModal('certModal');
    document.getElementById('certForm').reset();
    loadAdminData();
};

document.getElementById('galleryForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('galTitle').value);
    formData.append('galleryImage', document.getElementById('galFile').files[0]);
    const res = await fetch('/api/admin/upload-gallery', { method: 'POST', body: formData });
    const data = await res.json();
    alert(data.message);
    closeEditModal('galleryModal');
    document.getElementById('galleryForm').reset();
    loadAdminData();
};

async function deleteGalleryItem(id) {
    if(!confirm('Delete this photo from the gallery?')) return;
    const res = await fetch('/api/admin/gallery/' + id, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    loadAdminData();
}

document.addEventListener('DOMContentLoaded', loadAdminData);