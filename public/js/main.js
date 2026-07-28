// --- Load Dynamic Content from DB on Startup ---
async function loadDynamicContent() {
    try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success && result.data) {
            const content = result.data;
            const prof = content.profile;

            if (prof.name) {
                document.querySelectorAll('.prof-name-text').forEach(el => el.innerText = prof.name);
            }
            if (prof.title) {
                document.querySelectorAll('.prof-title-text').forEach(el => el.innerText = prof.title);
            }
            if (prof.tagline) {
                const taglineEl = document.getElementById('profTagline');
                if (taglineEl) taglineEl.innerText = prof.tagline;
            }
            if (prof.bio) {
                const bioEl = document.getElementById('profBioText');
                if (bioEl) bioEl.innerText = prof.bio;
            }

            if (prof.profilePic) {
                const profileImgEl = document.getElementById('profileImageDisplay');
                if (profileImgEl) profileImgEl.style.backgroundImage = `url('${prof.profilePic}')`;
            }

            const certsList = document.getElementById('dynamicCertsList');
            if (certsList && content.certifications) {
                certsList.innerHTML = '';
                content.certifications.forEach(c => {
                    certsList.innerHTML += `
                        <li><i class="fa-solid fa-award"></i> <strong>${c.title}:</strong> ${c.description}</li>
                    `;
                });
            }

            const galleryGrid = document.getElementById('dynamicGalleryGrid');
            if (galleryGrid && content.gallery && content.gallery.length > 0) {
                galleryGrid.innerHTML = '';
                content.gallery.forEach(item => {
                    galleryGrid.innerHTML += `
                        <div class="gallery-item">
                            <img src="${item.imageUrl}" style="width:100%; height:220px; object-fit:cover;">
                            <div class="gallery-caption">${item.title}</div>
                        </div>
                    `;
                });
            }
        }
    } catch (err) {
        console.error('Failed to load dynamic content:', err);
    }
}

// --- Set Minimum Selectable Date to Today ---
function setupDateLimits() {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today; // Prevents picking past dates in browser calendar
        dateInput.value = today; // Sets default value to today
    }
}

// Execute on Page Load
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
    setupDateLimits();
});

// --- Page Navigation ---
function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (!link.classList.contains('btn-nav-book')) {
            link.classList.remove('active');
        }
    });

    const activeNav = document.getElementById('nav-' + pageId);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Modal Control ---
function openModal() {
    setupDateLimits();
    document.getElementById('appointmentModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target === modal) {
        closeModal();
    }
};

// --- Form Submission to Backend API ---
// --- Form Submission to Backend API + WhatsApp Redirect ---
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    const name = document.getElementById('name').value;
    const whatsappNumber = document.getElementById('whatsappNumber').value;
    const email = document.getElementById('email').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const concern = document.getElementById('concern').value;
    const ageGroup = document.getElementById('ageGroup').value;
    const gender = document.getElementById('gender').value;

    const formData = { name, whatsappNumber, email, appointmentDate, appointmentTime, concern, ageGroup, gender };

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Appointment submitted successfully!');
            
            // Construct direct WhatsApp URL for Puneesh's WhatsApp
            const message = `Hello Puneesh Kumar, I have booked an appointment.\n\n*Name:* ${name}\n*Date:* ${appointmentDate} at ${appointmentTime}\n*Concern:* ${concern}\n*Age Group:* ${ageGroup}\n*Gender:* ${gender}`;
            const trainerPhone = "918795296754"; // Replace with Puneesh's actual phone number
            const waUrl = `https://wa.me/${trainerPhone}?text=${encodeURIComponent(message)}`;

            document.getElementById('appointmentForm').reset();
            closeModal();

            // Open WhatsApp in a new tab to notify Puneesh immediately
            window.open(waUrl, '_blank');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Submission Error:', error);
        alert('Server error. Ensure backend and MongoDB are running.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Appointment';
    }
}
// Mobile Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navUl = document.querySelector('header nav ul');

    if (menuBtn && navUl) {
        menuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });

        // Close menu when a link inside is clicked
        navUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navUl.classList.remove('active');
            });
        });
    }
});