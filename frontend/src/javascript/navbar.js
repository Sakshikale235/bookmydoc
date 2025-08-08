
        const profileIcon = document.getElementById('profileIcon');
        const sidebar = document.getElementById('sidebar');
        const closeBtn = document.getElementById('closeBtn');

        profileIcon.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
   