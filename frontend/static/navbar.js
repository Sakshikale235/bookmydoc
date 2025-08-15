 const lists = document.querySelectorAll('.mobile-list');
const profileIcon = document.getElementById('profileIcon');
const mobileProfileIcon = document.getElementById('m-profile-icon');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');
const list = document.querySelectorAll('.mobile-list');

profileIcon.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

mobileProfileIcon.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});


closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
});


        const indicator = document.querySelector('.indicator');

        function activeLink() {
            // Remove active class from all items
            list.forEach((item) => item.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Update indicator position
            const index = Array.from(list).indexOf(this);
            updateIndicator(index);
        }

       function updateIndicator() {
    const activeItem = document.querySelector('.mobile-list.active');
    const index = Array.from(list).indexOf(activeItem);
    const offset = index * (600 / list.length); // calculate position
    indicator.style.left = offset + 'px'; // THIS LINE WOULD MAKE IT SLIDE
}
        // Initialize indicator position
        const activeIndex = Array.from(list).findIndex(item => item.classList.contains('active'));
        updateIndicator(activeIndex);

        // Add event listeners
        list.forEach((item) => item.addEventListener('click', activeLink));

        // Add smooth transition on window resize
        window.addEventListener('resize', () => {
            const activeIndex = Array.from(list).findIndex(item => item.classList.contains('active'));
            updateIndicator(activeIndex);
        });

        // mobile view liquid navbar 
    
    function activeLink() {
        lists.forEach((item) =>
            item.classList.remove('active')
        );
        this.classList.add('active');
    }
    lists.forEach((item) => item.addEventListener('click', activeLink));
