// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navCta = document.querySelector('.nav-cta');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');

        if (isOpen) {
            navMenu.classList.remove('active');
            navCta.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            navMenu.classList.add('active');
            navCta.classList.add('active');
            mobileMenuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navCta.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});


// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString('id-ID');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('id-ID');
        }
    };

    updateCounter();
};

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('K+')) {
                    const number = parseInt(text.replace(/[^\d]/g, ''));
                    stat.textContent = '0';
                    setTimeout(() => {
                        let current = 0;
                        const increment = number / 50;
                        const interval = setInterval(() => {
                            current += increment;
                            if (current >= number) {
                                stat.textContent = number + 'K+';
                                clearInterval(interval);
                            } else {
                                stat.textContent = Math.floor(current) + 'K+';
                            }
                        }, 30);
                    }, 200);
                } else if (text.includes('M+')) {
                    const number = parseInt(text.replace(/[^\d]/g, ''));
                    stat.textContent = '0';
                    setTimeout(() => {
                        let current = 0;
                        const increment = number / 50;
                        const interval = setInterval(() => {
                            current += increment;
                            if (current >= number) {
                                stat.textContent = number + 'M+';
                                clearInterval(interval);
                            } else {
                                stat.textContent = Math.floor(current) + 'M+';
                            }
                        }, 30);
                    }, 200);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Add loading class removal
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Mobile menu styles injection
const style = document.createElement('style');
style.textContent = `
    .nav-menu.active {
        display: flex;
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        flex-direction: column;
        background: white;
        padding: 2rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        z-index: 999;
    }

    .nav-cta.active {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem 1.5rem;
        background: white;
        border-top: 1px solid var(--border);
        z-index: 999;
    }

    .nav-cta.active .btn {
        width: 100%;
    }

    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Enhanced phone mockup interaction
const mockupPhone = document.querySelector('.mockup-phone');
if (mockupPhone) {
    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;

        if (mockupPhone.getBoundingClientRect().top < window.innerHeight) {
            mockupPhone.style.transform = `translateY(${-rate}px)`;
        }
    });

    // Tilt effect on mouse move (desktop only)
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            const hero = document.querySelector('.hero');
            if (!hero) return;

            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const tiltX = (y - 0.5) * 10;
            const tiltY = (x - 0.5) * -10;

            mockupPhone.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        // Reset tilt when mouse leaves
        document.querySelector('.hero')?.addEventListener('mouseleave', () => {
            mockupPhone.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }
}

// CTA button tracking (placeholder for analytics)
const ctaButtons = document.querySelectorAll('.btn-primary');
ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonText = button.textContent.trim();
        console.log('CTA Clicked:', buttonText);
        // Add your analytics tracking here
        // Example: gtag('event', 'click', { 'button_text': buttonText });
    });
});

// Feature card hover is now handled purely by CSS 3D transforms.

// === GSAP Scroll Effects & Animations ===

if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Animation
    const heroTimeline = gsap.timeline({
        onComplete: () => {
            document.querySelectorAll('.btn').forEach(btn => btn.classList.add('ready'));
        }
    });
    
    heroTimeline.from('.hero-title', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .from('.hero-description', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-cta .btn', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
    }, '-=0.4');

    // Features Section
    gsap.utils.toArray('.feature-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            onComplete: () => card.classList.add('ready')
        });
    });

    // Benefits Section
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach((item, index) => {
        const direction = item.classList.contains('reverse') ? -50 : 50;
        
        gsap.from(item.querySelector('.benefit-content'), {
            scrollTrigger: {
                trigger: item,
                start: 'top 75%',
            },
            x: direction,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.from(item.querySelector('.benefit-visual'), {
            scrollTrigger: {
                trigger: item,
                start: 'top 75%',
            },
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2
        });
    });

    // How It Works Section
    gsap.from('.step', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    });

    gsap.from('.step-connector', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 80%',
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: 'back.out(2)',
        delay: 0.4
    });

    // Testimonial Section
    if (document.querySelector('.testimonial-card')) {
        gsap.utils.toArray('.testimonial-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                onComplete: () => card.classList.add('ready')
            });
        });
    }

    // CTA Section
    gsap.from('.cta-content', {
        scrollTrigger: {
            trigger: '.cta',
            start: 'top 80%',
        },
        scale: 0.9,
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });

}

// Smooth navbar behavior
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 200 && currentScroll > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
});

// Parallax for ambient blobs
window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    gsap.to('.blob-1', {
        x: mouseX * 100,
        y: mouseY * 100,
        duration: 2,
        ease: 'power2.out'
    });
    
    gsap.to('.blob-2', {
        x: mouseX * -80,
        y: mouseY * -80,
        duration: 2,
        ease: 'power2.out'
    });
    
    gsap.to('.blob-3', {
        x: mouseX * 60,
        y: mouseY * -60,
        duration: 2,
        ease: 'power2.out'
    });
});

// === Floating Particles System ===
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0, mouseY = 0;
    let particles = [];
    const PARTICLE_COUNT = 45;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Track mouse for subtle interaction
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
            // Start at random Y so they don't all appear from the bottom
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedY = -(Math.random() * 0.4 + 0.15);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.fadeSpeed = Math.random() * 0.002 + 0.001;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
            this.wobbleAmplitude = Math.random() * 30 + 10;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.life = 0;
            // Color: mix of primary (indigo) and secondary (green)
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                this.color = `rgba(99, 102, 241, ${this.opacity})`; // primary
            } else if (colorChoice < 0.8) {
                this.color = `rgba(129, 140, 248, ${this.opacity})`; // primary-light
            } else {
                this.color = `rgba(16, 185, 129, ${this.opacity})`; // secondary
            }
        }

        update() {
            this.life += this.fadeSpeed;
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.life * 10 + this.wobbleOffset) * 0.15;

            // Subtle mouse repulsion for depth
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150 * 0.3;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }

            // Fade in/out
            const fadeIn = Math.min(this.life * 5, 1);
            const fadeOut = this.y < 50 ? this.y / 50 : 1;
            this.currentOpacity = this.opacity * fadeIn * fadeOut;

            if (this.y < -10 || this.currentOpacity <= 0) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.currentOpacity})`);
            ctx.fill();

            // Soft glow for larger particles
            if (this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.currentOpacity * 0.1})`);
                ctx.fill();
            }
        }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
})();

// === Section Parallax Depth Effect ===
(function initSectionParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return; // Skip on mobile for perf

    const sections = document.querySelectorAll('.features, .benefits, .how-it-works');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const offset = (scrollY - sectionTop) * 0.03;

            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.style.transform = `translateY(${offset}px)`;
            }
        });
    }, { passive: true });
})();

console.log('🎉 MyMo landing page with GSAP 3D effects & immersive wallpaper loaded!');
