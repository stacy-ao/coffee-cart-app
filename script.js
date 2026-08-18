// State
const DEFAULT_FEATURED_IMAGE = 'https://images.unsplash.com/photo-1517701609419-4be865a86121?auto=format&fit=crop&w=800&q=80';

const MENU_PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517701609419-4be865a86121?auto=format&fit=crop&w=200&q=80'
];

const DEFAULT_FEATURED_DRINK = {
    name: 'Iced Matcha Latte',
    price: 550,
    description: 'Ceremonial-grade matcha blended with creamy oat milk and poured over ice.',
    imageUrl: ''
};

let state = {
    location: "Not set yet",
    menu: [],
    dailyMessage: "",
    featuredDrink: { ...DEFAULT_FEATURED_DRINK }
};

const SUNSET_STORAGE_KEY = 'coffeeCartSunsetMode';

// DOM Elements
const sunsetToggle = document.getElementById('sunset-toggle');
const customerView = document.getElementById('customer-view');
const ownerView = document.getElementById('owner-view');

const displayLocation = document.getElementById('display-location');
const customerMenuList = document.getElementById('customer-menu-list');
const vibeBanner = document.getElementById('vibe-banner');
const displayDailyMessage = document.getElementById('display-daily-message');

const dailyMessageForm = document.getElementById('daily-message-form');
const dailyMessageInput = document.getElementById('daily-message-input');

const featuredDrinkCard = document.getElementById('featured-drink-card');
const featuredDrinkImage = document.getElementById('featured-drink-image');
const featuredDrinkName = document.getElementById('featured-drink-name');
const featuredDrinkPrice = document.getElementById('featured-drink-price');
const featuredDrinkDescription = document.getElementById('featured-drink-description');
const featuredDrinkForm = document.getElementById('featured-drink-form');
const featuredNameInput = document.getElementById('featured-name-input');
const featuredPriceInput = document.getElementById('featured-price-input');
const featuredDescriptionInput = document.getElementById('featured-description-input');
const featuredImageInput = document.getElementById('featured-image-input');

const locationForm = document.getElementById('location-form');
const locationInput = document.getElementById('location-input');
const addItemForm = document.getElementById('add-item-form');
const itemNameInput = document.getElementById('item-name');
const itemPriceInput = document.getElementById('item-price');
const ownerMenuList = document.getElementById('owner-menu-list');

const mpesaTipBtn = document.getElementById('mpesa-tip-btn');
const mpesaModal = document.getElementById('mpesa-modal');
const mpesaModalClose = document.getElementById('mpesa-modal-close');
const mpesaForm = document.getElementById('mpesa-form');
const mpesaPhoneInput = document.getElementById('mpesa-phone');
const mpesaSendBtn = document.getElementById('mpesa-send-btn');
const mpesaFormView = document.getElementById('mpesa-form-view');
const mpesaSuccessView = document.getElementById('mpesa-success-view');

let scrollObserver = null;
let parallaxInitialized = false;

// Initialize
function init() {
    loadSunsetMode();
    routeView();
    loadData();
    setupEventListeners();
    render();
    setupParallax();
}

// View routing via URL parameter
function isAdminMode() {
    const params = new URLSearchParams(window.location.search);
    const admin = params.get('admin');
    if (admin === 'true' || admin === '1') {
        return true;
    }

    // Fallback when query params are stripped (some file:// or preview hosts)
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();
    return hash === 'admin' || hash === 'admin=true';
}

function routeView() {
    const admin = isAdminMode();
    customerView.classList.toggle('active', !admin);
    ownerView.classList.toggle('active', admin);
}

// Sunset Mode
function loadSunsetMode() {
    const saved = localStorage.getItem(SUNSET_STORAGE_KEY);
    const isSunset = saved === 'true';
    document.documentElement.classList.toggle('sunset-mode', isSunset);
    sunsetToggle.checked = isSunset;
}

function saveSunsetMode(enabled) {
    localStorage.setItem(SUNSET_STORAGE_KEY, enabled ? 'true' : 'false');
}

// Data Management
function loadData() {
    const savedState = localStorage.getItem('coffeeCartState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state = {
            location: "Not set yet",
            menu: [],
            dailyMessage: "",
            featuredDrink: { ...DEFAULT_FEATURED_DRINK },
            ...parsed,
            featuredDrink: { ...DEFAULT_FEATURED_DRINK, ...(parsed.featuredDrink || {}) }
        };
    }
}

function saveData() {
    localStorage.setItem('coffeeCartState', JSON.stringify(state));
}

// Event Listeners
function setupEventListeners() {
    sunsetToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        document.documentElement.classList.toggle('sunset-mode', enabled);
        saveSunsetMode(enabled);
    });

    locationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLocation = locationInput.value.trim();
        if (newLocation) {
            state.location = newLocation;
            saveData();
            render();
            
            const btn = locationForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = "Updated!";
            btn.style.backgroundColor = "var(--accent-caramel)";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = "";
            }, 1500);
        }
    });

    dailyMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.dailyMessage = dailyMessageInput.value.trim();
        saveData();
        render();

        const btn = dailyMessageForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = state.dailyMessage ? "Updated!" : "Cleared!";
        btn.style.backgroundColor = "var(--accent-caramel)";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = "";
        }, 1500);
    });

    featuredDrinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = featuredNameInput.value.trim();
        const price = parseFloat(featuredPriceInput.value);
        const description = featuredDescriptionInput.value.trim();
        const imageUrl = featuredImageInput.value.trim();

        if (!name || isNaN(price)) {
            return;
        }

        state.featuredDrink = { name, price, description, imageUrl };
        saveData();
        render();

        const btn = featuredDrinkForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = "Updated!";
        btn.style.backgroundColor = "var(--accent-caramel)";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = "";
        }, 1500);
    });

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        const price = parseFloat(itemPriceInput.value);

        if (name && !isNaN(price)) {
            const newItem = {
                id: Date.now().toString(),
                name: name,
                price: price,
                soldOut: false
            };
            state.menu.push(newItem);
            saveData();
            render();
            addItemForm.reset();
        }
    });

    setupMpesaModal();
}

function setupMpesaModal() {
    mpesaTipBtn.addEventListener('click', openMpesaModal);

    mpesaModalClose.addEventListener('click', closeMpesaModal);
    mpesaModal.querySelector('.modal-backdrop').addEventListener('click', closeMpesaModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mpesaModal.hidden) {
            closeMpesaModal();
        }
    });

    mpesaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = mpesaPhoneInput.value.trim();
        if (!phone) {
            mpesaPhoneInput.focus();
            return;
        }

        mpesaSendBtn.disabled = true;
        mpesaSendBtn.textContent = 'Loading...';

        setTimeout(() => {
            mpesaFormView.hidden = true;
            mpesaSuccessView.hidden = false;
            mpesaSendBtn.disabled = false;
            mpesaSendBtn.textContent = 'Send Prompt';
        }, 2000);
    });
}

function openMpesaModal() {
    resetMpesaModal();
    mpesaModal.hidden = false;
    mpesaModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    mpesaPhoneInput.focus();
}

function closeMpesaModal() {
    mpesaModal.hidden = true;
    mpesaModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    resetMpesaModal();
}

function resetMpesaModal() {
    mpesaFormView.hidden = false;
    mpesaSuccessView.hidden = true;
    mpesaSendBtn.disabled = false;
    mpesaSendBtn.textContent = 'Send Prompt';
    mpesaPhoneInput.value = '';
}

function formatPrice(price) {
    const amount = Number(price);
    if (isNaN(amount)) return 'KSh 0';
    return 'KSh ' + amount.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

function getFeaturedImageUrl(url) {
    return (url || '').trim() || DEFAULT_FEATURED_IMAGE;
}

function getMenuItemImage(item, index) {
    if (item.imageUrl && item.imageUrl.trim()) {
        return item.imageUrl.trim();
    }
    return MENU_PLACEHOLDER_IMAGES[index % MENU_PLACEHOLDER_IMAGES.length];
}

function setImageWithFallback(img, src, fallback) {
    img.src = src;
    img.onerror = () => {
        img.onerror = null;
        img.src = fallback;
    };
}

function applyFloatDelays() {
    const floats = document.querySelectorAll('#customer-view .float-idle');
    floats.forEach((el, i) => {
        el.style.animationDelay = `${(i * 0.35) % 2.1}s`;
    });
}

function setupScrollReveal() {
    if (scrollObserver) {
        scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('#customer-view .scroll-reveal').forEach(el => {
        el.classList.remove('is-visible');
        scrollObserver.observe(el);
    });
}

function setupParallax() {
    if (parallaxInitialized) return;

    const shapes = customerView.querySelectorAll('.parallax-shape');
    if (!shapes.length) return;

    const onScroll = () => {
        const scrollY = window.scrollY;
        shapes.forEach((shape, i) => {
            const speed = 0.04 + i * 0.025;
            shape.style.transform = `translate3d(0, ${scrollY * speed * -1}px, 0)`;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    parallaxInitialized = true;
}

function render() {
    // Render Location
    displayLocation.textContent = state.location;
    locationInput.value = state.location !== "Not set yet" ? state.location : "";

    // Render Daily Message banner
    const message = (state.dailyMessage || '').trim();
    dailyMessageInput.value = state.dailyMessage || '';
    if (message) {
        displayDailyMessage.textContent = message;
        vibeBanner.hidden = false;
        vibeBanner.classList.remove('is-hidden');
    } else {
        displayDailyMessage.textContent = '';
        vibeBanner.hidden = true;
        vibeBanner.classList.add('is-hidden');
    }

    // Render Featured Drink
    const drink = state.featuredDrink || DEFAULT_FEATURED_DRINK;
    const drinkName = (drink.name || '').trim();
    if (drinkName) {
        const imageUrl = getFeaturedImageUrl(drink.imageUrl);
        featuredDrinkCard.hidden = false;
        featuredDrinkName.textContent = drinkName;
        featuredDrinkPrice.textContent = formatPrice(drink.price);
        featuredDrinkDescription.textContent = drink.description || '';
        setImageWithFallback(featuredDrinkImage, imageUrl, DEFAULT_FEATURED_IMAGE);
        featuredDrinkImage.alt = drinkName;

        featuredNameInput.value = drink.name || '';
        featuredPriceInput.value = drink.price ?? '';
        featuredDescriptionInput.value = drink.description || '';
        featuredImageInput.value = drink.imageUrl || '';
    } else {
        featuredDrinkCard.hidden = true;
    }

    // Render Customer Menu
    customerMenuList.innerHTML = '';
    if (state.menu.length === 0) {
        customerMenuList.innerHTML = '<p style="text-align:center; opacity:0.6; padding: 20px;">Menu is empty today.</p>';
    } else {
        state.menu.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = `menu-item menu-item-card scroll-reveal ${item.soldOut ? 'sold-out' : ''}`;
            const imageSrc = getMenuItemImage(item, index);

            li.innerHTML = `
                <div class="menu-item-image-wrap float-idle">
                    <img class="menu-item-image float-target" src="${imageSrc}" alt="${item.name}" loading="lazy">
                </div>
                <div class="item-info">
                    <span class="item-name">
                        ${item.name}
                        ${item.soldOut ? '<span class="sold-out-badge">Sold Out</span>' : ''}
                    </span>
                </div>
                <span class="item-price">${formatPrice(item.price)}</span>
            `;

            const img = li.querySelector('.menu-item-image');
            setImageWithFallback(img, imageSrc, MENU_PLACEHOLDER_IMAGES[0]);

            customerMenuList.appendChild(li);
        });
    }

    // Render Owner Menu
    ownerMenuList.innerHTML = '';
    if (state.menu.length === 0) {
        ownerMenuList.innerHTML = '<p style="text-align:center; opacity:0.6; padding: 20px;">No items added yet.</p>';
    } else {
        state.menu.forEach(item => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            
            li.innerHTML = `
                <div class="item-info" style="flex: 1;">
                    <span class="item-name">${item.name}</span>
                </div>
                <span class="item-price">${formatPrice(item.price)}</span>
                <div class="item-actions">
                    <button class="btn-action btn-sold-out ${item.soldOut ? 'active' : ''}" data-id="${item.id}">
                        ${item.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                    </button>
                    <button class="btn-action btn-delete" data-id="${item.id}">Delete</button>
                </div>
            `;
            ownerMenuList.appendChild(li);
        });

        document.querySelectorAll('.btn-sold-out').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const item = state.menu.find(i => i.id === id);
                if (item) {
                    item.soldOut = !item.soldOut;
                    saveData();
                    render();
                }
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                state.menu = state.menu.filter(i => i.id !== id);
                saveData();
                render();
            });
        });
    }

    applyFloatDelays();
    setupScrollReveal();
}

// Run app
init();
