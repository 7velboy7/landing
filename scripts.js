/* Scripts for interactivity */
// NOTE: To add images for a case, place <img> tags inside that case's
// .case-image-slider in landing/index.html. If a case has more than 1 image,
// Gallery Mode will be enabled automatically for that case.

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.dataset.ctaScrollInit) {
        document.body.dataset.ctaScrollInit = '1';
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a.cta-discuss, button.cta-discuss');
            if (!link) return;
            const selector = link.getAttribute('href') || link.dataset.scrollTo;
            if (!selector || !selector.startsWith('#')) return;
            const target = document.querySelector(selector);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, true);
    }

    const topSliderDotsSlot = document.getElementById('top-slider-dots-slot');
    const topSliderWrapper = document.getElementById('top-slider');
    if (topSliderDotsSlot && topSliderWrapper) {
        const topDots = topSliderWrapper.querySelector('.top-slider-dots');
        if (topDots && !topSliderDotsSlot.contains(topDots)) {
            topSliderDotsSlot.innerHTML = '';
            topSliderDotsSlot.appendChild(topDots);
        }
    }

    const downloadButton = document.getElementById('download-portfolio');
    if (downloadButton) {
        downloadButton.addEventListener('click', (event) => {
            event.preventDefault();
            const url = '/portfolio.pdf';
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Alex_Velboy_Portfolio.pdf';
            link.rel = 'noopener';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }

    /* 1. Mobile Menu Toggle */
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');

            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                // Small timeout to allow display:block to apply before transform
                setTimeout(() => {
                    mobileMenu.classList.add('active');
                }, 10);
            } else {
                mobileMenu.classList.remove('active');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300); // Match transition duration
            }
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            });
        });
    }

    /* 2. FAQ Pop Sound */
    const faqItems = document.querySelectorAll('.faq-accordion .faq-item');
    const faqPop = document.getElementById('faq-pop');

    if (faqItems.length && faqPop) {
        faqItems.forEach(item => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    faqPop.currentTime = 0.7;
                    faqPop.play().catch(() => { });
                }
            });
        });
    }

    /* 3. Smooth Scroll (Fallback for older browsers if needed, mostly handled by CSS) */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Check if we need to pre-select a project type
                const projectType = this.getAttribute('data-project-type');
                if (projectType) {
                    const select = document.getElementById('project_type_select');
                    if (select) {
                        select.value = projectType;
                    }
                }

                // Handle horizontal slider if target is a slide
                const slider = targetElement.closest('.project-slider');
                if (slider) {
                    const slideWidth = slider.getBoundingClientRect().width;
                    const slides = Array.from(slider.querySelectorAll('.project-slide'));
                    const slideIndex = slides.indexOf(targetElement);
                    if (slideIndex !== -1) {
                        slider.scrollTo({
                            left: slideIndex * slideWidth,
                            behavior: 'smooth'
                        });
                    }
                }

                // Offset for fixed header
                const headerHeight = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    /* 4. Language Switcher Logic */
    const langBtns = document.querySelectorAll('.lang-btn');
    const baseUrl = new URL('.', window.location.href);
    const remoteTranslationsBase = 'https://pub-d6351097e47d49159f1c58b84eed5a4a.r2.dev';
    const translationPaths = {
        en: [
            new URL('src/i18n/translations/en.json', baseUrl).href,
            '/src/i18n/translations/en.json',
            `${remoteTranslationsBase}/i18n/translations/en.json`
        ],
        ua: [
            new URL('src/i18n/translations/ua.json', baseUrl).href,
            '/src/i18n/translations/ua.json',
            `${remoteTranslationsBase}/i18n/translations/ua.json`
        ]
    };
    const translations = {};

    const fetchJson = async (path) => {
        try {
            const response = await fetch(path, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Fetch failed for ${path}.`, error);
            return null;
        }
    };

    const loadInlineTranslations = (lang) => {
        const scriptEl = document.getElementById(`i18n-${lang}`);
        if (!scriptEl) return null;
        try {
            return JSON.parse(scriptEl.textContent);
        } catch (error) {
            console.warn(`Inline JSON parse failed for ${lang}.`, error);
            return null;
        }
    };

    const loadJsonViaXhr = (path) => new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.overrideMimeType('application/json');
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    console.warn(`XHR JSON parse failed for ${path}.`, error);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };
        xhr.onerror = () => resolve(null);
        xhr.send();
    });

    const loadTranslations = async () => {
        await Promise.all(Object.entries(translationPaths).map(async ([lang, paths]) => {
            for (const path of paths) {
                const data = await fetchJson(path) || await loadJsonViaXhr(path);
                if (data) {
                    translations[lang] = data;
                    break;
                }
            }

            const inlineData = loadInlineTranslations(lang);
            if (inlineData) {
                if (translations[lang]) {
                    Object.entries(inlineData).forEach(([key, value]) => {
                        if (!(key in translations[lang])) {
                            translations[lang][key] = value;
                        }
                    });
                } else {
                    translations[lang] = inlineData;
                }
            }

            if (!translations[lang]) {
                console.error(`Failed to load translations for ${lang}.`);
            }
        }));
    };

    const getTranslation = (lang, key) => {
        if (!translations[lang]) return null;
        return translations[lang][key] ?? null;
    };

    function setLanguage(lang) {
        if (!translations[lang]) return;

        document.documentElement.lang = lang;

        // Toggle Active Class
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Text Content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = getTranslation(lang, key);
            if (!value) return;

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        });

        // Update ARIA labels
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const value = getTranslation(lang, key);
            if (value) {
                element.setAttribute('aria-label', value);
            }
        });

        // Save preference
        localStorage.setItem('preferredLang', lang);

        // Prepare About text for typing animation
        prepareAboutText();
    }

    function prepareAboutText() {
        const containers = document.querySelectorAll('.about-text-reveal');
        containers.forEach(container => {
            const text = container.textContent.trim();
            const words = text.split(/\s+/);
            container.innerHTML = words.map(word => `<span class="typing-word">${word}</span>`).join(' ');
        });
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    const translationsReady = loadTranslations().then(() => {
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        setLanguage(savedLang);
    });

    /* 5. Header CTA Scroll Logic */
    const headerCta = document.getElementById('header-cta');
    const heroSection = document.querySelector('.hero');

    if (headerCta && heroSection) {
        const updateHeaderCta = () => {
            const lang = localStorage.getItem('preferredLang') || 'en';
            const nextKey = window.scrollY > 400 ? 'nav_request_project' : 'nav_contact_me';
            const nextText = getTranslation(lang, nextKey);

            if (window.scrollY > 400) {
                headerCta.classList.add('scrolled');
            } else {
                headerCta.classList.remove('scrolled');
            }

            if (nextText) {
                headerCta.textContent = nextText;
            }
            headerCta.setAttribute('data-i18n', nextKey);
        };

        window.addEventListener('scroll', updateHeaderCta);

        translationsReady.then(() => {
            updateHeaderCta();
        });

        langBtns.forEach(btn => {
            btn.addEventListener('click', updateHeaderCta);
        });
    }

    /* 6. Form Submission Logic */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        let isSubmitting = false;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (isSubmitting) {
                return;
            }

            isSubmitting = true;
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            const successMessage = contactForm.querySelector('#form-success');
            const errorMessage = contactForm.querySelector('#form-error');
            const honeypot = contactForm.querySelector('input[name="website"]');
            const lang = localStorage.getItem('preferredLang') || 'en';
            const successText = getTranslation(lang, 'form_success_text') || '✅ Sent';
            const errorText = getTranslation(lang, 'form_error_text') || '❌ Error';
            const loadingText = getTranslation(lang, 'form_submit_loading') || 'Sending...';
            const receiptPending = getTranslation(lang, 'form_success_receipt_pending') || '';

            if (successMessage) {
                successMessage.classList.add('hidden');
            }
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }

            if (honeypot && honeypot.value.trim()) {
                contactForm.reset();
                if (successMessage) {
                    successMessage.textContent = successText;
                    successMessage.classList.remove('hidden');
                }
                if (errorMessage) {
                    errorMessage.classList.add('hidden');
                }
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                isSubmitting = false;
                return;
            }

            // Show loading state
            submitBtn.textContent = loadingText;
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const payload = {
                name: (formData.get('name') || '').toString().trim(),
                email: (formData.get('email') || '').toString().trim(),
                message: (formData.get('message') || '').toString().trim(),
                website: (formData.get('website') || '').toString().trim(),
                projectType: (formData.get('projectType') || '').toString().trim(),
                budget: (formData.get('budget') || '').toString().trim()
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok && result.ok === true) {
                    contactForm.reset();
                    if (successMessage) {
                        const receiptNote = result.receipt_ok === false ? receiptPending : "";
                        successMessage.textContent = `${successText}${receiptNote}`;
                        successMessage.classList.remove('hidden');
                    }
                    if (errorMessage) {
                        errorMessage.classList.add('hidden');
                    }
                    console.log('Contact form submitted successfully.');
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = result.error ? `${errorText} ${result.error}` : errorText;
                        errorMessage.classList.remove('hidden');
                    }
                    if (successMessage) {
                        successMessage.classList.add('hidden');
                    }
                    console.error('Contact form submission failed.', result);
                }
            } catch (error) {
                if (errorMessage) {
                    errorMessage.textContent = errorText;
                    errorMessage.classList.remove('hidden');
                }
                if (successMessage) {
                    successMessage.classList.add('hidden');
                }
                console.error('Contact form submission error.', error);
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                isSubmitting = false;
            }
        });
    }

    /* 7. UNIFIED 2-LEVEL SWIPE UX (State Machine) */
    const initProjectSlider = (sliderRoot) => {
        if (!sliderRoot || sliderRoot.dataset.swipeInit === '1') return;
        sliderRoot.dataset.swipeInit = '1';

        // --- Configuration & State ---
        const track = sliderRoot.querySelector('.kooperativ-track, .future-track');
        // We use children of track as slides
        const slides = Array.from(track.children);
        const dotsContainer = sliderRoot.id === 'kooperativ-slider'
            ? document.querySelector('#top-slider-dots-slot .top-slider-dots')
            : document.querySelector('#lower-cases .future-slider-dots');

        // Internal State
        let MODE = "CASE"; // "CASE" | "GALLERY"
        let caseIndex = 0;
        let imageIndex = 0;

        let activeGalleryComp = null; // { wrapper, items, track, ... }

        // Touch state
        let tune = {
            startX: 0,
            startY: 0,
            currentX: 0,
            isDragging: false,
            intent: null, // 'horizontal' | 'vertical' | null
            lock: false,
            galleryAnimating: false
        };

        // --- Helpers ---
        const logState = () => {
            console.log("MODE:", MODE, "caseIndex:", caseIndex, "imageIndex:", imageIndex);
        };

        const getSlideWidth = () => sliderRoot.getBoundingClientRect().width;

        const updateDots = (idx) => {
            if (!dotsContainer) return;
            const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
            dots.forEach((dot, i) => {
                dot.classList.toggle('is-active', i === idx);
                if (i === idx) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        };

        // --- Case Navigation (Level 1) ---
        const snapToCase = (idx, animate = true) => {
            const max = slides.length - 1;
            caseIndex = Math.max(0, Math.min(idx, max));

            const w = getSlideWidth();
            const offset = -caseIndex * w;

            // Using scroll-behavior via CSS on the container is possible, 
            // but for mixed modes, transform is often smoother. 
            // However, existing CSS uses scroll-snap for fallback. 
            // We'll control scrollLeft for "CASE" mode to keep it native-friendly.

            if (animate) {
                sliderRoot.scrollTo({ left: caseIndex * w, behavior: 'smooth' });
            } else {
                sliderRoot.scrollTo({ left: caseIndex * w, behavior: 'auto' });
            }

            updateDots(caseIndex);

            // If we changed case, ensure we reset gallery mode of previous case if needed
            // (though we usually exit gallery before switching).
            MODE = "CASE";
            imageIndex = 0;
            if (activeGalleryComp) exitGalleryMode();

            logState();
        };

        // Sync scroll to index (handling resize or native scroll)
        sliderRoot.addEventListener('scroll', () => {
            if (MODE === 'GALLERY') return; // Ignore scroll events during gallery manipulation
            const w = getSlideWidth();
            const idx = Math.round(sliderRoot.scrollLeft / w);
            if (idx !== caseIndex) {
                caseIndex = idx;
                updateDots(caseIndex);
                logState();
            }
        }, { passive: true });


        // --- Gallery Functionality (Level 2) ---

        // Check if a slide has multiple images and setup gallery DOM if needed
        const setupGalleryForSlide = (slide) => {
            const imgContainer = slide.querySelector('.case-image');
            const nativeSlider = slide.querySelector('.case-image-slider');

            if (!imgContainer || !nativeSlider) return null;

            const imgs = Array.from(nativeSlider.querySelectorAll('img'));
            if (imgs.length < 2) return null; // Logic 2: If 1 image, keep behavior as-is (no gallery)

            // Create Gallery DOM if not exists
            let galleryWrapper = imgContainer.querySelector('.case-gallery');
            if (!galleryWrapper) {
                galleryWrapper = document.createElement('div');
                galleryWrapper.className = 'case-gallery';

                // Add "Back to case" button
                const backBtn = document.createElement('button');
                backBtn.className = 'gallery-back';
                backBtn.innerText = 'Back to case';
                backBtn.setAttribute('data-i18n', 'gallery_back');
                backBtn.type = 'button';
                // Stop propagation on click to avoid triggering other handlers
                backBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
                backBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log("Back to case clicked");
                    exitGalleryMode();
                });

                const trackDiv = document.createElement('div');
                trackDiv.className = 'gallery-track';

                imgs.forEach((img, i) => {
                    img.draggable = false;
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    const clone = img.cloneNode(true);
                    clone.draggable = false;
                    item.appendChild(clone);
                    trackDiv.appendChild(item);
                });

                galleryWrapper.appendChild(backBtn);
                galleryWrapper.appendChild(trackDiv);
                imgContainer.appendChild(galleryWrapper);

                // Attach listeners for fluid interaction
                galleryWrapper.addEventListener('touchstart', (e) => handleTouchStart(e), { passive: false });
                galleryWrapper.addEventListener('mousedown', (e) => handleTouchStart(e));
                galleryWrapper.addEventListener('wheel', (e) => handleWheel(e), { passive: false });
            }

            return {
                wrapper: galleryWrapper,
                items: Array.from(galleryWrapper.querySelectorAll('.gallery-item')),
                count: imgs.length,
                slideElement: slide,
                originalParent: imgContainer
            };
        };

        const updateGalleryVisuals = () => {
            if (!activeGalleryComp) return;
            const { items } = activeGalleryComp;

            items.forEach((item, i) => {
                // Clear drag overrides
                item.style.transform = '';
                item.style.transition = '';
                // Reset classes
                item.className = 'gallery-item';

                if (i === imageIndex) {
                    item.classList.add('is-active');
                } else if (i === imageIndex - 1) {
                    item.classList.add('is-prev');
                } else if (i === imageIndex + 1) {
                    item.classList.add('is-next');
                } else if (i < imageIndex) {
                    item.classList.add('is-far-prev');
                } else {
                    item.classList.add('is-far-next');
                }
            });
        };

        const handleKeyDown = (e) => {
            if (MODE !== 'GALLERY') return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateGallery(1);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                exitGalleryMode();
            }
        };

        const enterGalleryMode = (galleryComp, startIndex = 0) => {
            if (MODE === 'GALLERY') return;

            MODE = "GALLERY";
            activeGalleryComp = galleryComp;
            imageIndex = startIndex;

            // Move to body to break out of any overflow:hidden
            document.body.appendChild(activeGalleryComp.wrapper);
            document.body.style.overflow = 'hidden';

            activeGalleryComp.wrapper.classList.add('is-active');
            activeGalleryComp.slideElement.classList.add('gallery-mode');

            document.addEventListener('keydown', handleKeyDown);

            updateGalleryVisuals();
            logState();
        };

        // Click-to-Expand Logic
        slides.forEach(slide => {
            const nativeSlider = slide.querySelector('.case-image-slider');
            if (nativeSlider) {
                const carouselImages = Array.from(nativeSlider.querySelectorAll('img'));
                carouselImages.forEach((img, idx) => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', (e) => {
                        // Prevent click if we were dragging (small movement threshold)
                        // Note: tune.startX is updated on handleTouchStart
                        // On desktop/mouse, we might need to check movement
                        const galleryComp = setupGalleryForSlide(slide);
                        if (galleryComp) enterGalleryMode(galleryComp, idx);
                    });
                });
            }
        });

        const exitGalleryMode = () => {
            if (MODE === 'CASE') return;

            document.removeEventListener('keydown', handleKeyDown);

            MODE = "CASE";
            if (activeGalleryComp) {
                activeGalleryComp.wrapper.classList.remove('is-active');
                activeGalleryComp.slideElement.classList.remove('gallery-mode');

                // Move back to original parent after transition
                const wrapper = activeGalleryComp.wrapper;
                const parent = activeGalleryComp.originalParent;
                setTimeout(() => {
                    if (parent && wrapper.parentElement === document.body) {
                        parent.appendChild(wrapper);
                    }
                }, 300);
            }
            document.body.style.overflow = '';
            activeGalleryComp = null;

            // Re-enable native scrolling
            // sliderRoot.style.overflowX = 'auto';

            imageIndex = 0;
            logState();
        };

        const navigateGallery = (dir) => {
            if (!activeGalleryComp || tune.galleryAnimating) return;

            // Strict limit to 1 step
            const move = dir > 0 ? 1 : -1;
            const nextIdx = imageIndex + move;

            if (nextIdx < 0 || nextIdx >= activeGalleryComp.count) {
                return;
            } else {
                tune.galleryAnimating = true;
                imageIndex = nextIdx;
                updateGalleryVisuals();
                logState();

                setTimeout(() => { tune.galleryAnimating = false; }, 500);
            }
        };


        // --- Event Handling ---

        function handleTouchStart(e) {
            if (e.target.closest('a, button, .cta-discuss') && !e.target.closest('.gallery-back')) {
                // Let links work, except for our back button which we handle
                return;
            }

            // Do NOT preventDefault here, it kills the scroll gesture start
            tune.startX = e.touches ? e.touches[0].clientX : e.clientX;
            tune.startY = e.touches ? e.touches[0].clientY : e.clientY;
            tune.isDragging = true;
            tune.intent = null;
            tune.lock = false;
        }

        function handleTouchMove(e) {
            if (!tune.isDragging) return;

            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            const dx = x - tune.startX;
            const dy = y - tune.startY;

            if (!tune.intent) {
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        tune.intent = 'horizontal';
                        tune.lock = true;
                    } else {
                        tune.intent = 'vertical';
                        tune.isDragging = false;
                        return;
                    }
                }
            }

            if (tune.intent === 'horizontal') {
                const target = e.target;
                const isImageArea = target.closest('.case-image');

                if (MODE === 'CASE' && isImageArea) {
                    // Let native sub-slider (photos) scroll 1-by-1
                    // No preventDefault() here -> native scroll wins
                } else if (MODE === 'GALLERY' && activeGalleryComp) {
                    e.preventDefault();
                    const activeItem = activeGalleryComp.items[imageIndex];
                    if (activeItem) {
                        activeItem.style.transition = 'none';
                        activeItem.style.transform = `translateX(${dx}px) scale(1.05)`;
                    }
                }
            }
        }

        function handleTouchEnd(e) {
            if (!tune.isDragging || tune.intent !== 'horizontal') {
                tune.isDragging = false;
                return;
            }

            if (MODE === 'GALLERY' && activeGalleryComp) {
                const activeItem = activeGalleryComp.items[imageIndex];
                if (activeItem) {
                    activeItem.style.transition = '';
                }
            }

            const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const dx = endX - tune.startX;
            // Increased threshold for more deliberate swipe
            const threshold = 50;

            if (Math.abs(dx) > threshold) {
                const dir = dx > 0 ? -1 : 1;
                const target = e.target;
                const isImageArea = target.closest('.case-image');

                if (MODE === 'CASE') {
                    if (isImageArea) {
                        // Strict 1-by-1 Carousel Scroll
                        const slider = target.closest('.case-image-slider');
                        if (slider) {
                            const w = slider.offsetWidth;
                            const moveDir = dx > 0 ? -1 : 1;
                            const currentIdx = Math.round(slider.scrollLeft / w);
                            // Strictly limit to 1 step
                            const targetIdx = currentIdx + moveDir;
                            slider.scrollTo({ left: targetIdx * w, behavior: 'smooth' });
                        }
                        return;
                    }
                    // Strict 1-by-1 Case Scroll
                    snapToCase(caseIndex + dir);
                } else if (MODE === 'GALLERY') {
                    // In gallery mode, we assume full control on horizontal swipes
                    // (The container is likely fullscreen overlays or taking up space)
                    // Request says: "Swipes inside image frame control gallery... Swipes outside switch cases"
                    // But in Gallery Mode, text is hidden, so most screen is image frame.

                    if (isImageArea || activeGalleryComp.wrapper.contains(target)) {
                        navigateGallery(dir);
                    } else {
                        // Should be impossible if text is hidden, but fail-safe:
                        exitGalleryMode();
                        snapToCase(caseIndex + dir);
                    }
                }
            } else {
                // Return to original state if threshold not met
                if (MODE === 'CASE') {
                    snapToCase(caseIndex);
                } else if (MODE === 'GALLERY') {
                    updateGalleryVisuals();
                }
            }

            tune.isDragging = false;
        }

        // Attach listeners to the specific slider root
        sliderRoot.addEventListener('touchstart', handleTouchStart, { passive: false });
        sliderRoot.addEventListener('touchmove', handleTouchMove, { passive: false });
        sliderRoot.addEventListener('touchend', handleTouchEnd);
        sliderRoot.addEventListener('mousedown', handleTouchStart);

        // Global window listeners for the move/end phases to ensure continuity
        window.addEventListener('mousemove', handleTouchMove);
        window.addEventListener('mouseup', handleTouchEnd);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        // --- Gallery Wheel Support ---
        function handleWheel(e) {
            if (MODE !== 'GALLERY') return;
            e.preventDefault();
            // Debounce wheel to prevent rapid skipping
            if (tune.wheelTarget) return;

            const dir = e.deltaX > 0 || e.deltaY > 0 ? 1 : -1;
            navigateGallery(dir);

            tune.wheelTarget = true;
            setTimeout(() => { tune.wheelTarget = false; }, 400);
        }

        // Initial setup
        updateDots(caseIndex);
        logState();
    };

    // Initialize logic
    document.querySelectorAll('.project-slider').forEach(initProjectSlider);




    /* 8. Audio Playback Logic (Final Step - Lightning) */
    const finalStep = document.getElementById('final-step');
    const alarmAudio = document.getElementById('alarm-audio');
    const lightningVideos = document.querySelectorAll('.lightning-video');

    if (finalStep && alarmAudio) {
        finalStep.addEventListener('mouseenter', () => {
            // Set audio start time
            if (Math.abs(alarmAudio.currentTime - 27) > 0.5) {
                alarmAudio.currentTime = 27;
            }

            const startPlayback = () => {
                document.body.classList.add('fx-active'); // Start CSS animation

                // Calculate center position for zoom effect
                const rect = finalStep.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (window.innerWidth / 2) - centerX;
                const deltaY = (window.innerHeight / 2) - centerY;
                finalStep.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(2)`;

                // Play lightning videos
                lightningVideos.forEach(v => {
                    v.currentTime = 0;
                    v.play().catch(e => console.log('Lightning video play failed', e));
                });
            };

            alarmAudio.play()
                .then(startPlayback)
                .catch(error => {
                    console.warn("Audio play failed (autoplay policy?), forcing visual effects anyway.", error);
                    // Force visual effects even if audio fails
                    startPlayback();
                });
        });

        const resetAll = () => {
            alarmAudio.pause();
            document.body.classList.remove('fx-active');
            finalStep.style.transform = '';
            lightningVideos.forEach(v => {
                v.pause();
            });
        };

        finalStep.addEventListener('mouseleave', resetAll);

        // Auto-stop audio loop
        alarmAudio.addEventListener('timeupdate', () => {
            if (alarmAudio.currentTime >= 39) {
                resetAll();
                alarmAudio.currentTime = 27;
            }
        });
    }



    /* 8. Confetti Animation (Step 2) */
    const stepConcepts = document.getElementById('step-concepts');

    if (stepConcepts) {
        stepConcepts.addEventListener('mouseenter', () => {
            // Create a burst of colorful confetti
            const rect = stepConcepts.getBoundingClientRect();
            // Origin at the center of the block
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 80,
                spread: 70,
                origin: { x, y },
                colors: ['#FFE014', '#00B80F', '#2B57F5', '#F52B2B'],
                ticks: 200,
                gravity: 1.2,
                scalar: 0.9,
                zIndex: 1000
            });
        });
    }

    /* 9. Scroll-triggered Section Confetti */
    const processSection = document.getElementById('process');
    const sectionConfetti = processSection ? processSection.querySelector('.section-confetti-video') : null;

    if (processSection && sectionConfetti) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log("Process section in view, starting confetti...");
                    sectionConfetti.classList.add('active');
                    sectionConfetti.load(); // Force load
                    sectionConfetti.play().catch(e => console.error("Section confetti play error:", e));
                } else {
                    sectionConfetti.classList.remove('active');
                    sectionConfetti.pause();
                }
            });
        }, { threshold: 0.1 }); // Lower threshold for earlier start

        observer.observe(processSection);
    }

    /* 10. About Section Background Scroll-linked Animation */
    const aboutSection = document.getElementById('about');
    const revealCircle = aboutSection ? aboutSection.querySelector('.about-bg-reveal') : null;
    const playfulName = aboutSection ? aboutSection.querySelector('.playful-name') : null;
    let nameDropPlayed = false;

    if (aboutSection && revealCircle) {
        window.addEventListener('scroll', () => {
            const rect = aboutSection.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Progress calculation for left-to-right fill
            // 0: section starts entering viewport
            // 1: section is mostly in view
            const scrollStart = viewHeight;
            const scrollEnd = 0;
            const currentPos = rect.top;

            // Fill starts when top of section is at bottom of viewport
            // and completes when top of section reaches top of viewport
            let progress = 1 - (currentPos / viewHeight);
            progress = Math.max(0, Math.min(1, progress));

            revealCircle.style.transform = `scaleX(${progress})`;

            // Trigger playful text animation and apply jumping effect
            const spans = aboutSection.querySelectorAll('.playful-hey span, .playful-name span');
            if (progress > 0.05) {
                aboutSection.classList.add('text-active');

                // One-time falling drop for the name once the section is comfortably in view
                if (progress > 0.55 && !nameDropPlayed && playfulName) {
                    nameDropPlayed = true;
                    playfulName.classList.remove('drop-start');
                    playfulName.classList.add('is-dropping');
                    playfulName.addEventListener('animationend', () => {
                        playfulName.classList.remove('is-dropping');
                    }, { once: true });
                }

                // Active jumping effect based on progress and index
                spans.forEach((span, index) => {
                    // Create a wave effect: each letter jumps based on scroll progress and its index
                    const jumpHeight = 30; // pixels
                    const waveSpeed = 8;
                    const offset = Math.sin((progress * waveSpeed) + (index * 0.4)) * jumpHeight * progress;
                    const rotation = Math.cos((progress * waveSpeed) + (index * 0.4)) * 10 * progress;

                    span.style.transform = `translateY(${offset}px) rotate(${rotation}deg)`;
                });

                // Trigger typing animation when background is mostly full
                if (progress > 0.8) {
                    const revealParagraphs = aboutSection.querySelectorAll('.about-text-reveal');
                    revealParagraphs.forEach(p => p.classList.add('active'));
                }
            } else {
                aboutSection.classList.remove('text-active');
                spans.forEach(span => {
                    span.style.transform = ''; // Reset
                });

                // Reset drop if user scrolls far above (so it can play again on re-entry)
                if (progress === 0 && playfulName) {
                    nameDropPlayed = false;
                    playfulName.classList.remove('is-dropping');
                    playfulName.classList.add('drop-start');
                }

                // Hide text again if user scrolls way back up
                const revealParagraphs = aboutSection.querySelectorAll('.about-text-reveal');
                revealParagraphs.forEach(p => p.classList.remove('active'));
            }
        }, { passive: true });
    }

    /* 11. AI Chat Logic */
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatClose = document.getElementById('ai-chat-close');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            chatToggle.classList.toggle('active');
            if (!chatWindow.classList.contains('hidden')) {
                chatInput.focus();
            }
        });

        chatClose.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
            chatToggle.classList.remove('active');
        });

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            addMessage(message, 'user');
            chatInput.value = '';

            // Simulate bot thinking
            setTimeout(() => {
                const response = getBotResponse(message);
                addMessage(response, 'bot');
            }, 1000);
        });
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const defaultChatResponses = {
        price: "Projects usually start at $300 USD.",
        services: "Brand illustration, packaging, book & editorial illustration, and posters.",
        process: "The process has 4 steps: Discovery, Concepts, Refinement, and Final Delivery.",
        contact: "You can reach Alex at itsme@alexvelboy.com or via the contact form.",
        default: "Thanks for the question. Please check the sections above or email Alex at itsme@alexvelboy.com."
    };

    const intentPatterns = [
        {
            key: 'contact_telegram',
            patterns: [/telegram|телеграм|телег|\btg\b|\bтг\b|t\.?me/i]
        },
        {
            key: 'contact_email',
            patterns: [/\bemail\b|e-mail|почт|пошт|мейл|mail/i]
        },
        {
            key: 'contact_phone_whatsapp',
            patterns: [/whatsapp|ватсап|вотсап|телефон|номер|phone|mobile|мобил/i]
        },
        {
            key: 'contact_instagram',
            patterns: [/instagram|insta|інста|инста/i]
        },
        {
            key: 'contact_fastest',
            patterns: [/fastest|quickest|швидш|быстр/i]
        },
        {
            key: 'contact_call',
            patterns: [/call|созвон|дзвінок|звонок|call you|phone call|созван/i]
        },
        {
            key: 'contact_manager',
            patterns: [/manager|менеджер|арт-менеджер|art manager/i]
        },
        {
            key: 'order_apply_now',
            patterns: [/(apply|submit).*(now)/i, /можна\s+зараз/i, /можем\s+сейчас/i, /можно\s+сейчас/i]
        },
        {
            key: 'order_where_form',
            patterns: [/where.*form|де.*форма|где.*форма|форма.*сайт|contact form/i]
        },
        {
            key: 'order_where_click',
            patterns: [/where.*click|куди.*натис|куда.*наж|which button|кнопк/i]
        },
        {
            key: 'order_how',
            patterns: [/how to order|як замов|как заказ|start project|хочу замов|хочу заказать|как начать|how do we start/i]
        },
        {
            key: 'pricing_book_cover',
            patterns: [/book cover.*(price|cost|скільки|цена)|price.*book cover|обкладин.*книг|обложк.*книг/i]
        },
        {
            key: 'pricing_album_cover',
            patterns: [/album cover.*(price|cost|скільки|цена)|price.*album|обкладин.*альбом|обложк.*альбом/i]
        },
        {
            key: 'pricing_brand_series',
            patterns: [/brand series|series.*illustration|сері[яи].*ілюстр|серия.*иллюстр/i]
        },
        {
            key: 'pricing_mural',
            patterns: [/mural|мурал|стіна|стен(а|у)|wall painting/i]
        },
        {
            key: 'pricing_prepayment',
            patterns: [/prepay|pre-payment|deposit|предоплат|передоплат|аванс/i]
        },
        {
            key: 'pricing_fixed_or_hourly',
            patterns: [/hourly|per hour|почас|годин|hour rate|fixed price|фиксирован|фіксован/i]
        },
        {
            key: 'pricing_budget_options',
            patterns: [/options|packages|пакет|вариант|сценар|base|standard|extended/i]
        },
        {
            key: 'pricing_included',
            patterns: [/what'?s included|what is included|що входить|що включено|что входит|входит ли/i]
        },
        {
            key: 'pricing_cheaper',
            patterns: [/cheaper|дешевле|знижк|скидк|budget|бюджет|менш|less cost/i]
        },
        {
            key: 'pricing_minimum',
            patterns: [/minimum|min price|мінімальн|минимальн|starting from|from €|від €|от €|cheapest|найдешев|дешев|дешёв|самая минимальная|from what price|от какой цены|від якої ціни/i]
        },
        {
            key: 'pricing_rates',
            patterns: [/rate|rates|ставк|тариф|pricing rates|price list|pricelist|прайс/i]
        },
        {
            key: 'process_timeline',
            patterns: [/timeline|timeframe|how long|скільки часу|сколько времени|термін|сроки/i]
        },
        {
            key: 'process_availability',
            patterns: [/availability|available|вільн|свободн|коли старт|when start|дата старт|when can/i]
        },
        {
            key: 'process_revisions',
            patterns: [/revision|revisions|правк|правки|edits|changes|скільки правок|how many revisions/i]
        },
        {
            key: 'process_sketches',
            patterns: [/sketch|sketches|ескіз|скетч/i]
        },
        {
            key: 'process_rush',
            patterns: [/rush|urgent|термінов|срочн|fast/i]
        },
        {
            key: 'process_contract',
            patterns: [/contract|договір|договор/i]
        },
        {
            key: 'process_invoice',
            patterns: [/invoice|інвойс|рахунок|счет/i]
        },
        {
            key: 'process_start_requirements',
            patterns: [/what.*need.*start|to start.*need|для старту|що потрібно для старту|что нужно для старта/i]
        },
        {
            key: 'process_need_brief',
            patterns: [/need.*brief|нужно тз|потрібен бриф|brief required|тз нужно/i]
        },
        {
            key: 'process_help_brief',
            patterns: [/help.*brief|допомож.*бриф|помог.*бриф/i]
        },
        {
            key: 'process_refs',
            patterns: [/references|reference|референс|приклад|inspiration/i]
        },
        {
            key: 'process_prep_call',
            patterns: [/prep call|before call|перед дзвінком|before the call|call prep/i]
        },
        {
            key: 'process_dont_know',
            patterns: [/don't know|do not know|not sure|не знаю|не уверен|не впевнен/i]
        },
        {
            key: 'rights_source_files',
            patterns: [/source files|исходн|вихідн|psd|ai|source/i]
        },
        {
            key: 'rights_exclusive',
            patterns: [/exclusive|ексклюз|эксклюз|buyout|выкуп/i]
        },
        {
            key: 'rights_merch',
            patterns: [/merch|мерч|товар|merchandise/i]
        },
        {
            key: 'rights_print',
            patterns: [/print|друк|печать/i]
        },
        {
            key: 'rights_ads',
            patterns: [/ads|advert|реклама|ad use/i]
        },
        {
            key: 'rights_buy_more_later',
            patterns: [/extend|upgrade|додатков|пізніше|later|расширить/i]
        },
        {
            key: 'rights_formats',
            patterns: [/formats?|формат/i]
        },
        {
            key: 'rights_cmyk_rgb',
            patterns: [/cmyk|rgb/i]
        },
        {
            key: 'rights_pdf_print',
            patterns: [/pdf.*print|print.*pdf/i]
        },
        {
            key: 'rights_prepress',
            patterns: [/prepress|pre-press|типограф|print house/i]
        },
        {
            key: 'rights_mockups',
            patterns: [/mockup|мокап/i]
        },
        {
            key: 'rights_size_resolution',
            patterns: [/resolution|dpi|size|розмір|разрешен|роздільн/i]
        },
        {
            key: 'rights_ownership',
            patterns: [/ownership|copyright|права|авторськ|право/i]
        },
        {
            key: 'work_book_covers',
            patterns: [/book cover|обкладин.*книг|обложк.*книг/i]
        },
        {
            key: 'work_album_covers',
            patterns: [/album cover|album art|обкладин.*альбом|обложк.*альбом/i]
        },
        {
            key: 'work_brand_packaging',
            patterns: [/brand.*illustration|brand.*packaging|бренд.*ілюстр|бренд.*упаков|packaging|пакуван|упаков/i]
        },
        {
            key: 'work_editorial',
            patterns: [/editorial|едітор|редакц|журнал/i]
        },
        {
            key: 'work_characters',
            patterns: [/character|персонаж|сет-дизайн|set design/i]
        },
        {
            key: 'work_style_like_x',
            patterns: [/style like|exact style|copy style|в стиле|у стилі|как у|як у|под референс|під референс/i]
        },
        {
            key: 'work_agencies',
            patterns: [/agency|агенц|агентств/i]
        },
        {
            key: 'work_projects_not_taken',
            patterns: [/not take|don't take|не беру|не берете|не робите|не делаете|strict reference|exactly like/i]
        },
        {
            key: 'work_commissions',
            patterns: [/commission|custom|індив|индив|замовлен|заказ|commissioned/i]
        },
        {
            key: 'work_projects_taken',
            patterns: [/what.*projects|what.*do|які проєкти|які проекти|что делаете|какие проекты|what kind of work/i]
        },
        {
            key: 'about_portfolio',
            patterns: [/portfolio|портфоліо|портфолио/i]
        },
        {
            key: 'about_from_ukraine',
            patterns: [/from ukraine|з україни|из украины|ukrain/i]
        },
        {
            key: 'about_location',
            patterns: [/location|based|де ви|где вы|where are you/i]
        },
        {
            key: 'about_style',
            patterns: [/style|стиль|signature/i]
        },
        {
            key: 'about_values',
            patterns: [/values|цінност|ценност|values/i]
        },
        {
            key: 'about_clients',
            patterns: [/clients|клієнт|клиент|brands worked|clients worked/i]
        },
        {
            key: 'about_favorite_projects',
            patterns: [/favorite projects|улюблені проєкти|любимые проекты|favorite work/i]
        },
        {
            key: 'about_favorite',
            patterns: [/favorite|улюбл|любим|favorite part/i]
        },
        {
            key: 'trust_why_expensive',
            patterns: [/expensive|дорог|дорого|too expensive/i]
        },
        {
            key: 'trust_why_you',
            patterns: [/why you|чому ви|почему вы|why choose you|why should/i]
        },
        {
            key: 'trust_how_sure',
            patterns: [/how sure|насколько уверен|наскільки впев|sure of result|гарант/i]
        },
        {
            key: 'trust_if_dislike',
            patterns: [/if i don't like|if dislike|не сподоба|не понрав/i]
        },
        {
            key: 'trust_reviews',
            patterns: [/reviews|відгук|отзыв/i]
        },
        {
            key: 'trust_deadline_guarantee',
            patterns: [/deadline.*guarantee|guarantee.*deadline|гарант.*термін|гарант.*срок/i]
        },
        {
            key: 'contact_how_to_reach',
            patterns: [/contact|reach you|how to reach|як зв[’']?яз|как связ|контакт|пошт|почт/i]
        }
    ];

    const matchesAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

    const findIntent = (text) => {
        for (const intent of intentPatterns) {
            if (matchesAny(text, intent.patterns)) {
                return intent.key;
            }
        }
        return null;
    };

    function getBotResponse(input) {
        const text = input.toLowerCase().replace(/\s+/g, ' ').trim();
        const lang = localStorage.getItem('preferredLang') || 'en';

        const current = translations[lang] && translations[lang].chat_responses
            ? translations[lang].chat_responses
            : defaultChatResponses;

        const intent = findIntent(text);
        if (intent && current[intent]) {
            return current[intent];
        }

        if (matchesAny(text, [/how much|price|cost|pricing|скільки|ціна|цена|стоим|варт|budget|бюджет/i])) {
            return current.pricing_general || current.price;
        }
        if (matchesAny(text, [/service|services|послуг|услуг|what do you do|що робиш|чим займаєшся|what you do/i])) {
            return current.services;
        }
        if (matchesAny(text, [/process|workflow|how we work|як працю|как работа|процес|етап/i])) {
            return current.process;
        }
        if (matchesAny(text, [/contact|reach you|email|контакт|пошт|почт/i])) {
            return current.contact_how_to_reach || current.contact;
        }

        return current.default;
    }
});
