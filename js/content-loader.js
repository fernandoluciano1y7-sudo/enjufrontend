/**
 * Content Loader - Carrega conteúdo dinâmico no site
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar CMS e carregar conteúdo
    const content = await CMS_API.init();
    
    if (!content) {
        console.error('Erro ao carregar conteúdo');
        return;
    }

    // Carregar Header
    loadHeader(content.header);

    // Carregar Hero Section
    loadHero(content.hero);

    // Carregar Galeria
    loadGallery(content.gallery);

    // Carregar Pacotes
    loadPackages(content.packages);

    // Carregar Sobre Nós
    if (window.location.pathname.includes('sobre.html')) {
        loadAbout(content.about);
    }

    // Carregar Detalhes do Pacote
    if (window.location.pathname.includes('pacote-detalhes.html')) {
        loadPackageDetails(content.packages.items);
    }

    // Carregar Footer
    loadFooter(content.footer);

    // Adicionar listener para combo secreto (Ctrl+Shift+A)
    addAdminAccessListener();
});

function loadAbout(about) {
    if (!about) return;

    // Hero Texto
    const heroTitle = document.querySelector('.about-text h2');
    if (heroTitle) heroTitle.textContent = about.title;

    const heroSubtitle = document.querySelector('.about-text .subtitle');
    if (heroSubtitle) heroSubtitle.textContent = about.subtitle;

    const heroDesc = document.querySelector('.about-description');
    if (heroDesc) heroDesc.innerHTML = `<p>${about.text}</p>`;

    // Imagem
    const aboutImg = document.getElementById('about-img');
    if (aboutImg && about.image) {
        aboutImg.src = about.image;
    }

    // Valores
    const valuesContainer = document.querySelector('.about-values');
    if (valuesContainer && about.values) {
        valuesContainer.innerHTML = about.values.map(val => `
            <div class="value-item">
                <h3>${val.title}</h3>
                <p>${val.desc}</p>
            </div>
        `).join('');
    }
}

function loadPackageDetails(packages) {
    const params = new URLSearchParams(window.location.search);
    const packageId = params.get('id');
    const container = document.getElementById('package-details-container');

    if (!packageId || !packages) {
        container.innerHTML = '<div class="container error">Pacote não encontrado.</div>';
        return;
    }

    const pkg = packages.find(p => p.id === packageId);

    if (!pkg) {
        container.innerHTML = '<div class="container error">Pacote não encontrado.</div>';
        return;
    }

    document.title = `${pkg.title} - Enju Tours`;

    const includedList = pkg.included ? pkg.included.split(',').map(item => `<li><i class="fas fa-check"></i> ${item.trim()}</li>`).join('') : '';
    const message = encodeURIComponent(`Olá, gostaria de reservar o pacote *${pkg.title}* para a data...`);
    const whatsappLink = `https://wa.me/244933412292?text=${message}`;

    container.innerHTML = `
        <section class="package-header" style="background-image: url('${pkg.image}');">
            <div class="container">
                <div class="header-content">
                    <span class="location"><i class="fas fa-map-marker-alt"></i> ${pkg.location}</span>
                    <h1>${pkg.title}</h1>
                    <span class="duration"><i class="far fa-clock"></i> ${pkg.duration || 'Duração sob consulta'}</span>
                </div>
            </div>
        </section>

        <section class="package-main">
            <div class="container">
                <div class="details-grid">
                    <div class="details-content">
                        <div class="info-card">
                            <h2>Sobre o Roteiro</h2>
                            <div class="description-text">
                                ${pkg.description_long || 'Descrição detalhada em breve.'}
                            </div>
                        </div>
                        <div class="info-card">
                            <h2>O que está incluído</h2>
                            <ul class="checklist">
                                ${includedList || '<li>Sob consulta</li>'}
                            </ul>
                        </div>
                    </div>
                    <aside class="details-sidebar">
                        <div class="booking-card">
                            <div class="price-box">
                                <span class="price-label">Preço por pessoa</span>
                                <span class="price-amount">${pkg.price}</span>
                                <span class="price-unit">Kwanzas</span>
                            </div>
                            <div class="booking-features">
                                <div class="feature-item"><i class="fas fa-check-circle"></i><span>Reserva imediata</span></div>
                                <div class="feature-item"><i class="fas fa-check-circle"></i><span>Pagamento seguro</span></div>
                                <div class="feature-item"><i class="fas fa-check-circle"></i><span>Suporte 24/7</span></div>
                            </div>
                            <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">
                                <i class="fab fa-whatsapp"></i> Reservar Agora
                            </a>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    `;
}

function loadHeader(header) {
    // Logo
    const logoImg = document.querySelector('.site-logo');
    if (logoImg && header.logo.image) {
        logoImg.src = header.logo.image;
        logoImg.alt = header.logo.text + ' ' + header.logo.subtext;
    }

    // Texto do logo
    const logoText = document.querySelector('.brand .logo');
    if (logoText) {
        logoText.innerHTML = `${header.logo.text} <span class="logo-tours">${header.logo.subtext}</span>`;
    }

    // Navegação
    const nav = document.querySelector('.main-nav ul');
    if (nav && header.navigation) {
        nav.innerHTML = header.navigation.map(item => 
            `<li><a href="${item.href}">${item.label}</a></li>`
        ).join('');
    }

    // Botão de reserva
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn && header.bookButton) {
        bookBtn.textContent = header.bookButton;
    }
}

function loadHero(hero) {
    // Tagline
    const tagline = document.querySelector('.hero-text .tagline');
    if (tagline) tagline.textContent = hero.tagline;

    // Título
    const title = document.querySelector('.hero-text h1');
    if (title) {
        title.innerHTML = `${hero.title} <span class="primary-color-text">${hero.titleHighlight}</span> ${hero.titleSuffix}
            <div class="arrow-icon"><i class="fas fa-arrow-right"></i></div>`;
    }

    // Descrição
    const description = document.querySelector('.hero-text .description');
    if (description) description.textContent = hero.description;

    // Imagem principal
    const heroImage = document.querySelector('.circle-image');
    if (heroImage && hero.mainImage) {
        heroImage.style.backgroundImage = `url('${hero.mainImage}')`;
    }

    // Estatísticas
    const statCards = document.querySelector('.stat-cards');
    if (statCards && hero.stats) {
        statCards.innerHTML = hero.stats.map(stat => `
            <div class="stat-item">
                <img src="${stat.image}" alt="${stat.label}">
                <p class="stat-label">
                    ${stat.number.includes('Desde') ? '' : '<span>' + stat.number + '</span><br>'}
                    ${stat.number.includes('Desde') ? stat.label + '<br>' + stat.number : stat.label}
                </p>
            </div>
        `).join('');
    }
}

function loadGallery(gallery) {
    // Título e subtítulo
    const title = document.querySelector('.gallery-section h2');
    if (title) title.textContent = gallery.title;

    const subtitle = document.querySelector('.gallery-section .subtitle');
    if (subtitle) subtitle.textContent = gallery.subtitle;

    // Itens da galeria
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid && gallery.items) {
        // Detectar se é slider ou grid puro
        const isSlider = galleryGrid.classList.contains('swiper-wrapper');

        galleryGrid.innerHTML = gallery.items.map(item => `
            <div class="${isSlider ? 'swiper-slide ' : ''}gallery-item">
                <img src="${item.image}" alt="${item.caption}" loading="lazy">
                <div class="gallery-overlay">
                    <p>${item.caption}</p>
                </div>
            </div>
        `).join('');

        // Inicializar funcionalidades após carregar DOM
        if (isSlider) {
            initGallerySwiper();
        }
        initLightbox(); // Lightbox funciona para ambos
    }
}

function loadPackages(packages) {
    // Título e subtítulo
    const title = document.querySelector('.popular-packages h2');
    if (title) title.textContent = packages.title;

    const subtitle = document.querySelector('.popular-packages .subtitle');
    if (subtitle) subtitle.textContent = packages.subtitle;

    // Pacotes
    const packagesGrid = document.querySelector('.packages-grid');
    if (packagesGrid && packages.items) {
        const isSlider = packagesGrid.classList.contains('swiper-wrapper');

        packagesGrid.innerHTML = packages.items.map(pkg => `
            <div class="${isSlider ? 'swiper-slide ' : ''}package-item">
                <div class="package-img" style="background-image: url('${pkg.image}');"></div>
                <div class="package-info">
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${pkg.location}</p>
                    <h4>${pkg.title}</h4>
                    <div class="package-meta">
                        <span class="price-tag">AOA ${pkg.price} / Pessoa</span>
                        <a href="pacote-detalhes.html?id=${pkg.id || ''}" class="view-details-btn">Ver Detalhes <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        `).join('');

        if (isSlider) {
            initPackagesSwiper();
        }
    }
}

function initGallerySwiper() {
    if (typeof Swiper !== 'undefined') {
        new Swiper('.gallery-slider', {
            loop: true,
            spaceBetween: 10,
            pagination: {
                el: '.gallery-pagination',
                clickable: true,
            },
            slidesPerView: 1.5,
            centeredSlides: true,
            breakpoints: {
                769: {
                    enabled: false,
                    slidesPerView: 'auto',
                    spaceBetween: 0,
                }
            }
        });
    }
}

function initPackagesSwiper() {
    if (typeof Swiper !== 'undefined') {
        new Swiper('.packages-slider', {
            loop: true,
            spaceBetween: 20,
            pagination: {
                el: '.packages-pagination',
                clickable: true,
            },
            slidesPerView: 1.1,
            breakpoints: {
                769: {
                    enabled: false,
                    slidesPerView: 'auto',
                    spaceBetween: 0,
                }
            }
        });
    }
}

function loadFooter(footer) {
    // Logo do footer
    const footerLogo = document.querySelector('.footer-about .logo');
    if (footerLogo && footer.logo) {
        const [text, subtext] = footer.logo.split(' ');
        footerLogo.innerHTML = `${text} <span class="logo-tours">${subtext}</span>`;
    }

    // Descrição
    const footerDesc = document.querySelector('.footer-about p');
    if (footerDesc) footerDesc.textContent = footer.description;

    // Redes sociais
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks && footer.social) {
        socialLinks.innerHTML = `
            <a href="${footer.social.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="${footer.social.facebook}"><i class="fab fa-facebook-f"></i></a>
            <a href="${footer.social.whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i></a>
        `;
    }

    // Destinos
    const destinations = document.querySelectorAll('.footer-grid .col')[1];
    if (destinations && footer.destinations) {
        const ul = destinations.querySelector('ul');
        if (ul) {
            ul.innerHTML = footer.destinations.map(item => 
                `<li><a href="${item.href}">${item.label}</a></li>`
            ).join('');
        }
    }

    // Suporte
    const support = document.querySelectorAll('.footer-grid .col')[2];
    if (support && footer.support) {
        const ul = support.querySelector('ul');
        if (ul) {
            ul.innerHTML = footer.support.map(item => 
                `<li><a href="${item.href}">${item.label}</a></li>`
            ).join('');
        }
    }

    // Copyright
    const copyright = document.querySelector('.copyright .container');
    if (copyright) copyright.innerHTML = footer.copyright;
}

function initLightbox() {
    const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const btnClose = document.querySelector('.lightbox-close');
    const btnPrev = document.querySelector('.lightbox-prev');
    const btnNext = document.querySelector('.lightbox-next');

    let currentIndex = -1;

    function openLightbox(index) {
        const img = galleryImages[index];
        if (!img) return;
        currentIndex = index;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || '';
        lightboxCaption.textContent = img.alt || '';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.src = '';
        document.body.style.overflow = '';
        currentIndex = -1;
    }

    function showPrev() {
        if (currentIndex > 0) openLightbox(currentIndex - 1);
    }

    function showNext() {
        if (currentIndex < galleryImages.length - 1) openLightbox(currentIndex + 1);
    }

    galleryImages.forEach((img, idx) => {
        img.addEventListener('click', () => openLightbox(idx));
    });

    if (btnClose) btnClose.addEventListener('click', closeLightbox);
    if (btnPrev) btnPrev.addEventListener('click', showPrev);
    if (btnNext) btnNext.addEventListener('click', showNext);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
}

function addAdminAccessListener() {
    let keys = {};
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Ctrl+Shift+A (aceita maiúscula e minúscula)
        if (keys['Control'] && keys['Shift'] && (keys['a'] || keys['A'])) {
            e.preventDefault();
            // Caminho absoluto ou relativo ao root para funcionar de qualquer lugar
            window.location.href = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') 
                ? '../admin/admin-login.html' 
                : 'admin/admin-login.html';
        }
    });
    
    document.addEventListener('keyup', (e) => {
        delete keys[e.key];
    });
}
