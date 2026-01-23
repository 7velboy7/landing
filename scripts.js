/* Scripts for interactivity */

document.addEventListener('DOMContentLoaded', () => {

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
                    faqPop.play().catch(() => {});
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
    const translations = {
        en: {
            nav_work: "Work",
            nav_services: "Services",
            nav_process: "Process",
            nav_about: "About",
            nav_availability: "Check Availability",
            nav_request: "Request Project",
            nav_contact_me: "Contact Me",
            nav_request_project: "Request a Project",
            hero_title: "Visual storytelling for <br> <span style='color: var(--color-secondary);'>ambitious brands & people.</span>",
            hero_sub: "I help brands, publishers, and musicians turn complex ideas into distinct visual narratives. Strategic illustration that turns attention into inquiries.",
            hero_cta_request: "Request a Project",
            hero_cta_view: "View Selected Cases",
            badge_available: "Available for Q4 2023",
            social_trusted: "Trusted by creative teams at:",
            services_title: "Focus & Deliverables",
            services_sub: "Select a category to see relevant examples.",
            service_ed_title: "Book & Editorial",
            service_ed_sub: "Book covers, book illustrations, and conceptual editorial art for magazines.",
            service_ed_cta: "See Examples",
            service_brand_title: "Brand Illustration",
            service_brand_sub: "Custom brand illustration for packaging, products, and physical spaces.",
            service_brand_cta: "See brand work",
            service_poster_title: "Album Art & Posters",
            service_poster_sub: "Full-release visuals for artists — covers, vinyl, merch, and posters.",
            service_poster_cta: "See Examples",
            work_title: "Selected Works",
            work_sub: "selection of concept-led work built for real-world use.",
            about_title: "Hey, I'm <span style='color: black'>A</span><span style='color: #E6C300'>l</span><span style='color: black'>e</span><span style='color: var(--color-alert)'>x</span> <span style='color: var(--color-secondary)'>V</span><span style='color: black'>e</span><span style='color: var(--color-accent)'>l</span><span style='color: #E6C300'>b</span><span style='color: black'>o</span><span style='color: #E6C300'>y</span>",
            about_sub: "I'm Alex Velboy — a Europe-based illustrator & visual artist.",
            about_sub_2: "I work with brands, editors, and creative teams who want visuals with a clear idea — not just something \"nice\"",
            about_sub_3: "My superpower is absurd thinking with precision: I take a brief, find the weird truth inside it, and push it until the concept clicks hard — visually, emotionally, and strategically.",
            about_sub_4: "Human detail, because I'm not a PDF: I've wanted to be an artist since I was a kid. Somehow it worked out — and now my favorite part is taking wild concepts and turning them into something real: campaigns, spaces, covers, murals, installations, an object you can touch and visuals you can actually live with.",
            faq_title: "Common Questions",
            faq1_question: "How long does a project usually take?",
            faq1_answer: "Small projects (e.g., one illustration) typically take about one week. Bigger projects usually take 2–4 weeks, depending on scope.",
            faq2_question: "How many concepts do you provide?",
            faq2_answer: "At the start, we align on the idea and I deliver two fully developed concept sketches. Each concept comes with its own story, meaning, and visual logic.",
            faq3_question: "How many revision rounds are included?",
            faq3_answer: "We lock the direction at the sketch/concept stage, then I refine it with your feedback while keeping the overall vision consistent. Small tweaks and clarifications are included (up to ~10), but the final artistic direction stays with me.",
            faq4_question: "Do you deliver source files?",
            faq4_answer: "Yes — I provide the files you need for your use case, including print-ready and high-resolution digital versions. Source files can be included when required and agreed in advance.",
            faq5_question: "What does your process look like, step by step?",
            faq5_answer: "We start with a call to explore the idea, goals, and best execution options, then sign a contract. If it’s a physical space, I visit (or work from materials), build a plan, share the initial vision, and then deliver final files.",
            faq6_question: "How does pricing and payment work (deposit, milestones)?",
            faq6_answer: "I work with a 50% deposit for projects of any size. Payment terms are clearly stated in the contract we sign before starting.",
            faq7_question: "Do you take rush projects?",
            faq7_answer: "Yes, rush projects are possible depending on my schedule. Timeline and rush fee are discussed individually.",
            faq8_question: "What do you need from me to get started?",
            faq8_answer: "A quick conversation about what you have and what you want to achieve, plus access to your materials or space (if applicable). After that, I take the lead and handle the process.",
            faq9_question: "Can we work together if my business is in another country?",
            faq9_answer: "Absolutely — I work internationally and we can run everything via calls, messages, and mockups. For physical applications, I prepare clear production-ready files and guides tailored to your format.",
            faq10_question: "Can we plan a long-term collaboration?",
            faq10_answer: "Yes — long-term projects are welcome once we align on the scope, timeline, and working rhythm. I can lead the visual direction as an art director throughout the collaboration.",
            contact_title: "Let's discuss your project.",
            contact_sub: "Open for selected commissions. Share a few details — I’ll respond with a clear plan.",
            services_list_title: "Services & Formats",
            service_item1_title: "Brand Illustration Systems",
            service_item1_sub: "Key visual + assets",
            service_item2_title: "Packaging & Physical Products",
            service_item2_sub: "Print-ready files",
            service_item3_title: "Book & Editorial Illustration",
            service_item3_sub: "concept + illustration",
            service_item4_title: "Animation Assets",
            service_item4_sub: "Layered Source",
            services_minimum_title: "Project minimum: $300 USD",
            services_minimum_sub: "Ensures dedicated time and high-quality focus on your brief.",
            services_card_title: "I’m cool (professionally).",
            services_card_p1: "I art-direct the whole project. From concept to final files.",
            services_card_p2: "I build the concept, define the visual direction, and lead it all the way through — your team can jump in for technical tweaks when needed.",
            services_card_p3: "My job is to turn ideas into real, physical touchpoints that people notice, remember, and want to engage with.",
            services_card_p4: "Strong visuals don’t just look good — they improve attention, perception, and conversion across the funnel.",
            work_portfolio_cta: "View full portfolio",
            download_pdf: "Download PDF",
            usp_title: "Why clients choose to work with me",
            usp1_title: "Strong Concept-First Approach",
            usp1_text: "I turn complex ideas into clean visuals that communicate fast — perfect for campaigns, covers, and packaging.",
            usp2_title: "Production-ready delivery",
            usp2_text: "CMYK-safe, web-ready, and organized files your designers and printers can use immediately.",
            usp3_title: "Reliable timelines",
            usp3_text: "You always know what’s next: checkpoints, revisions, and delivery dates are clear.",
            testimonials_title: "What people say",
            t1_quote: "Alex is a rare find. He doesn't just draw; he thinks deeply about the brand's message.",
            t1_author: "Sarah Jenkins",
            t1_role: "Art Director, Monocle",
            t2_quote: "The turnaround was incredibly fast, and the quality was top-notch. Perfect for our campaign.",
            t2_author: "Marcus Thorne",
            t2_role: "Lead Designer, Spotify",
            t3_quote: "His conceptual approach turned a simple brief into a visual masterpiece. Highly recommended.",
            t3_author: "Elena Rossi",
            t3_role: "Founder, Knygolove",
            form_name: "Name",
            form_email: "Email",
            form_project_type: "Project Type",
            form_category_placeholder: "Select a category...",
            form_ed: "Editorial Illustration",
            form_brand: "Brand Illustration",
            form_pkg: "Packaging",
            form_book: "Book Cover",
            form_album: "Album Cover",
            form_other: "Other",
            form_budget: "Approx. Budget",
            form_budget_placeholder: "Select range...",
            form_details: "Project Details",
            form_details_placeholder: "Briefly describe what you need...",
            form_submit: "Send Inquiry",
            social_tg: "Telegram",
            social_wa: "WhatsApp"
        },
        ua: {
            nav_work: "Роботи",
            nav_services: "Послуги",
            nav_process: "Процес",
            nav_about: "Про мене",
            nav_availability: "Перевірити доступність",
            nav_request: "Замовити проект",
            nav_contact_me: "Написати мені",
            nav_request_project: "Замовити проект",
            hero_title: "Візуальний сторітеллінг для <br> <span style='color: var(--color-secondary);'>амбітних брендів та людей.</span>",
            hero_sub: "Я допомагаю брендам, видавництвам та музикантам перетворювати складні ідеї на виразні візуальні наративи. Стратегічна ілюстрація, що перетворює увагу на запити.",
            hero_cta_request: "Замовити проект",
            hero_cta_view: "Дивитися кейси",
            badge_available: "Доступний для Q4 2023",
            social_trusted: "Нам довіряють:",
            services_title: "Фокус та Послуги",
            services_sub: "Оберіть категорію, щоб переглянути відповідні приклади.",
            service_ed_title: "Книги та Едіторіал",
            service_ed_sub: "Обкладинки книг, ілюстрації для видавництв та концептуальний едіторіал для журналів.",
            service_ed_cta: "Дивитись приклади",
            service_brand_title: "Брендова ілюстрація",
            service_brand_sub: "Брендова ілюстрація для пакування, продуктів та фізичних просторів.",
            service_brand_cta: "Дивитись роботи для брендів",
            service_poster_title: "Обкладинки та Постери",
            service_poster_sub: "Повний візуальний супровід релізів — обкладинки, вініл, мерч та постери.",
            service_poster_cta: "Дивитись приклади",
            work_title: "Обрані роботи",
            work_sub: "Кураторська добірка комерційних проектів з вимірними результатами.",
            about_title: "Привіт, я <span style='color: black'>A</span><span style='color: #E6C300'>l</span><span style='color: black'>e</span><span style='color: var(--color-alert)'>x</span> <span style='color: var(--color-secondary)'>V</span><span style='color: black'>e</span><span style='color: var(--color-accent)'>l</span><span style='color: #E6C300'>b</span><span style='color: black'>o</span><span style='color: #E6C300'>y</span>",
            about_sub: "I'm Alex Velboy — a Europe-based illustrator & visual artist.",
            about_sub_2: "I work with brands, editors, and creative teams who want visuals with a clear idea — not just something \"nice\"",
            about_sub_3: "My superpower is absurd thinking with precision: I take a brief, find the weird truth inside it, and push it until the concept clicks hard — visually, emotionally, and strategically.",
            about_sub_4: "Human detail, because I'm not a PDF: I've wanted to be an artist since I was a kid. Somehow it worked out — and now my favorite part is taking wild concepts and turning them into something real: campaigns, spaces, covers, murals, installations, an object you can touch and visuals you can actually live with.",
            faq_title: "Часті запитання",
            faq1_question: "How long does a project usually take?",
            faq1_answer: "Small projects (e.g., one illustration) typically take about one week. Bigger projects usually take 2–4 weeks, depending on scope.",
            faq2_question: "How many concepts do you provide?",
            faq2_answer: "At the start, we align on the idea and I deliver two fully developed concept sketches. Each concept comes with its own story, meaning, and visual logic.",
            faq3_question: "How many revision rounds are included?",
            faq3_answer: "We lock the direction at the sketch/concept stage, then I refine it with your feedback while keeping the overall vision consistent. Small tweaks and clarifications are included (up to ~10), but the final artistic direction stays with me.",
            faq4_question: "Do you deliver source files?",
            faq4_answer: "Yes — I provide the files you need for your use case, including print-ready and high-resolution digital versions. Source files can be included when required and agreed in advance.",
            faq5_question: "What does your process look like, step by step?",
            faq5_answer: "We start with a call to explore the idea, goals, and best execution options, then sign a contract. If it’s a physical space, I visit (or work from materials), build a plan, share the initial vision, and then deliver final files.",
            faq6_question: "How does pricing and payment work (deposit, milestones)?",
            faq6_answer: "I work with a 50% deposit for projects of any size. Payment terms are clearly stated in the contract we sign before starting.",
            faq7_question: "Do you take rush projects?",
            faq7_answer: "Yes, rush projects are possible depending on my schedule. Timeline and rush fee are discussed individually.",
            faq8_question: "What do you need from me to get started?",
            faq8_answer: "A quick conversation about what you have and what you want to achieve, plus access to your materials or space (if applicable). After that, I take the lead and handle the process.",
            faq9_question: "Can we work together if my business is in another country?",
            faq9_answer: "Absolutely — I work internationally and we can run everything via calls, messages, and mockups. For physical applications, I prepare clear production-ready files and guides tailored to your format.",
            faq10_question: "Can we plan a long-term collaboration?",
            faq10_answer: "Yes — long-term projects are welcome once we align on the scope, timeline, and working rhythm. I can lead the visual direction as an art director throughout the collaboration.",
            contact_title: "Обговоримо ваш проект.",
            contact_sub: "Open for selected commissions. Share a few details — I’ll respond with a clear plan.",
            services_list_title: "Послуги та Формати",
            service_item1_title: "Системи ілюстрацій для брендів",
            service_item1_sub: "Ключовий візуал + активи",
            service_item2_title: "Пакування та фізичні товари",
            service_item2_sub: "Готові до друку файли",
            service_item3_title: "Книжкова та журнальна ілюстрація",
            service_item3_sub: "концепт + ілюстрація",
            service_item4_title: "Активи для анімації",
            service_item4_sub: "Пошарові сорс-файли",
            services_minimum_title: "Мінімальне замовлення: $300 USD",
            services_minimum_sub: "Гарантує присвячений час та фокус на вашому брифi.",
            services_card_title: "I’m cool (professionally).",
            services_card_p1: "I art-direct the whole project. From concept to final files.",
            services_card_p2: "I build the concept, define the visual direction, and lead it all the way through — your team can jump in for technical tweaks when needed.",
            services_card_p3: "My job is to turn ideas into real, physical touchpoints that people notice, remember, and want to engage with.",
            services_card_p4: "Strong visuals don’t just look good — they improve attention, perception, and conversion across the funnel.",
            work_portfolio_cta: "Дивитися повне портфоліо",
            download_pdf: "Завантажити PDF",
            usp_title: "Чому клієнти обирают роботу зі мною",
            usp1_title: "Концептуальний підхід",
            usp1_text: "Я перетворюю складні ідеї на чисті візуальні образи, що швидко комунікують — ідеально для рекламних кампаній, обкладинок та пакування.",
            usp2_title: "Готові до виробництва файли",
            usp2_text: "Файли, готові до друку (CMYK) та вебу, організовані для негайного використання дизайнерами та друкарями.",
            usp3_title: "Надійні терміни",
            usp3_text: "Ви завжди знаєте, що далі: чекпоінти, правки та терміни здачі чітко визначені.",
            testimonials_title: "Що кажуть люди",
            t1_quote: "Алекс — справжня знахідка. Він не просто малює, а глибоко занурюється в саму суть повідомлення бренду.",
            t1_author: "Сара Дженкінс",
            t1_role: "Арт-директор, Monocle",
            t2_quote: "Терміни виконання були неймовірно швидкими, а якість — на найвищому рівні. Ідеально для нашої кампанії.",
            t2_author: "Маркус Торн",
            t2_role: "Провідний дизайнер, Spotify",
            t3_quote: "Його концептуальний підхід перетворив звичайний бриф на візуальний шедевр. Дуже рекомендую!",
            t3_author: "Олена Россі",
            t3_role: "Засновниця, Книголав",
            form_name: "Ім'я",
            form_email: "Email",
            form_project_type: "Тип проекту",
            form_category_placeholder: "Оберіть категорію...",
            form_ed: "Едіторіал ілюстрація",
            form_brand: "Брендова ілюстрація",
            form_pkg: "Упаковка",
            form_book: "Обкладинка книги",
            form_album: "Обкладинка альбому",
            form_other: "Інше",
            form_budget: "Приблизний бюджет",
            form_budget_placeholder: "Оберіть діапазон...",
            form_details: "Деталі проекту",
            form_details_placeholder: "Коротко опишіть, що вам потрібно...",
            form_submit: "Надіслати запит",
            social_tg: "Telegram",
            social_wa: "WhatsApp"
        }
    };

    const langBtns = document.querySelectorAll('.lang-btn');

    function setLanguage(lang) {
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
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang][key];
                } else if (key.includes('title') || key.includes('hero')) {
                    element.innerHTML = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
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

    // Load saved preference
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);

    /* 5. Header CTA Scroll Logic */
    const headerCta = document.getElementById('header-cta');
    const heroSection = document.querySelector('.hero');

    if (headerCta && heroSection) {
        const updateHeaderCta = () => {
            const lang = localStorage.getItem('preferredLang') || 'en';
            if (window.scrollY > 400) {
                headerCta.classList.add('scrolled');
                headerCta.textContent = translations[lang].nav_request_project;
            } else {
                headerCta.classList.remove('scrolled');
                headerCta.textContent = translations[lang].nav_contact_me;
            }
            // Re-apply data-i18n attribute for the current state
            headerCta.setAttribute('data-i18n', window.scrollY > 400 ? 'nav_request_project' : 'nav_contact_me');
        };

        window.addEventListener('scroll', updateHeaderCta);
        // Initial call to set correct text on load
        updateHeaderCta();

        // Listen for language changes to update this button immediately
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

            if (successMessage) {
                successMessage.classList.add('hidden');
            }
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }

            if (honeypot && honeypot.value.trim()) {
                contactForm.reset();
                if (successMessage) {
                    successMessage.classList.remove('hidden');
                }
                return;
            }

            // Show loading state
            submitBtn.textContent = "Sending…";
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
                        successMessage.textContent = "Sent ✅";
                        successMessage.classList.remove('hidden');
                    }
                    if (errorMessage) {
                        errorMessage.classList.add('hidden');
                    }
                    console.log('Contact form submitted successfully.');
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = result.error ? `Error ❌ ${result.error}` : "Error ❌";
                        errorMessage.classList.remove('hidden');
                    }
                    if (successMessage) {
                        successMessage.classList.add('hidden');
                    }
                    console.error('Contact form submission failed.', result);
                }
            } catch (error) {
                if (errorMessage) {
                    errorMessage.textContent = "Error ❌";
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

    /* 7. Audio Playback Logic (Final Step - Lightning) */
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

    function getBotResponse(input) {
        const text = input.toLowerCase();
        const lang = localStorage.getItem('preferredLang') || 'en';

        const responses = {
            en: {
                price: "Alex's projects usually start at $300 USD. This ensures high quality and dedicated time for each brief.",
                services: "Alex offers Brand Illustration, Packaging Design, Book & Editorial Illustration, and Posters.",
                process: "The process has 4 steps: Discovery, Concepts, Refinement, and Final Delivery. You can see more in the 'Process' section!",
                contact: "You can reach Alex at itsme@alexvelboy.com or via the contact form on this page.",
                default: "That's a great question! I'm just an AI assistant, but you can find more details in the sections above, or email Alex directly at itsme@alexvelboy.com."
            },
            ua: {
                price: "Проекти Алекса зазвичай стартують від $300 USD. Це гарантує високу якість та присвячений час для кожного брифу.",
                services: "Алекс пропонує брендову ілюстрацію, дизайн пакування, книжкову та журнальну ілюстрацію, а також постери.",
                process: "Процес складається з 4 кроків: Дослідження, Концепти, Доопрацювання та Фінальна здача. Більше деталей у розділі 'Процес'!",
                contact: "Ви можете написати Алексу на itsme@alexvelboy.com або заповнити форму зворотного зв'язку.",
                default: "Гарне питання! Я лише AI-помічник, але ви можете знайти більше деталей у розділах вище або написати Алексу прямо на itsme@alexvelboy.com."
            }
        };

        const current = responses[lang];

        if (text.includes('price') || text.includes('cost') || text.includes('цін') || text.includes('варто')) return current.price;
        if (text.includes('service') || text.includes('do') || text.includes('послуг') || text.includes('робиш')) return current.services;
        if (text.includes('process') || text.includes('how') || text.includes('процес') || text.includes('як')) return current.process;
        if (text.includes('contact') || text.includes('email') || text.includes('контакт') || text.includes('пошт')) return current.contact;

        return current.default;
    }
});
