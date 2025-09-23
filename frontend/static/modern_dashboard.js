// Modern Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const profileIcon = document.getElementById('profileIcon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const mobileProfileIcon = document.getElementById('m-profile-icon');
    
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    
    if (mobileProfileIcon) {
        mobileProfileIcon.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== profileIcon && e.target !== mobileProfileIcon) {
            sidebar.classList.remove('active');
        }
    });
    
    // Mobile navbar active state
    const mobileLinks = document.querySelectorAll('.mobile-list a');
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active class from all links
            mobileLinks.forEach(item => {
                item.querySelector('.mobile-icon').classList.remove('active');
            });
            
            // Add active class to clicked link
            this.querySelector('.mobile-icon').classList.add('active');
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    // Initial check for elements in view
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
});