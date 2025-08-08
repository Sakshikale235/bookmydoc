// Image Slider
let slideIndex = 0;
        const slides = document.querySelector('.slider');
        const totalSlides = document.querySelectorAll('.slide').length;

        function showSlides() {
            slideIndex++;
            if (slideIndex >= totalSlides) slideIndex = 0;
            slides.style.transform = `translateX(-${slideIndex * 100}%)`;
            setTimeout(showSlides, 5000);
        }
        showSlides();

        // Specialist Carousel
        let specialistIndex = 0;
        const specialistList = document.querySelector('.specialist-list');
        const specialistCards = document.querySelectorAll('.specialty-card');
        const totalSpecialists = specialistCards.length;

        function moveSpecialist(direction) {
            const cardWidth = specialistCards[0].offsetWidth + 16; // Including gap
            if (direction === 'right' && specialistIndex < totalSpecialists - 3) {
                specialistIndex++;
            } else if (direction === 'left' && specialistIndex > 0) {
                specialistIndex--;
            }
            specialistList.style.transform = `translateX(-${specialistIndex * cardWidth}px)`;
        }

        // Specialist Selection
        const doctorList = document.getElementById('doctorList');
        const doctors = {
            Cardiologist: [
                { name: 'Dr. John Smith', img: 'https://via.placeholder.com/200x150?text=John+Smith' },
                { name: 'Dr. Alice Brown', img: 'https://via.placeholder.com/200x150?text=Alice+Brown' }
            ],
            Dermatologist: [
                { name: 'Dr. Sarah Johnson', img: 'https://via.placeholder.com/200x150?text=Sarah+Johnson' }
            ],
            ENT: [
                { name: 'Dr. Michael Brown', img: 'https://via.placeholder.com/200x150?text=Michael+Brown' }
            ],
            Neurologist: [
                { name: 'Dr. Emily Davis', img: 'https://via.placeholder.com/200x150?text=Emily+Davis' }
            ]
        };

        specialistCards.forEach(card => {
            card.addEventListener('click', () => {
                const specialty = card.dataset.specialty;
                // Redirect to a page (you can later create these)
                const pageUrl = `${specialty.toLowerCase()}.html`; // e.g., cardiologist.html
                window.location.href = pageUrl;
            });
        });

        // Honeycomb Doctor Carousel (Smooth Circular Movement)
        let honeycombAngle = 0;
        let targetAngle = 0;
        const honeycombItems = document.querySelectorAll('.honeycomb-item');
        const totalHoneycombItems = honeycombItems.length;
        const radius = 260; // Adjusted radius for ~100px gap between adjacent hexagons
        const angleStep = 360 / totalHoneycombItems;
        let animationFrameId = null;

        function updateHoneycombPositions() {
            honeycombItems.forEach((item, index) => {
                const angle = (index * angleStep + honeycombAngle) * (Math.PI / 180);
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                item.style.transform = `translate(${x}px, ${y}px)`;
            });
        }

        function animateHoneycomb() {
            if (Math.abs(honeycombAngle - targetAngle) < 0.1) {
                honeycombAngle = targetAngle;
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                updateHoneycombPositions();
                return;
            }
            honeycombAngle += (targetAngle - honeycombAngle) * 0.1; // Smooth interpolation
            updateHoneycombPositions();
            animationFrameId = requestAnimationFrame(animateHoneycomb);
        }

        function moveHoneycomb(direction) {
            if (animationFrameId) return; // Prevent multiple animations
            if (direction === 'right') {
                targetAngle -= angleStep;
            } else if (direction === 'left') {
                targetAngle += angleStep;
            }
            animationFrameId = requestAnimationFrame(animateHoneycomb);
        }

        // Initialize positions
        updateHoneycombPositions();

        // Testimonials
        let testimonialIndex = 0;
        const testimonialSlider = document.querySelector('.testimonial-slider');
        const totalTestimonials = document.querySelectorAll('.testimonial').length;

        function moveTestimonial(direction) {
            if (direction === 'right' && testimonialIndex < totalTestimonials - 1) {
                testimonialIndex++;
            } else if (direction === 'left' && testimonialIndex > 0) {
                testimonialIndex--;
            }
            testimonialSlider.style.transform = `translateX(-${testimonialIndex * 100}%)`;
        }

        const leftArrow = document.querySelector('.arrow-left');
        const rightArrow = document.querySelector('.arrow-right');

        function updateArrowVisibility() {
            leftArrow.style.display = specialistIndex === 0 ? 'none' : 'block';
            rightArrow.style.display = (specialistIndex >= totalSpecialists - 3) ? 'none' : 'block';
        }

        function moveSpecialist(direction) {
            const cardWidth = specialistCards[0].offsetWidth + 16;
            if (direction === 'right' && specialistIndex < totalSpecialists - 3) {
                specialistIndex++;
            } else if (direction === 'left' && specialistIndex > 0) {
                specialistIndex--;
            }
            specialistList.style.transform = `translateX(-${specialistIndex * cardWidth}px)`;
            updateArrowVisibility();
        }

        updateArrowVisibility(); // Call it on load
