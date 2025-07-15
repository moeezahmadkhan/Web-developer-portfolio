// At the very top of your script.js file
// If using a build tool like Vite/Webpack/Rollup (recommended):
import { createClient } from '@supabase/supabase-js';

// If NOT using a build tool and just linking script.js directly in HTML,
// uncomment the line below and comment out the line above.
// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


// Ensure all DOM elements are loaded before running the script
document.addEventListener('DOMContentLoaded', function() {

    // --- Navigation functionality ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Skill Bar Animation ---
    const skillBars = document.querySelectorAll('.skill-progress');
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            // Only animate if it has a data-percent attribute
            if (bar.dataset.percent) {
                const percent = bar.getAttribute('data-percent');
                bar.style.width = percent + '%';
            }
        });
    };

    // --- Intersection Observer for section animations ---
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '0px 0px -50px 0px' // Offset the bottom by 50px
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Animate skill bars specifically when the skills section is visible
                if (entry.target.classList.contains('skills')) {
                    // Use setTimeout to ensure animation applies after class is added
                    setTimeout(animateSkillBars, 300);
                }
                // Optional: Stop observing once animated
                // obs.unobserve(entry.target);
            } else {
                // Optional: Remove 'animated' class if you want animations to reset on scroll out
                // entry.target.classList.remove('animated');
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll'); // Add a base class for styling animations
        observer.observe(section);
    });

    // --- Parallax effect for hero section floating elements ---
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.float-element');

        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1); // Different speeds for different elements
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // --- Mouse move effect for hero section ---
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', function(e) {
            const { clientX, clientY } = e;
            const { left, top, width, height } = hero.getBoundingClientRect();

            const x = (clientX - left) / width; // X position relative to element (0-1)
            const y = (clientY - top) / height; // Y position relative to element (0-1)

            const floatingElements = document.querySelectorAll('.float-element');
            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.02; // Different sensitivity for elements
                const moveX = (x - 0.5) * speed * 100; // Calculate movement relative to center
                const moveY = (y - 0.5) * speed * 100;

                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });

        hero.addEventListener('mouseleave', function() {
            const floatingElements = document.querySelectorAll('.float-element');
            floatingElements.forEach(element => {
                element.style.transform = 'translate(0, 0)'; // Reset position on mouse leave
            });
        });
    }

    // ==========================================================
    // SUPABASE INTEGRATION FOR CONTACT FORM
    // ==========================================================

    // Supabase Configuration - Access from environment variables
    // IMPORTANT: Make sure your .env file is correctly set up with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log("Supabase URL in script:", SUPABASE_URL);       // This line
    console.log("Supabase Anon Key in script:", SUPABASE_ANON_KEY); // And this line

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Keep this line (it was line 151)


    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';

    // Create a paragraph element to display form status messages
    const formStatusMessage = document.createElement('p');
    formStatusMessage.style.textAlign = 'center';
    formStatusMessage.style.marginTop = '15px';
    formStatusMessage.style.fontSize = '1.1em';
    formStatusMessage.style.fontWeight = 'bold';
    formStatusMessage.style.transition = 'color 0.3s ease-in-out'; // Smooth color transition

    // Append the status message element to the DOM, after the form
    if (contactForm) {
        contactForm.after(formStatusMessage);

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent the default form submission (page reload)

            // Clear previous messages
            formStatusMessage.textContent = '';

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // --- Client-side Validation ---
            if (!name || !email || !subject || !message) {
                formStatusMessage.textContent = 'Please fill in all fields.';
                formStatusMessage.style.color = 'orange'; // Indicate warning
                return;
            }

            if (!isValidEmail(email)) {
                formStatusMessage.textContent = 'Please enter a valid email address.';
                formStatusMessage.style.color = 'orange'; // Indicate warning
                return;
            }

            // --- UI Feedback during submission ---
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }
            formStatusMessage.textContent = 'Sending message...';
            formStatusMessage.style.color = '#fff'; // White text for processing

            // --- Supabase API Call ---
            try {
                const { data, error } = await supabase
                    .from('contacts') // Ensure 'contacts' is the exact name of your table in Supabase
                    .insert([
                        { name: name, email: email, subject: subject, message: message }
                    ]);

                if (error) {
                    console.error('Error submitting form to Supabase:', error.message);
                    formStatusMessage.textContent = 'Failed to send message. Please try again later.';
                    formStatusMessage.style.color = 'red';
                } else {
                    console.log('Message sent successfully:', data);
                    formStatusMessage.textContent = 'Message sent successfully! I will get back to you soon.';
                    formStatusMessage.style.color = 'green';
                    contactForm.reset(); // Clear the form fields after success
                }
            } catch (unexpectedError) {
                console.error('An unexpected error occurred during submission:', unexpectedError);
                formStatusMessage.textContent = 'An unexpected error occurred. Please try again later.';
                formStatusMessage.style.color = 'red';
            } finally {
                // Always reset button state regardless of success or failure
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // --- Utility Functions ---
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- Typing effect for hero title ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        heroTitle.innerHTML = ''; // Clear original text to start typing

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.innerHTML += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Typing speed
            }
        };

        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }

    // --- Add hover effect to project cards ---
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)'; // Enhanced shadow
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)'; // Original shadow
        });
    });

    // --- Add click effect (ripple) to buttons ---
    const buttons = document.querySelectorAll('.btn, .project-link'); // Also apply to project links
    buttons.forEach(button => {
        button.style.position = 'relative'; // Ensure button can contain ripple
        button.style.overflow = 'hidden';   // Hide overflow of ripple
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height); // Size based on button dimensions
            // Calculate click position relative to button for ripple origin
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3); /* White ripple */
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none; /* Make sure ripple doesn't interfere with clicks */
            `;

            this.appendChild(ripple); // Add ripple to the button

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add CSS for ripple animation dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // --- Preloader (optional) ---
    // Make sure your CSS has a preloader and a 'loaded' class
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

}); // End of DOMContentLoaded

// --- Global Utility Functions (outside DOMContentLoaded if needed globally) ---

// Debounce function: limits how often a function can run
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function: ensures a function runs at most once per a given time period
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// --- Add scroll progress indicator ---
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(45deg, #06b6d4, #8b5cf6); /* Your gradient color */
    z-index: 9999;
    transition: width 0.3s ease;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', throttle(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Use document.documentElement.scrollHeight for full document height
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
}, 10)); // Throttle to prevent excessive calls on scroll