// ==========================================
// 1. Mobile Hamburger Menu Toggle
// ==========================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    // Flexible selector to handle both MPA (<nav class="nav-menu">) and SPA (header nav ul)
    const navMenu = document.getElementById('nav-menu') || document.querySelector('header nav ul') || document.querySelector('header nav');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking any nav link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside of navbar
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && e.target !== menuBtn) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// ==========================================
// 2. Load Dynamic Content from DB
// ==========================================
async function loadDynamicContent() {
    try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success && result.data) {
            const content = result.data;
            const prof = content.profile;

            if (prof) {
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
                    const bioEl = document.getElementById('profBioText') || document.getElementById('about-bio-text');
                    if (bioEl) bioEl.innerText = prof.bio;
                }
                if (prof.profilePic) {
                    const profileImgEl = document.getElementById('profileImageDisplay') || document.getElementById('about-profile-img');
                    if (profileImgEl) {
                        if (profileImgEl.tagName === 'IMG') {
                            profileImgEl.src = prof.profilePic;
                        } else {
                            profileImgEl.style.backgroundImage = `url('${prof.profilePic}')`;
                        }
                    }
                }
            }

            // Render Certifications
            const certsList = document.getElementById('dynamicCertsList') || document.getElementById('certifications-list');
            if (certsList && content.certifications && content.certifications.length > 0) {
                certsList.innerHTML = '';
                content.certifications.forEach(c => {
                    certsList.innerHTML += `
                        <li><i class="fa-solid fa-award"></i> <strong>${c.title}:</strong> ${c.description}</li>
                    `;
                });
            }

            // Render Gallery Items
            const galleryGrid = document.getElementById('dynamicGalleryGrid') || document.getElementById('gallery-container');
            if (galleryGrid && content.gallery && content.gallery.length > 0) {
                galleryGrid.innerHTML = '';
                content.gallery.forEach(item => {
                    galleryGrid.innerHTML += `
                        <div class="gallery-item">
                            <img src="${item.imageUrl}" alt="${item.title}" style="width:100%; height:220px; object-fit:cover;">
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

// ==========================================
// 3. Date Limits & Modal Controls
// ==========================================
function setupDateLimits() {
    const dateInput = document.getElementById('appointmentDate') || document.getElementById('app-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
}

function openModal() {
    setupDateLimits();
    const modal = document.getElementById('appointmentModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) modal.style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target === modal) {
        closeModal();
    }
};

// ==========================================
// 4. Form Submissions (Appointments & Reviews)
// ==========================================
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';
    }

    const name = document.getElementById('name')?.value || document.getElementById('app-name')?.value;
    const whatsappNumber = document.getElementById('whatsappNumber')?.value || document.getElementById('app-phone')?.value;
    const email = document.getElementById('email')?.value || '';
    const appointmentDate = document.getElementById('appointmentDate')?.value || document.getElementById('app-date')?.value;
    const appointmentTime = document.getElementById('appointmentTime')?.value || '10:00 AM';
    const concern = document.getElementById('concern')?.value || document.getElementById('app-plan')?.value || 'General Yoga Session';
    const ageGroup = document.getElementById('ageGroup')?.value || 'Not Specified';
    const gender = document.getElementById('gender')?.value || 'Not Specified';

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
            
            const message = `Hello Puneesh Kumar, I have booked an appointment.\n\n*Name:* ${name}\n*Date:* ${appointmentDate} at ${appointmentTime}\n*Concern/Plan:* ${concern}`;
            const trainerPhone = "918795296754";
            const waUrl = `https://wa.me/${trainerPhone}?text=${encodeURIComponent(message)}`;

            e.target.reset();
            closeModal();
            window.open(waUrl, '_blank');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Submission Error:', error);
        alert('Server error. Ensure backend is running.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Appointment';
        }
    }
}

// Testimonials
async function loadTestimonials() {
    const list = document.getElementById('testimonials-list');
    if (!list) return;

    try {
        const res = await fetch('/api/content/testimonials');
        const testimonials = await res.json();

        if (Array.isArray(testimonials) && testimonials.length > 0) {
            list.innerHTML = testimonials.map(t => `
                <div class="testimonial-card">
                    <h4>${t.name} <small>(${t.roleOrCity || 'Client'})</small></h4>
                    <p>Rating: ${'⭐'.repeat(t.rating || 5)}</p>
                    <p>"${t.message}"</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load testimonials:', err);
    }
}

// ==========================================
// 5. Initialize on Page Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    loadDynamicContent();
    setupDateLimits();
    loadTestimonials();

    // Bind Appointment Form Submit Listener
    const appForm = document.getElementById('appointmentForm') || document.getElementById('appointment-form');
    if (appForm) {
        appForm.addEventListener('submit', handleFormSubmit);
    }

    // Bind Testimonial Form Submit Listener
    const testiForm = document.getElementById('testimonial-form');
    if (testiForm) {
        testiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('testi-name').value,
                roleOrCity: document.getElementById('testi-role').value,
                rating: document.getElementById('testi-rating').value,
                message: document.getElementById('testi-message').value
            };

            const res = await fetch('/api/content/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            alert(data.message || 'Review submitted!');
            e.target.reset();
        });
    }
});