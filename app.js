// Modern iOS-Style Portfolio App
class PortfolioApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.isMenuOpen = false;
        this.observers = [];
        this.init();
    }

    init() {
        this.initializeTheme();
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.animateSkillBars();
        this.setupFormHandling();
        this.setupNavigation();
        this.setupProjectCards();
    }

    // Theme Management
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        this.simulateHapticFeedback();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    // Haptic Feedback Simulation
    simulateHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        const button = document.getElementById('theme-toggle');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.isMenuOpen = !this.isMenuOpen;
                navMenu.classList.toggle('active', this.isMenuOpen);
                navToggle.classList.toggle('active', this.isMenuOpen);
            });
        }

        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
                if (navToggle) {
                    navToggle.classList.remove('active');
                }
                this.isMenuOpen = false;
            });
        });

        // System theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.initializeTheme();
            }
        });

        // Resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.updateLayout();
        }, 250));

        // Scroll handler for nav effects
        let lastScrollTop = 0;
        window.addEventListener('scroll', this.debounce(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const nav = document.getElementById('navigation');

            if (nav) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    nav.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    nav.style.transform = 'translateY(0)';
                }
            }

            lastScrollTop = scrollTop;
        }, 10));
    }

    // Smooth Scrolling
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const navHeight = document.getElementById('navigation').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px',
            threshold: 0.1
        };

        // Animate elements when they come into view
        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections
        const sections = document.querySelectorAll('.section');
        sections.forEach((section) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animateOnScroll.observe(section);
        });

        // Update active nav link
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.updateActiveNavLink(id);
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px'
        });

        const sectionsWithId = document.querySelectorAll('section[id]');
        sectionsWithId.forEach((section) => {
            navObserver.observe(section);
        });

        this.observers.push(animateOnScroll, navObserver);
    }

    updateActiveNavLink(activeId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // Skill bars animation
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const progress = skillBar.getAttribute('data-progress');

                    setTimeout(() => {
                        skillBar.style.width = `${progress}%`;
                    }, 200);

                    skillObserver.unobserve(skillBar);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach((bar) => {
            skillObserver.observe(bar);
        });

        this.observers.push(skillObserver);
    }

    // Project cards interaction
    setupProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach((card) => {
            // Touch events for mobile
            card.addEventListener('touchstart', () => {
                card.classList.add('touched');
            });

            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.classList.remove('touched');
                }, 300);
            });

            // Mouse events for desktop
            card.addEventListener('mouseenter', () => {
                this.simulateHapticFeedback();
            });
        });
    }

    // Form handling
    setupFormHandling() {
        const contactForm = document.querySelector('.contact-form');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });

            // Input animations
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach((input) => {
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });

                input.addEventListener('blur', () => {
                    if (!input.value) {
                        input.parentElement.classList.remove('focused');
                    }
                });

                // Check if input has value on load
                if (input.value) {
                    input.parentElement.classList.add('focused');
                }
            });
        }
    }

    handleFormSubmission(form) {
        const submitButton = form.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;

        // Show loading state
        submitButton.innerHTML = '<span class="btn-icon">⏳</span>Sending...';
        submitButton.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Success state
            submitButton.innerHTML = '<span class="btn-icon">✅</span>Message Sent!';
            submitButton.style.background = 'var(--accent-color)';

            // Reset form
            form.reset();

            // Reset button after delay
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                submitButton.style.background = '';
            }, 3000);
        }, 2000);
    }

    // Navigation management
    setupNavigation() {
        const nav = document.getElementById('navigation');
        if (nav) {
            nav.style.transition = 'transform 0.3s ease';
        }
    }

    // Layout updates
    updateLayout() {
        // Recalculate any layout-dependent features
        const heroCard = document.querySelector('.hero-card');
        if (heroCard && window.innerWidth <= 768) {
            heroCard.style.padding = 'var(--spacing-lg)';
        }
    }

    // Utility functions
    debounce(func, wait) {
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

    // Cleanup
    destroy() {
        this.observers.forEach((observer) => {
            observer.disconnect();
        });
        this.observers = [];
    }
}

// Enhanced scroll reveal animation
class ScrollReveal {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.setupObserver();
        this.observeElements();
    }

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.revealElement(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });
    }

    observeElements() {
        const elements = document.querySelectorAll(`
            .about-card,
            .project-card,
            .skill-category,
            .experience-card,
            .education-card,
            .contact-card,
            .contact-form
        `);

        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            this.observer.observe(el);
        });
    }

    revealElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        this.observer.unobserve(element);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
    window.scrollReveal = new ScrollReveal();

    // Add some additional iOS-like interactions
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('btn')) {
            e.target.style.transform = 'scale(0.98)';
        }
    });

    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('btn')) {
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
            }, 150);
        }
    });

    // Prevent zoom on double tap for iOS-like feel
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Service Worker registration for PWA-like experience
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, ScrollReveal };
}