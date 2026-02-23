import { translations } from './translations.js';

document.addEventListener('DOMContentLoaded', () => {
    

    let currentLang = 'fr';
    

    const langButtons = document.querySelectorAll('.lang-btn, .lang-btn-mobile');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');


    function updateLanguage(lang) {
        currentLang = lang;
        

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedTranslation(translations[lang], key);
            if (translation) {
                if (element.innerHTML.includes('<')) {


                     if(translation.includes('<')) element.innerHTML = translation;
                     else element.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });


        langButtons.forEach(btn => {
            if(btn.dataset.lang === lang) {
                btn.classList.add('text-white', 'text-neon-blue', 'underline', 'decoration-neon-blue', 'underline-offset-4');
                btn.classList.remove('text-gray-400');
            } else {
                btn.classList.remove('text-white', 'text-neon-blue', 'underline', 'decoration-neon-blue', 'underline-offset-4');
                btn.classList.add('text-gray-400');
            }
        });
    }

    function getNestedTranslation(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj);
    }


    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateLanguage(e.target.dataset.lang);
            if(mobileMenu.classList.contains('flex')) {
                toggleMobileMenu();
            }
        });
    });


    updateLanguage('fr');


    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);


    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
             if(mobileMenu.classList.contains('flex')) {
                toggleMobileMenu();
            }
        });
    });


    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg', 'bg-dark/90');
        } else {
            navbar.classList.remove('shadow-lg', 'bg-dark/90');
        }
    });


    gsap.registerPlugin(ScrollTrigger);


    const revealElements = document.querySelectorAll('.gs-reveal');
    revealElements.forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                }
            }
        );
    });
});
