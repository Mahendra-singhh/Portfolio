// ==========================================
// 1. Mobile Hamburger Menu Toggle
// ==========================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
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
// 4. Payment Interface Controls
// ==========================================
function initiatePayment(planName, price) {
    const payTitle = document.getElementById('pay-plan-title');
    const payAmount = document.getElementById('pay-plan-amount');
    const modal = document.getElementById('paymentModal');

    if (payTitle && payAmount && modal) {
        payTitle.innerText = `Selected Plan: ${planName}`;
        payAmount.innerText = `₹${price}`;
        modal.style.display = 'flex';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// 5. Form Submissions
// ==========================================

// Appointment Form Handler
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

// Load Approved Testimonials
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
// 6. Initialize on Page Load & Bind Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    loadDynamicContent();
    setupDateLimits();
    loadTestimonials();

    // Bind Appointment Form Listener
    const appForm = document.getElementById('appointmentForm') || document.getElementById('appointment-form');
    if (appForm) {
        appForm.addEventListener('submit', handleFormSubmit);
    }

    // Bind Payment Form Listener
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('pay-name').value;
            const phone = document.getElementById('pay-phone').value;
            const planText = document.getElementById('pay-plan-title').innerText;
            const priceText = document.getElementById('pay-plan-amount').innerText;

            const message = `Hello Puneesh Kumar, I want to confirm payment for session plan.\n\n*Plan:* ${planText}\n*Amount:* ${priceText}\n*Name:* ${name}\n*Phone:* ${phone}`;
            const trainerPhone = "918795296754";
            const waUrl = `https://wa.me/${trainerPhone}?text=${encodeURIComponent(message)}`;

            closePaymentModal();
            window.open(waUrl, '_blank');
        });
    }

    // Bind Testimonial Form Listener (with Photo Support)
    const testiForm = document.getElementById('testimonial-form');
    if (testiForm) {
        testiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('name', document.getElementById('testi-name').value);
            formData.append('rating', document.getElementById('testi-rating').value);
            formData.append('message', document.getElementById('testi-message').value);
            
            const imageInput = document.getElementById('testi-image');
            if (imageInput && imageInput.files[0]) {
                formData.append('clientImage', imageInput.files[0]);
            }

            try {
                const res = await fetch('/api/content/testimonials', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                alert(data.message || 'Thank you! Your review has been submitted for approval.');
                e.target.reset();
            } catch (err) {
                console.error('Testimonial submission error:', err);
                alert('Failed to submit review.');
            }
        });
    }
});