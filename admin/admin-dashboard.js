/**
 * Admin Dashboard JavaScript
 * Gerenciamento de conteúdo e upload de mídia
 */

let currentContent = null;
let currentSection = 'hero';
let currentEditingItem = null;

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', async () => {
    if (!CMS_API.auth.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Carregar conteúdo
    currentContent = await CMS_API.init();
    if (!currentContent) {
        showToast('Erro ao carregar conteúdo', 'error');
        return;
    }

    // Inicializar interface
    initSidebar();
    initTopBar();
    loadSection('hero');
    setupDragAndDrop();
});

// Inicializar sidebar
function initSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Atualizar ativo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Carregar seção
            loadSection(section);
        });
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        CMS_API.auth.logout();
        window.location.href = 'admin-login.html';
    });
}

// Inicializar top bar
function initTopBar() {
    document.getElementById('btnSave').addEventListener('click', saveChanges);
}

// Carregar seção específica
function loadSection(section) {
    currentSection = section;
    
    // Esconder todas as seções
    document.querySelectorAll('.editor-section').forEach(sec => {
       sec.classList.remove('active');
    });
    
    // Mostrar seção atual
    const editorSection = document.getElementById(`editor-${section}`);
    if (editorSection) {
        editorSection.classList.add('active');
    }
    
    // Atualizar título
    const titles = {
        hero: 'Seção Hero',
        gallery: 'Galeria',
        packages: 'Pacotes Turísticos',
        header: 'Cabeçalho',
        footer: 'Rodapé'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || section;
    
    // Carregar dados da seção
    switch(section) {
        case 'hero':
            loadHeroEditor();
            break;
        case 'gallery':
            loadGalleryEditor();
            break;
        case 'packages':
            loadPackagesEditor();
            break;
        case 'header':
            loadHeaderEditor();
            break;
        case 'footer':
            loadFooterEditor();
            break;
        case 'about':
            loadAboutEditor();
            break;
    }
}

// Carregar editor Hero
function loadHeroEditor() {
    const hero = currentContent.hero;
    if (!hero) return;

    document.getElementById('hero-tagline').value = hero.tagline || '';
    document.getElementById('hero-title').value = hero.title || '';
    document.getElementById('hero-titleHighlight').value = hero.titleHighlight || '';
    document.getElementById('hero-titleSuffix').value = hero.titleSuffix || '';
    document.getElementById('hero-description').value = hero.description || '';

    // Setup Upload da Imagem Hero
    setupImageUpload('hero-image', hero.mainImage || hero.image);
}

// Carregar editor Sobre Nós
function loadAboutEditor() {
    const about = currentContent.about;
    
    document.getElementById('about-title').value = about.title || '';
    document.getElementById('about-subtitle').value = about.subtitle || '';
    document.getElementById('about-text').value = about.text || '';
    
    // Imagem Sobre
    setupImageUpload('about-image', about.image);
    
    // Valores
    renderAboutValues(about.values);
}

function renderAboutValues(values) {
    const container = document.getElementById('about-values-container');
    container.innerHTML = '';
    
    values.forEach((val, index) => {
        const valDiv = document.createElement('div');
        valDiv.className = 'value-editor-item form-group';
        valDiv.innerHTML = `
            <label>Valor ${index + 1}</label>
            <input type="text" value="${val.title}" placeholder="Título" data-index="${index}" data-field="title" style="margin-bottom: 5px;">
            <textarea placeholder="Descrição" data-index="${index}" data-field="desc" rows="2">${val.desc}</textarea>
        `;
        container.appendChild(valDiv);
        
        // Listeners
        valDiv.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                currentContent.about.values[idx][field] = e.target.value;
            });
        });
    });
}

// Carregar editor de pacotes
function loadPackagesEditor() {
    const packages = currentContent.packages;
    
    document.getElementById('packages-title').value = packages.title || '';
    document.getElementById('packages-subtitle').value = packages.subtitle || '';
    
    // Botão adicionar
    document.getElementById('btn-add-package').onclick = () => openPackageModal(); // Novo nome para função
    
    // Renderizar pacotes
    renderPackages();
}

function renderPackages() {
    const container = document.getElementById('packages-items');
    const packages = currentContent.packages;
    
    container.innerHTML = '';
    
    packages.items.forEach((pkg, index) => {
        const pkgDiv = document.createElement('div');
        pkgDiv.className = 'package-card';
        pkgDiv.innerHTML = `
            <div class="package-card-actions">
                <button class="btn-edit-details" data-index="${index}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <img src="${pkg.image}" alt="${pkg.title}">
            <div class="package-card-info">
                <strong>${pkg.title}</strong>
                <span style="font-size: 0.9em; color: #666;">${pkg.location}</span>
                <span class="price-tag-mini">${pkg.price} AOA</span>
            </div>
        `;
        container.appendChild(pkgDiv);
        
        // Actions
        pkgDiv.querySelector('.btn-remove').addEventListener('click', () => {
            if (confirm('Deseja remover este pacote?')) {
                packages.items.splice(index, 1);
                renderPackages();
            }
        });
        
        pkgDiv.querySelector('.btn-edit-details').addEventListener('click', () => {
             openPackageModal(index);
        });
    });
}

// Abrir Modal de Pacote (Adicionar ou Editar)
function openPackageModal(index = null) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const isEdit = index !== null;
    const pkg = isEdit ? currentContent.packages.items[index] : {};
    
    document.getElementById('modal-title').textContent = isEdit ? 'Editar Pacote' : 'Adicionar Pacote';
    
    modalBody.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Título</label>
                <input type="text" id="pkg-title" value="${pkg.title || ''}">
            </div>
            <div class="form-group">
                <label>Localização</label>
                <input type="text" id="pkg-location" value="${pkg.location || ''}">
            </div>
            <div class="form-group">
                <label>Preço (AOA)</label>
                <input type="text" id="pkg-price" value="${pkg.price || ''}">
            </div>
             <div class="form-group">
                <label>Duração (ex: 2 Dias)</label>
                <input type="text" id="pkg-duration" value="${pkg.duration || ''}">
            </div>
            <div class="form-group full-width">
                <label>Descrição Detalhada</label>
                <textarea id="pkg-desc-long" rows="4">${pkg.description_long || ''}</textarea>
            </div>
            <div class="form-group full-width">
                <label>O que está incluído (separar por vírgula)</label>
                <textarea id="pkg-included" rows="2" placeholder="Transporte, Hotel, Guia...">${pkg.included || ''}</textarea>
            </div>
            <div class="form-group full-width">
                <label>Imagem</label>
                <div class="upload-area" id="pkg-upload">
                    <div class="upload-placeholder" style="${pkg.image ? 'display:none' : ''}">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Alterar imagem</p>
                    </div>
                    <img class="preview-image" id="pkg-preview" src="${pkg.image || ''}" style="${pkg.image ? 'display:block' : 'display:none'}">
                    <input type="file" id="pkg-file" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    
    // Setup upload logic (reused)
    const uploadArea = document.getElementById('pkg-upload');
    const fileInput = document.getElementById('pkg-file');
    const preview = document.getElementById('pkg-preview');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await CMS_API.uploadImage(file);
                preview.src = base64;
                preview.style.display = 'block';
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    });
    
    // Confirmar
    document.getElementById('modal-confirm').onclick = () => {
        const title = document.getElementById('pkg-title').value;
        const location = document.getElementById('pkg-location').value;
        const price = document.getElementById('pkg-price').value;
        const imageSrc = preview.src;
        
        if (!title || !price) {
            showToast('Título e Preço são obrigatórios', 'error');
            return;
        }
        
        const newPkgData = {
            id: pkg.id || 'package-' + Date.now(),
            title,
            location,
            price,
            duration: document.getElementById('pkg-duration').value,
            description_long: document.getElementById('pkg-desc-long').value,
            included: document.getElementById('pkg-included').value,
            image: imageSrc
        };
        
        if (isEdit) {
            currentContent.packages.items[index] = newPkgData;
        } else {
            currentContent.packages.items.push(newPkgData);
        }
        
        renderPackages();
        closeModal();
        showToast('Pacote salvo com sucesso');
    };
    
    document.getElementById('modal-cancel').onclick = closeModal;
    document.getElementById('modal-close').onclick = closeModal;
}

// ... (loadHeaderEditor mantido) ...

// ... (loadFooterEditor mantido) ...

// Setup de upload de imagem
function setupImageUpload(prefix, initialImage) {
    const uploadArea = document.getElementById(`${prefix}-upload`);
    const fileInput = document.getElementById(`${prefix}-input`);
    const preview = document.getElementById(`${prefix}-preview`);
    
    if (!uploadArea || !fileInput || !preview) {
        console.error(`Elementos de upload não encontrados para o prefixo: ${prefix}`);
        return;
    }
    
    // Mostrar imagem inicial
    if (initialImage) {
        preview.src = initialImage;
        preview.style.display = 'block';
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    } else {
        preview.style.display = 'none';
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        if (placeholder) placeholder.style.display = 'flex';
    }
    
    // Remover listeners antigos
    const newUploadArea = uploadArea.cloneNode(true);
    uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
    
    const newFileInput = document.getElementById(`${prefix}-input`); // Pegar o novo ID após o clone
    const newPreview = document.getElementById(`${prefix}-preview`);
    const newPlaceholder = newUploadArea.querySelector('.upload-placeholder');
    
    newUploadArea.addEventListener('click', () => newFileInput.click());
    
    newFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                showToast('Enviando imagem...', 'info');
                const imageUrl = await CMS_API.uploadImage(file);
                
                newPreview.src = imageUrl;
                newPreview.style.display = 'block';
                if (newPlaceholder) newPlaceholder.style.display = 'none';
                
                // Atualizar no conteúdo global
                if (prefix === 'hero-image') {
                    currentContent.hero.mainImage = imageUrl;
                } else if (prefix === 'header-logo') {
                    currentContent.header.logo.image = imageUrl;
                } else if (prefix === 'about-image') {
                    currentContent.about.image = imageUrl;
                }
                
                showToast('Imagem atualizada com sucesso!');
            } catch (error) {
                showToast('Erro no upload: ' + error.message, 'error');
            }
        }
    });

    setupDragAndDrop(); 
}

// ... (setupDragAndDrop mantido) ...

// Salvar alterações
async function saveChanges() {
    // ... (mesmo código de antes) ...
    try {
        collectAllData();
        CMS_API.saveContent(currentContent);
        showToast('Alterações salvas com sucesso!');
    } catch (error) {
        showToast('Erro ao salvar: ' + error.message, 'error');
    }
    // ...
}

// Coletar dados de todos os campos
function collectAllData() {
    // ... (Hero, Gallery, Packages Titles, Header, Footer mantidos) ...
    if (currentContent.hero) {
        currentContent.hero.tagline = document.getElementById('hero-tagline')?.value || currentContent.hero.tagline;
        currentContent.hero.title = document.getElementById('hero-title')?.value || currentContent.hero.title;
        currentContent.hero.titleHighlight = document.getElementById('hero-titleHighlight')?.value || currentContent.hero.titleHighlight;
        currentContent.hero.titleSuffix = document.getElementById('hero-titleSuffix')?.value || currentContent.hero.titleSuffix;
        currentContent.hero.description = document.getElementById('hero-description')?.value || currentContent.hero.description;
    }
    
    if (currentContent.gallery) {
        currentContent.gallery.title = document.getElementById('gallery-title')?.value || currentContent.gallery.title;
        currentContent.gallery.subtitle = document.getElementById('gallery-subtitle')?.value || currentContent.gallery.subtitle;
    }
    
    if (currentContent.packages) {
        currentContent.packages.title = document.getElementById('packages-title')?.value || currentContent.packages.title;
        currentContent.packages.subtitle = document.getElementById('packages-subtitle')?.value || currentContent.packages.subtitle;
    }

    // About
    if (currentContent.about) {
        currentContent.about.title = document.getElementById('about-title')?.value || currentContent.about.title;
        currentContent.about.subtitle = document.getElementById('about-subtitle')?.value || currentContent.about.subtitle;
        currentContent.about.text = document.getElementById('about-text')?.value || currentContent.about.text;
    }
    
    // ... (restante do código) ...
}

// ... (restante funções helper) ...

// Mostrar toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #25d366, #128c3c)';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
