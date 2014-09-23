var UniMath2;
(function (UniMath2) {
    'use strict';

    function elementWithClass(tagName, className) {
        var el = document.createElement(tagName);
        el.className = className;
        return el;
    }

    function addClass(el, cls) {
        var cur = el.className.trim();
        if (!cur) {
            el.className = cls;
        } else if ((' ' + cur + ' ').indexOf(' ' + cls + ' ') < 0) {
            el.className = cur + ' ' + cls;
        }
    }

    function removeClass(el, cls) {
        el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').trim();
    }

    var curFocusElement = null;
    var curHoverElement = null;

    function updateFocus(newFocusElement, newHoverElement) {
        var hasFocusClass = curFocusElement !== null ? curFocusElement : curHoverElement;
        var hasHoverClass = curFocusElement !== null && curFocusElement !== curHoverElement ? curHoverElement : null;
        var getFocusClass = newFocusElement !== null ? newFocusElement : newHoverElement;
        var getHoverClass = newFocusElement !== null && newFocusElement !== newHoverElement ? newHoverElement : null;
        if (hasFocusClass !== getFocusClass) {
            if (hasFocusClass !== null) {
                removeClass(hasFocusClass, 'focus');
                hasFocusClass.blur();
            }
            if (getFocusClass !== null) {
                addClass(getFocusClass, 'focus');
                getFocusClass.focus();
            }
        }
        if (hasHoverClass !== getHoverClass) {
            if (hasHoverClass !== null)
                removeClass(hasHoverClass, 'hover');
            if (getHoverClass !== null)
                addClass(getHoverClass, 'hover');
        }
        curFocusElement = newFocusElement;
        curHoverElement = newHoverElement;
    }

    function zoomAction() {
        alert('zoom');
    }
    function menuAction() {
        alert('menu');
    }

    function init() {
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el, index) {
            var activeAction = 0;
            var zoomEl = elementWithClass('span', 'zoom fa fa-search-plus on');
            var menuEl = elementWithClass('span', 'menu fa fa-external-link');

            function currentActionElement() {
                return activeAction === 0 ? zoomEl : menuEl;
            }

            function changeActiveAction(newAction) {
                if (newAction !== activeAction) {
                    removeClass(currentActionElement(), 'on');
                    activeAction = newAction;
                    addClass(currentActionElement(), 'on');
                }
            }

            function triggerActiveAction() {
                updateFocus(null, null);
                if (activeAction === 0) {
                    zoomAction();
                } else {
                    menuAction();
                }
            }

            el.setAttribute('tabindex', '0');

            el.addEventListener('focus', function () {
                updateFocus(el, curHoverElement);
            }, true);
            el.addEventListener('blur', function () {
                updateFocus(null, curHoverElement);
            }, true);

            el.addEventListener('mouseenter', function () {
                updateFocus(curFocusElement, el);
            }, false);
            el.addEventListener('mouseleave', function () {
                updateFocus(curFocusElement, null);
            }, false);

            el.addEventListener('keydown', function (ev) {
                switch (ev.keyCode) {
                    case 37:
                    case 39:
                        changeActiveAction((activeAction + 1) % 2);
                        break;
                    case 90:
                        activeAction = 0;
                        triggerActiveAction();
                        break;
                    case 77:
                        activeAction = 1;
                        triggerActiveAction();
                        break;
                    case 13:
                        triggerActiveAction();
                        break;
                }
            });

            menuEl.addEventListener('mouseenter', function () {
                changeActiveAction(1);
            }, true);
            menuEl.addEventListener('mouseleave', function () {
                changeActiveAction(0);
            }, true);

            zoomEl.addEventListener('click', zoomAction, false);
            menuEl.addEventListener('click', menuAction, false);
            el.addEventListener('click', triggerActiveAction, false);

            var actionsEl = elementWithClass('div', 'actions');
            actionsEl.appendChild(zoomEl);
            actionsEl.appendChild(menuEl);
            el.appendChild(actionsEl);
        });
    }
    UniMath2.init = init;
})(UniMath2 || (UniMath2 = {}));

UniMath2.init();
//# sourceMappingURL=demo2.js.map
