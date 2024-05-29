/*
	Editorial by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

document.addEventListener("DOMContentLoaded", function() {
    var $window = window,
        $head = document.head,
        $body = document.body;

    // Breakpoints.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px'],
        'xlarge-to-max': '(min-width: 1681px)',
        'small-to-xlarge': '(min-width: 481px) and (max-width: 1680px)'
    });

    // Stops animations/transitions until the page has ...
    // ... loaded.
    window.addEventListener('load', function() {
        setTimeout(function() {
            $body.classList.remove('is-preload');
        }, 100);
    });

    // ... stopped resizing.
    var resizeTimeout;
    window.addEventListener('resize', function() {
        $body.classList.add('is-resizing');

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            $body.classList.remove('is-resizing');
        }, 100);
    });

    // Fixes.
    // Object fit images.
    if (!browser.canUse('object-fit') || browser.name === 'safari') {
        document.querySelectorAll('.image.object').forEach(function($this) {
            var $img = $this.querySelector('img');

            // Hide original image.
            $img.style.opacity = '0';

            // Set background.
            $this.style.backgroundImage = 'url("' + $img.getAttribute('src') + '")';
            $this.style.backgroundSize = $img.style.objectFit ? $img.style.objectFit : 'cover';
            $this.style.backgroundPosition = $img.style.objectPosition ? $img.style.objectPosition : 'center';
        });
    }

    // Sidebar.
    var $sidebar = document.getElementById('sidebar'),
        $sidebar_inner = $sidebar.querySelector('.inner');

    // Inactive by default on <= large.
    breakpoints.on('<=large', function() {
        $sidebar.classList.add('inactive');
    });

    breakpoints.on('>large', function() {
        $sidebar.classList.remove('inactive');
    });

    // Hack: Workaround for Chrome/Android scrollbar position bug.
    if (browser.os === 'android' && browser.name === 'chrome') {
        var style = document.createElement('style');
        style.textContent = '#sidebar .inner::-webkit-scrollbar { display: none; }';
        $head.appendChild(style);
    }

    // Toggle.
    var toggleLink = document.createElement('a');
    toggleLink.href = '#sidebar';
    toggleLink.classList.add('toggle');
    toggleLink.textContent = 'Toggle';
    $sidebar.appendChild(toggleLink);
    toggleLink.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $sidebar.classList.toggle('inactive');
    });

    // Events.
    // Link clicks.
    $sidebar.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
            var a = event.target,
                href = a.getAttribute('href'),
                target = a.getAttribute('target');

            if (breakpoints.active('>large')) return;

            event.preventDefault();
            event.stopPropagation();

            if (!href || href === '#' || href === '') return;

            $sidebar.classList.add('inactive');

            setTimeout(function() {
                if (target === '_blank') {
                    window.open(href);
                } else {
                    window.location.href = href;
                }
            }, 500);
        }
    });

    // Prevent certain events inside the panel from bubbling.
    ['click', 'touchend', 'touchstart', 'touchmove'].forEach(function(eventType) {
        $sidebar.addEventListener(eventType, function(event) {
            if (breakpoints.active('>large')) return;
            event.stopPropagation();
        });
    });

    // Hide panel on body click/tap.
    ['click', 'touchend'].forEach(function(eventType) {
        $body.addEventListener(eventType, function(event) {
            if (breakpoints.active('>large')) return;
            $sidebar.classList.add('inactive');
        });
    });

    // Scroll lock.
    window.addEventListener('load', function() {
        var sh, wh, st;

        if ($window.scrollY == 1) {
            $window.scrollTo(0, 0);
        }

        window.addEventListener('scroll', function() {
            var x, y;

            if (breakpoints.active('<=large')) {
                $sidebar_inner.dataset.locked = 0;
                $sidebar_inner.style.position = '';
                $sidebar_inner.style.top = '';
                return;
            }

            x = Math.max(sh - wh, 0);
            y = Math.max(0, $window.scrollY - x);

            if ($sidebar_inner.dataset.locked == 1) {
                if (y <= 0) {
                    $sidebar_inner.dataset.locked = 0;
                    $sidebar_inner.style.position = '';
                    $sidebar_inner.style.top = '';
                } else {
                    $sidebar_inner.style.top = -1 * x + 'px';
                }
            } else {
                if (y > 0) {
                    $sidebar_inner.dataset.locked = 1;
                    $sidebar_inner.style.position = 'fixed';
                    $sidebar_inner.style.top = -1 * x + 'px';
                }
            }
        });

        window.addEventListener('resize', function() {
            wh = window.innerHeight;
            sh = $sidebar_inner.offsetHeight + 30;

            window.dispatchEvent(new Event('scroll'));
        });

        window.dispatchEvent(new Event('resize'));
    });

    // Menu.
    var $menu = document.getElementById('menu'),
        $menu_openers = $menu.querySelectorAll('.opener');

    // Openers.
    $menu_openers.forEach(function($this) {
        $this.addEventListener('click', function(event) {
            event.preventDefault();
            $menu_openers.forEach(function(opener) {
                if (opener !== $this) opener.classList.remove('active');
            });
            $this.classList.toggle('active');
            window.dispatchEvent(new Event('resize.sidebar-lock'));
        });
    });
});
