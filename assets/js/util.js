/**
 * Generate an indented list of links from a nav. Meant for use with panel().
 * @return {string} HTML string.
 */
HTMLElement.prototype.navList = function() {
    const links = this.querySelectorAll('a');
    let result = [];

    links.forEach(link => {
        const indent = Math.max(0, link.closest('li').querySelectorAll('li').length - 1);
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        result.push(
            `<a class="link depth-${indent}"` +
            (target ? ` target="${target}"` : '') +
            (href ? ` href="${href}"` : '') +
            `><span class="indent-${indent}"></span>` +
            `${link.textContent}</a>`
        );
    });

    return result.join('');
};

/**
 * Panel-ify an element.
 * @param {object} userConfig User config.
 * @return {HTMLElement} DOM element.
 */
HTMLElement.prototype.panel = function(userConfig) {
    if (!this) return this;

    const panelElements = Array.isArray(this) ? this : [this];
    if (panelElements.length > 1) {
        panelElements.forEach(el => el.panel(userConfig));
        return this;
    }

    const body = document.body;
    const id = this.getAttribute('id');
    let config = Object.assign({
        delay: 0,
        hideOnClick: false,
        hideOnEscape: false,
        hideOnSwipe: false,
        resetScroll: false,
        resetForms: false,
        side: null,
        target: this,
        visibleClass: 'visible'
    }, userConfig);

    if (!(config.target instanceof HTMLElement)) {
        config.target = document.querySelector(config.target);
    }

    this._hide = function(event) {
        if (!config.target.classList.contains(config.visibleClass)) return;

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        config.target.classList.remove(config.visibleClass);

        setTimeout(() => {
            if (config.resetScroll) this.scrollTop = 0;
            if (config.resetForms) {
                this.querySelectorAll('form').forEach(form => form.reset());
            }
        }, config.delay);
    };

    this.style.msOverflowStyle = '-ms-autohiding-scrollbar';
    this.style.webkitOverflowScrolling = 'touch';

    if (config.hideOnClick) {
        this.querySelectorAll('a').forEach(a => a.style.webkitTapHighlightColor = 'rgba(0,0,0,0)');
        this.addEventListener('click', (event) => {
            if (!event.target.matches('a')) return;
            const href = event.target.getAttribute('href');
            const target = event.target.getAttribute('target');

            if (!href || href === '#' || href === '' || href === '#' + id) return;

            event.preventDefault();
            event.stopPropagation();

            this._hide();

            setTimeout(() => {
                if (target === '_blank') {
                    window.open(href);
                } else {
                    window.location.href = href;
                }
            }, config.delay + 10);
        });
    }

    this.addEventListener('touchstart', (event) => {
        this.touchPosX = event.touches[0].pageX;
        this.touchPosY = event.touches[0].pageY;
    });

    this.addEventListener('touchmove', (event) => {
        if (this.touchPosX === null || this.touchPosY === null) return;

        const diffX = this.touchPosX - event.touches[0].pageX;
        const diffY = this.touchPosY - event.touches[0].pageY;
        const th = this.offsetHeight;
        const ts = this.scrollHeight - this.scrollTop;

        if (config.hideOnSwipe) {
            let result = false;
            const boundary = 20;
            const delta = 50;

            switch (config.side) {
                case 'left':
                    result = (diffY < boundary && diffY > -boundary) && (diffX > delta);
                    break;
                case 'right':
                    result = (diffY < boundary && diffY > -boundary) && (diffX < -delta);
                    break;
                case 'top':
                    result = (diffX < boundary && diffX > -boundary) && (diffY > delta);
                    break;
                case 'bottom':
                    result = (diffX < boundary && diffX > -boundary) && (diffY < -delta);
                    break;
                default:
                    break;
            }

            if (result) {
                this.touchPosX = null;
                this.touchPosY = null;
                this._hide();
                return false;
            }
        }

        if ((this.scrollTop < 0 && diffY < 0) || (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    ['click', 'touchend', 'touchstart', 'touchmove'].forEach(event => {
        this.addEventListener(event, e => e.stopPropagation());
    });

    this.querySelectorAll(`a[href="#${id}"]`).forEach(a => {
        a.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            config.target.classList.remove(config.visibleClass);
        });
    });

    body.addEventListener('click', (event) => {
        this._hide(event);
    });

    body.querySelectorAll(`a[href="#${id}"]`).forEach(a => {
        a.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            config.target.classList.toggle(config.visibleClass);
        });
    });

    if (config.hideOnEscape) {
        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 27) this._hide(event);
        });
    }

    return this;
};

/**
 * Apply "placeholder" attribute polyfill to one or more forms.
 * @return {HTMLElement} DOM element.
 */
HTMLElement.prototype.placeholder = function() {
    if ('placeholder' in document.createElement('input')) return this;

    const elements = Array.isArray(this) ? this : [this];
    if (elements.length > 1) {
        elements.forEach(el => el.placeholder());
        return this;
    }

    const inputs = this.querySelectorAll('input[type=text],textarea');
    inputs.forEach(input => {
        if (input.value === '' || input.value === input.getAttribute('placeholder')) {
            input.classList.add('polyfill-placeholder');
            input.value = input.getAttribute('placeholder');
        }
    });

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.name.match(/-polyfill-field$/)) return;
            if (input.value === '') {
                input.classList.add('polyfill-placeholder');
                input.value = input.getAttribute('placeholder');
            }
        });

        input.addEventListener('focus', () => {
            if (input.name.match(/-polyfill-field$/)) return;
            if (input.value === input.getAttribute('placeholder')) {
                input.classList.remove('polyfill-placeholder');
                input.value = '';
            }
        });
    });

    const passwordInputs = this.querySelectorAll('input[type=password]');
    passwordInputs.forEach(input => {
        const cloned = input.cloneNode(true);
        cloned.type = 'text';
        cloned.classList.add('polyfill-placeholder');
        cloned.value = cloned.getAttribute('placeholder');
        if (input.id) cloned.id = input.id + '-polyfill-field';
        if (input.name) cloned.name = input.name + '-polyfill-field';

        cloned.addEventListener('focus', (event) => {
            event.preventDefault();
            input.classList.remove('polyfill-placeholder');
            input.value = '';
            input.type = 'password';
            input.focus();
        });

        input.after(cloned);

        input.addEventListener('blur', (event) => {
            event.preventDefault();
            if (input.value === '') {
                input.type = 'text';
                input.value = input.getAttribute('placeholder');
                input.classList.add('polyfill-placeholder');
            }
        });
    });

    this.addEventListener('submit', () => {
        this.querySelectorAll('input[type=text],input[type=password],textarea').forEach(input => {
            if (input.name.match(/-polyfill-field$/)) input.name = '';
            if (input.value === input.getAttribute('placeholder')) {
                input.classList.remove('polyfill-placeholder');
                input.value = '';
            }
        });
    });

    this.addEventListener('reset', (event) => {
        event.preventDefault();

        this.querySelectorAll('select').forEach(select => select.value = select.querySelector('option:first-of-type').value);

        this.querySelectorAll('input,textarea').forEach(input => {
            input.classList.remove('polyfill-placeholder');
            input.value = input.defaultValue;

            if (input.type === 'password') {
                const placeholder = input.nextElementSibling;
                if (input.value === '') {
                    input.style.display = 'none';
                    placeholder.style.display = 'block';
                } else {
                    input.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            }

            if (input.value === '') {
                input.classList.add('polyfill-placeholder');
                input.value = input.getAttribute('placeholder');
            }
        });
    });

    return this;
};

/**
 * Moves elements to/from the first positions of their respective parents.
 * @param {NodeList | HTMLElement} elements Elements (or selector) to move.
 * @param {bool} condition If true, moves elements to the top. Otherwise, moves elements back to their original locations.
 */
function prioritize(elements, condition) {
    const key = '__prioritize';

    if (!(elements instanceof NodeList) && !(elements instanceof HTMLElement)) {
        elements = document.querySelectorAll(elements);
    }

    elements.forEach(el => {
        const parent = el.parentElement;

        if (!parent) return;

        if (!el[key]) {
            if (!condition) return;
            const placeholder = el.previousElementSibling;
            if (!placeholder) return;
            el[key] = placeholder;
            parent.insertBefore(el, parent.firstChild);
        } else {
            if (condition) return;
            const placeholder = el[key];
            parent.insertBefore(el, placeholder.nextSibling);
            delete el[key];
        }
    });
}
