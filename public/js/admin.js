let allAppointments = [];
let currentFilter = 'upcoming';

// ==========================================
// 1. Sidebar Navigation Toggle
// ==========================================
function initSidebarNav() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.admin-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = item.getAttribute('data-section');

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active-section'));
            
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active-section');
            }

            if (pageTitle) {
                pageTitle.innerText = item.querySelector('span')?.innerText || 'Admin Panel';
            }
        });
    });
}

// ==========================================
// 2. Fetch Appointments & Render Table
// ==========================================
async function loadAppointments() {
    try {
        const res = await fetch('/api/appointments');
        const data = await res.json();
        
        if (Array.isArray(data)) {
            allAppointments = data;
        } else if (data.success && Array.isArray(data.appointments)) {
            allAppointments = data.appointments;
        } else if (Array.isArray(data.data)) {
            allAppointments = data.data;
        } else {
            allAppointments = [];
        }

        renderAppointments();
    } catch (err) {
        console.error('Failed to load appointments:', err);
    }
}

function renderAppointments() {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;

    const searchTerm = document.getElementById('appointment-search')?.value.toLowerCase().trim() || '';
    
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let filtered = allAppointments.filter(app => {
        const matchesSearch = !searchTerm || 
            (app.name && app.name.toLowerCase().includes(searchTerm)) ||
            (app.whatsappNumber && app.whatsappNumber.includes(searchTerm)) ||
            (app.email && app.email.toLowerCase().includes(searchTerm)) ||
            (app.concern && app.concern.toLowerCase().includes(searchTerm));

        if (!matchesSearch) return false;

        let appDate = app.appointmentDate || '';
        if (appDate.includes('-') && appDate.split('-')[0].length === 2) {
            const parts = appDate.split('-');
            appDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        if (currentFilter === 'upcoming') {
            return appDate >= localToday;
        } else if (currentFilter === 'previous') {
            return appDate < localToday;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:2.5rem; color:#6c757d; font-weight:500;">
                    No ${currentFilter} appointments found.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(app => `
        <tr>
            <td>
                <strong>${app.appointmentDate || 'N/A'}</strong>
                ${app.appointmentTime ? `<br><small style="color:#666;">${app.appointmentTime}</small>` : ''}
            </td>
            <td><strong>${app.name || 'N/A'}</strong></td>
            <td>${app.whatsappNumber || 'N/A'}</td>
            <td>${app.email || 'N/A'}</td>
            <td>${app.concern || 'General'}</td>
            <td>${app.ageGroup || 'N/A'}</td>
            <td>${app.gender || 'N/A'}</td>
            <td>
                <a href="https://wa.me/91${app.whatsappNumber}?text=Hello%20${encodeURIComponent(app.name || '')}," target="_blank" class="whatsapp-btn">
                    <i class="fa-brands fa-whatsapp"></i> Chat
                </a>
            </td>
        </tr>
    `).join('');
}

function switchTab(tabType, element) {
    currentFilter = tabType;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    } else if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
    
    renderAppointments();
}

function filterAppointments() {
    renderAppointments();
}

// ==========================================
// ==========================================
// Render Gallery Cards with ID-based Deletion
// ==========================================
async function loadDynamicAdminContent() {
    try {
        const res = await fetch(`/api/content?t=${Date.now()}`); // Force fresh fetch
        const result = await res.json();

        if (result.success && result.data) {
            const content = result.data;

            // Load Profile Text & Picture
            if (content.profile) {
                const nameInput = document.getElementById('prof-name-input');
                const titleInput = document.getElementById('prof-title-input');
                const bioInput = document.getElementById('prof-bio-input');
                const currentPic = document.getElementById('current-profile-pic');

                if (nameInput) nameInput.value = content.profile.name || '';
                if (titleInput) titleInput.value = content.profile.title || '';
                if (bioInput) bioInput.value = content.profile.bio || '';
                if (currentPic && content.profile.profilePic) currentPic.src = content.profile.profilePic;
            }

            // Load Certifications
            const certsList = document.getElementById('admin-certs-list');
            if (certsList && content.certifications) {
                certsList.innerHTML = content.certifications.map(c => `
                    <li><i class="fa-solid fa-award"></i> <strong>${c.title}:</strong> ${c.description}</li>
                `).join('');
            }

            // Load Gallery Items
            const galleryGrid = document.getElementById('admin-gallery-grid');
            if (galleryGrid) {
                if (content.gallery && content.gallery.length > 0) {
                    galleryGrid.innerHTML = content.gallery.map((item, index) => {
                        // Pass unique ID if available, otherwise fall back to encoded imageUrl or index
                        const targetKey = item._id || encodeURIComponent(item.imageUrl) || index;
                        
                        return `
                            <div class="gallery-card" style="background:#fff; border:1px solid #e2ebe5; border-radius:10px; overflow:hidden; margin-bottom:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                                <img src="${item.imageUrl}" style="width:100%; height:180px; object-fit:cover; display:block;">
                                <div style="padding: 0.8rem 1rem; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:0.9rem; font-weight:600; color:#2b4336;">${item.title || 'Untitled'}</span>
                                    <button type="button" onclick="deleteGalleryImage('${targetKey}')" style="background:#d9534f; color:#ffffff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.8rem;">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    galleryGrid.innerHTML = '<p style="color:#666; text-align:center; grid-column: 1 / -1;">No photos in gallery yet.</p>';
                }
            }
        }
    } catch (err) {
        console.error('Failed to load dynamic admin content:', err);
    }
}

// Function to handle image deletion request
async function deleteGalleryImage(targetKey) {
    if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;

    try {
        const res = await fetch(`/api/admin/gallery/${targetKey}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        
        if (data.success) {
            alert('Photo deleted permanently!');
            await loadDynamicAdminContent(); // Refresh grid dynamically
        } else {
            alert('Delete failed: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error('Delete request error:', err);
        alert('Server error while deleting photo.');
    }
}

// Global Refresh Helper
function loadAdminData() {
    loadAppointments();
    loadDynamicAdminContent();
}

// ==========================================
// 4. Initialize & Form Bindings
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initSidebarNav();
    loadAppointments();
    loadDynamicAdminContent();

    // Credentials Form
    document.getElementById('change-credentials-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('new-admin-user').value.trim();
        const newPassword = document.getElementById('new-admin-pass').value.trim();

        if (!newUsername || !newPassword) {
            alert('Please provide both username and password.');
            return;
        }

        try {
            const res = await fetch('/api/admin/change-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUsername, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Credentials updated successfully!');
                e.target.reset();
            } else {
                alert('Error: ' + (data.message || 'Failed to update credentials.'));
            }
        } catch (err) {
            console.error('Credential update error:', err);
            alert('Server error.');
        }
    });

    // Profile Details Form
    document.getElementById('admin-profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('prof-name-input').value,
            title: document.getElementById('prof-title-input').value,
            bio: document.getElementById('prof-bio-input').value
        };

        const res = await fetch('/api/admin/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || 'Profile details saved!');
    });

    // Profile Picture Upload
    document.getElementById('profile-pic-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('profile-pic-input');
        if (!fileInput.files[0]) {
            alert('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePic', fileInput.files[0]);

        try {
            const res = await fetch('/api/admin/upload-profile-pic', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                alert('Profile picture updated!');
                document.getElementById('current-profile-pic').src = data.url;
                e.target.reset();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed.');
        }
    });

    // Certification Form
    document.getElementById('admin-cert-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('cert-title-input').value,
            description: document.getElementById('cert-desc-input').value
        };

        const res = await fetch('/api/admin/certifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || 'Certification added!');
        e.target.reset();
        loadDynamicAdminContent();
    });

    // Gallery Upload Form
    document.getElementById('admin-gallery-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('gallery-title-input').value);
        formData.append('galleryImage', document.getElementById('gallery-file-input').files[0]);

        const res = await fetch('/api/admin/upload-gallery', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        alert(data.message || 'Photo uploaded!');
        e.target.reset();
        loadDynamicAdminContent();
    });
});