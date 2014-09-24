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

    function zoomAction() {
        alert('zoom');
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
        function UniMathItem(el, focusManager) {
            var _this = this;
            this.el = el;
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
        UniMathItem.prototype.triggerActiveAction = function () {
            this.el.blur();
            this.eatFocusClick = true;
            var action = this.activeAction === 0 ? zoomAction : menuAction;
            setTimeout(action, 0);
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
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el) {
            new UniMathItem(el, focusManager);
        });

        var dashboardTrigger = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', showDashboard, false);
        }
    }
    UniMath2.init = init;
})(UniMath2 || (UniMath2 = {}));

UniMath2.init();
//# sourceMappingURL=demo2.js.map
