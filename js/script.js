document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        
        if (isOpen) {
            menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            document.body.style.overflow = 'hidden'; 
        } else {
            menuIcon.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
            document.body.style.overflow = 'auto';
        }
    });

    const links = document.querySelectorAll('.mobile-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuIcon.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
            document.body.style.overflow = 'auto';
        });
    });
});