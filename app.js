document.addEventListener('DOMContentLoaded', () => {
    // Наблюдатель за появлением элементов на экране (Анимация скролла)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.fade-up');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // --- Логика переключения темы (Dark / Light) ---
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (systemPrefersLight) {
        applyTheme('light');
    }

    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const nextTheme = isLight ? 'dark' : 'light';
            applyTheme(nextTheme);
            localStorage.setItem('theme', nextTheme);
            updateNavScroll();
        });
    });

    // Эффект помутнения навигации при скролле вниз (с учетом темы)
    const nav = document.querySelector('.glass-nav');
    const updateNavScroll = () => {
        if (!nav) return;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (window.scrollY > 50) {
            nav.style.background = isLight ? 'rgba(248, 250, 252, 0.92)' : 'rgba(5, 5, 8, 0.85)';
            nav.style.backdropFilter = 'blur(15px)';
            nav.style.borderBottom = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)';
            nav.style.boxShadow = isLight ? '0 4px 20px rgba(0, 0, 0, 0.06)' : '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.background = isLight ? 'rgba(248, 250, 252, 0.6)' : 'rgba(5, 5, 8, 0.3)';
            nav.style.backdropFilter = 'blur(8px)';
            nav.style.borderBottom = '1px solid transparent';
            nav.style.boxShadow = 'none';
        }
    };

    window.addEventListener('scroll', updateNavScroll);
    updateNavScroll();

    // Динамический статус в шапке (переключение ролей)
    const statusText = document.getElementById('dynamic-status');
    const statusContainer = document.querySelector('.nav-status-container');
    
    if (statusText) {
        const lang = document.documentElement.lang || 'ru';
        const phrases = {
            ru: [
                "Workflow Automation Architect",
                "Открыт к проектной работе",
                "AI & RAG Solutions",
                "Доступен для задач",
                "Системный архитектор",
                "Let's automate"
            ],
            en: [
                "Workflow Automation Architect",
                "Open for project work",
                "AI & RAG Solutions",
                "Available Now",
                "System Architect",
                "Let's automate"
            ]
        };

        let currentIndex = 1; // Start from the second phrase as the first is already in HTML
        const currentPhrases = phrases[lang] || phrases.en;

        const updateStatus = () => {
            // Fade only the text, keeping the badge and dot visible
            statusText.style.opacity = '0';
            
            setTimeout(() => {
                statusText.textContent = currentPhrases[currentIndex];
                
                // Update dot color based on status type
                const isStatus = currentIndex % 2 !== 0;
                const dot = statusContainer.querySelector('.status-dot');
                if (dot) {
                    dot.style.background = isStatus ? '#00ff88' : 'var(--accent-blue)';
                    dot.style.boxShadow = isStatus ? '0 0 10px #00ff88' : '0 0 10px var(--accent-blue)';
                }
                
                statusText.style.opacity = '1';
                currentIndex = (currentIndex + 1) % currentPhrases.length;
            }, 400); // Matches CSS transition duration
        };

        // Start interval without an immediate call to avoid initial flicker
        setInterval(updateStatus, 5000);
    }
    
    // Mobile Menu Logic (Side Drawer)
    const menuToggle = document.getElementById('menu-toggle');
    const closeDrawer = document.getElementById('close-drawer');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const menuDimmer = document.getElementById('menu-dimmer');
    const drawerLinks = document.querySelectorAll('.drawer-nav a');

    const toggleMenu = (show) => {
        mobileDrawer.classList.toggle('active', show);
        menuDimmer.classList.toggle('active', show);
        menuToggle.classList.toggle('active', show); // Trigger burger animation
        document.body.style.overflow = show ? 'hidden' : '';
    };

    if (menuToggle && mobileDrawer && menuDimmer) {
        menuToggle.addEventListener('click', () => toggleMenu(true));
        closeDrawer.addEventListener('click', () => toggleMenu(false));
        menuDimmer.addEventListener('click', () => toggleMenu(false));

        drawerLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Проверка параметра в URL для сохранения меню открытым (бесшовное переключение языка)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('menu') === 'active') {
            // Временно отключаем анимацию для эффекта "мгновенного" появления
            mobileDrawer.style.transition = 'none';
            menuDimmer.style.transition = 'none';
            
            toggleMenu(true);

            // Возвращаем анимацию для последующих действий
            setTimeout(() => {
                mobileDrawer.style.transition = '';
                menuDimmer.style.transition = '';
                // Очищаем URL от параметра, чтобы при ручном обновлении меню не открывалось само
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 50);
        }
    }
    // Обработка перехода по языкам (бесшовный скролл)
    const langSwitchers = document.querySelectorAll('.lang-stack');
    langSwitchers.forEach(switcher => {
        switcher.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            
            const sections = document.querySelectorAll('section[id], header[id]');
            let currentId = 'home';
            let maxVisible = 0;

            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                if (visibleHeight > maxVisible) {
                    maxVisible = visibleHeight;
                    currentId = sec.id;
                }
            });

            sessionStorage.setItem('scrollTarget', currentId);
            window.location.href = targetUrl;
        });
    });

    // Проверка сохраненного таргета для мгновенного прыжка
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    if (scrollTarget) {
        const element = document.getElementById(scrollTarget);
        if (element) {
            // Отключаем плавность для мгновенного позиционирования
            document.documentElement.style.scrollBehavior = 'auto';
            element.scrollIntoView();
            // Возвращаем плавность через мгновение для обычного скролла пользователем
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = '';
            }, 50);
        }
        sessionStorage.removeItem('scrollTarget');
    }

    // Универсальная логика аккордеонов (Experience и т.д.)
    const initAccordion = (containerSelector, headerSelector, bodySelector) => {
        const accordions = document.querySelectorAll(containerSelector);
        accordions.forEach(accordion => {
            const header = accordion.querySelector(headerSelector);
            const body = accordion.querySelector(bodySelector);

            if (!header || !body) return;

            header.addEventListener('click', () => {
                const isOpen = accordion.classList.contains('is-open');

                if (isOpen) {
                    // Закрываем
                    body.style.maxHeight = body.scrollHeight + 'px';
                    requestAnimationFrame(() => {
                        body.style.maxHeight = '0';
                    });
                    accordion.classList.remove('is-open');
                    header.setAttribute('aria-expanded', 'false');
                } else {
                    // Открываем
                    body.style.maxHeight = body.scrollHeight + 'px';
                    accordion.classList.add('is-open');
                    header.setAttribute('aria-expanded', 'true');
                    // После анимации убираем жёсткий px, чтобы контент адаптировался (например, при ресайзе)
                    body.addEventListener('transitionend', () => {
                        if (accordion.classList.contains('is-open')) {
                            body.style.maxHeight = 'none';
                        }
                    }, { once: true });
                }
            });
        });
    };

    // Инициализируем аккордеоны для опыта
    initAccordion('.exp-accordion', '.exp-header', '.exp-body');
});

