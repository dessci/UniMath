var UniMath;
(function (UniMath) {
    'use strict';

    function elementWithClass(tagName, className) {
        var el = document.createElement(tagName);
        el.className = className;
        return el;
    }

    function highlightAllEquations() {
        if (document.body.hasAttribute('class') && document.body.className !== '') {
            document.body.removeAttribute('class');
        } else {
            document.body.className = 'unimath-on';
        }
    }
    function initTriggerMenu() {
        var trigger = document.getElementById('unimath-trigger');
        var triggermenu = document.getElementById('unimath-triggermenu');
        var triggerMenuUp, triggerMenuDown;

        var lis = triggermenu.getElementsByTagName('li');
        lis[0].addEventListener('click', highlightAllEquations, false);
        lis[1].addEventListener('click', showDashboard, false);
        lis[2].addEventListener('click', showAbout, false);

        function showDashboard(ev) {
            triggerMenuDown(ev);
            alert('Dashboard');
        }

        function showAbout(ev) {
            triggerMenuDown(ev);
            alert('About');
        }

        triggerMenuUp = function (ev) {
            ev.stopPropagation();
            triggermenu.style.display = 'block';
            trigger.removeEventListener('click', triggerMenuUp, false);
            document.addEventListener('click', triggerMenuDown, false);
        };

        triggerMenuDown = function (ev) {
            ev.stopPropagation();
            triggermenu.style.display = 'none';
            document.removeEventListener('click', triggerMenuDown, false);
            trigger.addEventListener('click', triggerMenuUp, false);
        };

        trigger.addEventListener('click', triggerMenuUp, false);
    }

    function init() {
        initTriggerMenu();
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el) {
            var d = elementWithClass('div', 'focus');
            d.appendChild(elementWithClass('span', 'zoom fa fa-search-plus'));
            var menuEl = elementWithClass('span', 'menu fa fa-external-link');
            d.appendChild(menuEl);
            el.appendChild(d);
            function showZoom() {
                alert('Zoom');
            }
            function showMenu(ev) {
                ev.stopPropagation();
                alert('Menu');
            }
            el.addEventListener('click', showZoom, false);
            menuEl.addEventListener('click', showMenu, false);
        });
    }
    UniMath.init = init;
})(UniMath || (UniMath = {}));

UniMath.init();
