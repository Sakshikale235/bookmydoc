//DOM Elements
const carousel = document.getElementById('carousel');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const symptomChecker = document.getElementById('symptomChecker');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav-links');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    initCarousel();
    
    // Add scroll animations
    handleScrollAnimations();
    
    // Add card hover effects
    addCardHoverEffects();
    
    // Search input events
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.transform = 'scale(1.02)';
    });
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.transform = 'scale(1)';
    });
    
    // Filter button events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
    
    // Symptom checker button
    symptomChecker.addEventListener('click', handleSymptomChecker);
    
    // Mobile menu toggle
    mobileToggle.addEventListener('click', toggleMobileMenu);
    
    // Carousel control buttons
    prevBtn.addEventListener('click', () => {
        rotateCarousel(-1);
        stopAutoSlide();
        setTimeout(startAutoSlide, 5000);
    });
    
    nextBtn.addEventListener('click', () => {
        rotateCarousel(1);
        stopAutoSlide();
        setTimeout(startAutoSlide, 5000);
    });
    
    // Navigation link smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScroll(href);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Window resize handler
    window.addEventListener('resize', () => {
        rotateCarousel(0);
    });
});



// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    // Add search animation
    searchInput.style.transform = 'scale(1.02)';
    setTimeout(() => {
        searchInput.style.transform = 'scale(1)';
    }, 200);
    
    // Filter logic would go here
    console.log(`Searching for: ${searchTerm} in category: ${activeFilter}`);
    
    // Add visual feedback
    if (searchTerm.length > 0) {
        searchInput.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
    } else {
        searchInput.style.boxShadow = 'none';
    }
}

// Filter functionality
function handleFilterClick(btn) {
    // Remove active class from all buttons
    filterBtns.forEach(button => button.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Add click animation
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
    
    // Trigger search with new filter
    handleSearch();
}






// Carousel functionality
// let currentIndex = 0;
// const cards = document.querySelectorAll('.doctor-card');
// const totalCards = cards.length;
// let autoSlideInterval;

// Position cards in honeycomb pattern
// function positionCards() {
//     const radius = 200;
//     const centerX = 0;
//     const centerY = 0;
    
//     cards.forEach((card, index) => {
//         const angle = (index / totalCards) * 2 * Math.PI - Math.PI / 2;
//         const x = centerX + radius * Math.cos(angle);
//         const y = centerY + radius * Math.sin(angle);
        
//         card.style.transform = `translate(${x}px, ${y}px)`;
//         card.style.zIndex = index === currentIndex ? 10 : 1;
        
//         // Add active class to current card
//         if (index === currentIndex) {
//             card.classList.add('active');
//         } else {
//             card.classList.remove('active');
//         }
//     });
// }

// Rotate carousel
// function rotateCarousel(direction = 1) {
//     currentIndex = (currentIndex + direction + totalCards) % totalCards;
    
//     cards.forEach((card, index) => {
//         // Calculate angle and position
//         const angle = ((index - currentIndex) / totalCards) * 2 * Math.PI;
//         const radius = 300; // Increased radius for better spacing
//         const x = radius * Math.cos(angle);
//         const y = radius * Math.sin(angle) * 0.5; // Flatten the circle to oval
//         const z = 50 * Math.sin(angle); // Add depth
        
//         // Apply transforms with enhanced visual effects
//         card.style.transform = `
//             translate3d(${x}px, ${y}px, ${z}px)
//             rotateY(${angle * 180 / Math.PI}deg)
//             scale(${index === currentIndex ? 1.2 : 0.8})
//         `;
        
//         // Update styles based on position
//         card.style.zIndex = index === currentIndex ? 10 : 1;
//         card.style.opacity = index === currentIndex ? 1 : 
//                            (Math.cos(angle) + 1) * 0.5;
        
//         // Toggle active state
//         card.classList.toggle('active', index === currentIndex);
//     });

//     // Update pagination if exists
//     updatePagination();
// }

// function updatePagination() {
//     const paginationContainer = document.querySelector('.carousel-pagination');
//     if (!paginationContainer) return;

//     paginationContainer.innerHTML = '';
    
//     for (let i = 0; i < totalCards; i++) {
//         const dot = document.createElement('span');
//         dot.classList.add('pagination-dot');
//         if (i === currentIndex) dot.classList.add('active');
//         dot.addEventListener('click', () => {
//             const diff = i - currentIndex;
//             rotateCarousel(diff);
//             stopAutoSlide();
//             setTimeout(startAutoSlide, 5000);
//         });
//         paginationContainer.appendChild(dot);
//     }
// }

// Auto-slide functionality
// function startAutoSlide() {
//     autoSlideInterval = setInterval(() => {
//         rotateCarousel(1);
//     }, 4000);
// }

// function stopAutoSlide() {
//     clearInterval(autoSlideInterval);
// }

// Initialize carousel
// function initCarousel() {
//     // Check if elements exist
//     if (!carousel || !cards.length) {
//         console.error('Carousel elements not found');
//         return;
//     }

//     // Set initial styles for carousel container
//     carousel.style.position = 'relative';
//     carousel.style.height = '500px';  // Adjust height as needed
//     carousel.style.perspective = '1000px';

//     // Initialize cards with proper positioning
//     cards.forEach((card, index) => {
//         card.style.position = 'absolute';
//         card.style.left = '50%';
//         card.style.top = '50%';
//         card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
//     });

//     // Initial rotation
//     rotateCarousel(0);
//     startAutoSlide();

//     // Add touch support for mobile
//     let touchStartX = 0;
//     carousel.addEventListener('touchstart', (e) => {
//         touchStartX = e.touches[0].clientX;
//         stopAutoSlide();
//     });

//     carousel.addEventListener('touchend', (e) => {
//         const touchEndX = e.changedTouches[0].clientX;
//         const diff = touchStartX - touchEndX;
//         if (Math.abs(diff) > 50) {
//             rotateCarousel(diff > 0 ? 1 : -1);
//         }
//         setTimeout(startAutoSlide, 5000);
//     });
// }

// Add scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.search-title, .carousel-title, .doctor-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Card hover effects
// function addCardHoverEffects() {
//     cards.forEach(card => {
//         card.addEventListener('mouseenter', () => {
//             card.style.transform += ' rotateY(10deg)';
//             card.style.boxShadow = '0 20px 40px rgba(255, 107, 107, 0.2)';
//         });
        
//         card.addEventListener('mouseleave', () => {
//             // Reset transform but keep current position
//             const currentTransform = card.style.transform.replace(' rotateY(10deg)', '');
//             card.style.transform = currentTransform;
//             card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
//         });
        
//         card.addEventListener('click', () => {
//             // Add click effect
//             card.style.transform += ' scale(0.95)';
//             setTimeout(() => {
//                 const currentTransform = card.style.transform.replace(' scale(0.95)', '');
//                 card.style.transform = currentTransform;
//             }, 150);
            
//             // Show doctor details (placeholder)
//             const doctorName = card.querySelector('h3').textContent;
//             alert(`Viewing details for ${doctorName}`);
//         });
//     });
// }

// Keyboard navigation
// function handleKeyboardNavigation(e) {
//     switch(e.key) {
//         case 'ArrowLeft':
//             rotateCarousel(-1);
//             stopAutoSlide();
//             setTimeout(startAutoSlide, 5000);
//             break;
//         case 'ArrowRight':
//             rotateCarousel(1);
//             stopAutoSlide();
//             setTimeout(startAutoSlide, 5000);
//             break;
//         case 'Escape':
//             if (navLinks.classList.contains('active')) {
//                 toggleMobileMenu();
//             }
//             break;
//     }
// }

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
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

// Add parallax effect on scroll
window.addEventListener('scroll', throttle(() => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.carousel-section');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
}, 10));

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});


// ==================== Specialist Carousel ====================
let isMoving = false;

function moveSpecialist(direction) {
    if (isMoving) return;
    isMoving = true;

    const list = document.querySelector('.specialist-list');
    const cardWidth = list.firstElementChild.offsetWidth + 16;

    if (direction === 'right') {
        list.style.transition = 'transform 0.4s ease';
        list.style.transform = translateX(-${cardWidth}px);

        setTimeout(() => {
            list.appendChild(list.firstElementChild);
            list.style.transition = 'none';
            list.style.transform = 'translateX(0)';
            isMoving = false;
        }, 400);
    } else if (direction === 'left') {
        list.insertBefore(list.lastElementChild, list.firstElementChild);
        list.style.transition = 'none';
        list.style.transform = translateX(-${cardWidth}px);

        requestAnimationFrame(() => {
            list.style.transition = 'transform 0.4s ease';
            list.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            isMoving = false;
        }, 400);
    }
}
// ==================== Initialize All Carousels ====================
initCarousel('carousel', 'prev', 'next'); // Main 3D carousel



// ==================== Testimonial 3D Carousel ====================
const testimonialCarousel = document.getElementById('carousel');
const testimonialItems = testimonialCarousel.querySelectorAll('.carousel__item');

let testimonialAngle = 0;
const testimonialStep = 360 / testimonialItems.length;
const testimonialRadius = 300; // smaller for centered look

// Arrange items in a circle
testimonialItems.forEach((item, index) => {
    const itemAngle = testimonialStep * index;
    item.style.transform = `
        rotateY(${itemAngle}deg) translateZ(${testimonialRadius}px)
    `;
});
function moveTestimonial(direction) {
    if (direction === 'right') {
        testimonialAngle -= testimonialStep;
    } else {
        testimonialAngle += testimonialStep;
    }
    testimonialCarousel.style.transform = rotateY(${testimonialAngle}deg);
}
