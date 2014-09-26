
var UniMath;
(function (UniMath) {
    'use strict';

    var backend = new UniMath.MathJaxBackend();

    function loadDialogPolyfill(onLoad) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'css/dialog-polyfill.css';
        head.insertBefore(link, head.firstChild);
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'js/dialog-polyfill.js';
        script.onload = onLoad;
        head.appendChild(script);
    }

    function checkDialogSupport() {
        var testEl = document.createElement('dialog');
        if (testEl instanceof HTMLUnknownElement) {
            loadDialogPolyfill(function () {
                console.log('Successfully loaded dialog polyfill');
            });
        }
    }

    function createDialogElement(title) {
        var dialog = elementWithClass('dialog', 'unimath-dialog');
        if ('dialogPolyfill' in window)
            dialogPolyfill.registerDialog(dialog);
        var header = elementWithClass('div', 'header');
        header.appendChild(document.createTextNode(title));
        var closer = elementWithClass('i', 'fa fa-times');
        function closeClick(ev) {
            ev.stopPropagation();
            dialog.close();
        }
        function onClose() {
            closer.removeEventListener('click', closeClick, false);
            dialog.removeEventListener('close', onClose, false);
        }
        header.appendChild(closer);
        dialog.appendChild(header);
        closer.addEventListener('click', closeClick, false);
        dialog.addEventListener('close', onClose, false);
        return dialog;
    }

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

    function menuAction() {
        alert('menu');
    }

    var FocusManager = (function () {
        function FocusManager() {
            this.curFocusItem = null;
            this.curHoverItem = null;
        }
        FocusManager.prototype.updateFocus = function (newFocusElement, newHoverElement) {
            var hasFocusClass = this.curFocusItem !== null ? this.curFocusItem : this.curHoverItem;
            var hasHoverClass = this.curFocusItem !== null && this.curFocusItem !== this.curHoverItem ? this.curHoverItem : null;
            var getFocusClass = newFocusElement !== null ? newFocusElement : newHoverElement;
            var getHoverClass = newFocusElement !== null && newFocusElement !== newHoverElement ? newHoverElement : null;
            if (hasFocusClass !== getFocusClass) {
                if (hasFocusClass !== null)
                    hasFocusClass.lostFocus();
                if (getFocusClass !== null)
                    getFocusClass.gotFocus();
            }
            if (hasHoverClass !== getHoverClass) {
                if (hasHoverClass !== null)
                    hasHoverClass.lostHover();
                if (getHoverClass !== null)
                    getHoverClass.gotHover();
            }
            this.curFocusItem = newFocusElement;
            this.curHoverItem = newHoverElement;
        };

        FocusManager.prototype.focusIn = function (el) {
            this.updateFocus(el, this.curHoverItem);
        };
        FocusManager.prototype.focusOut = function () {
            this.updateFocus(null, this.curHoverItem);
        };
        FocusManager.prototype.hoverIn = function (el) {
            this.updateFocus(this.curFocusItem, el);
        };
        FocusManager.prototype.hoverOut = function () {
            this.updateFocus(this.curFocusItem, null);
        };
        return FocusManager;
    })();

    var UniMathItem = (function () {
        function UniMathItem(el, eqnNumber, focusManager) {
            var _this = this;
            this.el = el;
            this.eqnNumber = eqnNumber;
            this.focusManager = focusManager;
            this.eatFocusClick = true;
            this.clickHandler = function () {
                if (_this.eatFocusClick) {
                    _this.eatFocusClick = false;
                } else {
                    _this.triggerActiveAction();
                }
            };
            this.enterMenuHandler = function () {
                _this.changeActiveAction(1);
            };
            this.leaveMenuHandler = function () {
                _this.changeActiveAction(0);
            };
            this.keydownHandler = function (ev) {
                switch (ev.keyCode) {
                    case 37:
                    case 39:
                        _this.changeActiveAction((_this.activeAction + 1) % 2);
                        break;
                    case 90:
                        _this.changeActiveAction(0);
                        _this.triggerActiveAction();
                        break;
                    case 77:
                        _this.changeActiveAction(1);
                        _this.triggerActiveAction();
                        break;
                    case 13:
                        _this.triggerActiveAction();
                        break;
                }
            };
            el.setAttribute('tabindex', '0');
            el.addEventListener('focus', function (ev) {
                focusManager.focusIn(_this);
            }, false);
            el.addEventListener('blur', function () {
                focusManager.focusOut();
            }, false);
            el.addEventListener('mouseenter', function () {
                _this.eatFocusClick = false;
                focusManager.hoverIn(_this);
            }, false);
            el.addEventListener('mouseleave', function () {
                _this.eatFocusClick = true;
                focusManager.hoverOut();
            }, false);
        }
        UniMathItem.prototype.zoomAction = function () {
            var dialog = createDialogElement('Equation ' + this.eqnNumber);
            var body = elementWithClass('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            if (!backend.equationZoom(body, this.el, 2))
                body.appendChild(document.createTextNode('Error'));

            dialog.showModal();
        };

        UniMathItem.prototype.triggerActiveAction = function () {
            this.el.blur();
            this.eatFocusClick = true;
            if (this.activeAction === 0) {
                this.zoomAction();
            } else {
                menuAction();
            }
        };

        UniMathItem.prototype.changeActiveAction = function (newAction) {
            if (newAction !== this.activeAction) {
                removeClass(this.currentActionElement(), 'on');
                this.activeAction = newAction;
                addClass(this.currentActionElement(), 'on');
            }
        };

        UniMathItem.prototype.currentActionElement = function () {
            return this.activeAction === 0 ? this.zoomEl : this.menuEl;
        };

        UniMathItem.prototype.gotFocus = function () {
            this.zoomEl = elementWithClass('span', 'zoom fa fa-search-plus on');
            this.menuEl = elementWithClass('span', 'menu fa fa-external-link');
            this.actionsEl = elementWithClass('div', 'actions');
            this.actionsEl.appendChild(this.zoomEl);
            this.actionsEl.appendChild(this.menuEl);
            this.el.appendChild(this.actionsEl);
            this.activeAction = 0;
            addClass(this.el, 'focus');
            this.menuEl.addEventListener('mouseenter', this.enterMenuHandler, false);
            this.menuEl.addEventListener('click', this.enterMenuHandler, false);
            this.menuEl.addEventListener('mouseleave', this.leaveMenuHandler, false);
            this.el.addEventListener('click', this.clickHandler, false);
            this.el.addEventListener('keydown', this.keydownHandler, false);
        };
        UniMathItem.prototype.lostFocus = function () {
            this.el.removeEventListener('keydown', this.keydownHandler, false);
            this.el.removeEventListener('click', this.clickHandler, false);
            this.menuEl.removeEventListener('mouseleave', this.leaveMenuHandler, false);
            this.menuEl.removeEventListener('click', this.enterMenuHandler, false);
            this.menuEl.removeEventListener('mouseenter', this.enterMenuHandler, false);
            removeClass(this.el, 'focus');
            this.el.removeChild(this.actionsEl);
            this.actionsEl = this.zoomEl = this.menuEl = undefined;
        };
        UniMathItem.prototype.gotHover = function () {
            addClass(this.el, 'hover');
        };
        UniMathItem.prototype.lostHover = function () {
            removeClass(this.el, 'hover');
        };
        return UniMathItem;
    })();

    function showDashboard(ev) {
        ev.preventDefault();
        alert('Dashboard');
    }

    var focusManager = new FocusManager();

    function init() {
        var totalCount = 0, blockCount = 0, inlineCount = 0;
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el) {
            totalCount++;
            if (el.localName === 'div')
                blockCount++;
            else
                inlineCount++;
            new UniMathItem(el, totalCount, focusManager);
        });

        var dashboardTrigger = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', showDashboard, false);
        }

        checkDialogSupport();

        console.log('Initialized UniMath: ' + (inlineCount + blockCount) + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');
    }
    UniMath.init = init;
})(UniMath || (UniMath = {}));

UniMath.init();
