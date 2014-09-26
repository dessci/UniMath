/// <reference path="unimath-backend.ts" />
var UniMath;
(function (UniMath) {
    var MathJaxBackend = (function () {
        function MathJaxBackend() {
        }
        MathJaxBackend.prototype.equationZoom = function (parent, el, factor) {
            var script = el.querySelector('script[type="math/mml"]');
            if (!script)
                return false;
            script = script.cloneNode(true);
            script.removeAttribute('id');
            var wrap = document.createElement('div');
            wrap.style.fontSize = (100 * factor) + '%';
            wrap.appendChild(script);
            parent.appendChild(wrap);
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, script]);
            return true;
        };
        return MathJaxBackend;
    })();
    UniMath.MathJaxBackend = MathJaxBackend;
})(UniMath || (UniMath = {}));
/// <reference path="unimath-mathjax.ts" />

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

    function viewSourceAction(item) {
        alert('View source');
    }

    function shareAction(item) {
        alert('Share');
    }

    function searchAction(item) {
        alert('Search');
    }

    function dashboardAction() {
        alert('Dashboard');
    }

    var menuItems = [
        { html: '<i class="fa fa-file-text"></i> View MathML Source', callback: viewSourceAction },
        { html: '<i class="fa fa-share-alt"></i> Share', callback: shareAction },
        { html: '<i class="fa fa-search"></i> Search', callback: searchAction },
        { html: '<i class="fa fa-dashboard"></i> Page Dashboard', callback: dashboardAction }
    ];

    var UniMathItem = (function () {
        /*private currentActionElement(): HTMLElement {
        return this.activeAction === 0 ? this.zoomEl : this.menuEl;
        }*/
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
            /*private changeActiveAction(newAction: number): void {
            if (newAction !== this.activeAction) {
            removeClass(this.currentActionElement(), 'on');
            this.activeAction = newAction;
            addClass(this.currentActionElement(), 'on');
            }
            }
            
            private enterMenuHandler: () => void = (): void => {
            this.changeActiveAction(1);
            };
            
            private leaveMenuHandler: () => void = (): void => {
            this.changeActiveAction(0);
            };*/
            this.keydownHandler = function (ev) {
                switch (ev.keyCode) {
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
            var _this = this;
            var dialog = createDialogElement('Equation ' + this.eqnNumber);
            var body = elementWithClass('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            if (!backend.equationZoom(body, this.el, 2))
                body.appendChild(document.createTextNode('Error'));

            var menuContainer = elementWithClass('div', 'menu');
            menuItems.forEach(function (item) {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = function (ev) {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback(_this);
                };
                item.button.addEventListener('click', item.clickHandler, false);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer() {
                console.log('closing');
                dialog.removeEventListener('close', closer, false);
                menuItems.forEach(function (item) {
                    item.button.removeEventListener('click', item.clickHandler, false);
                });
            }

            dialog.addEventListener('close', closer, false);
            dialog.showModal();
        };

        UniMathItem.prototype.triggerActiveAction = function () {
            this.el.blur();
            this.eatFocusClick = true;

            //if (this.activeAction === 0) {
            this.zoomAction();
            /*} else {
            menuAction();
            }*/
        };

        UniMathItem.prototype.gotFocus = function () {
            //this.zoomEl = elementWithClass('span', 'zoom fa fa-search-plus on');
            this.zoomEl = elementWithClass('span', 'zoom fa fa-superscript');

            //this.menuEl = elementWithClass('span', 'menu fa fa-external-link');
            this.actionsEl = elementWithClass('div', 'actions');
            this.actionsEl.appendChild(this.zoomEl);

            //this.actionsEl.appendChild(this.menuEl);
            this.el.appendChild(this.actionsEl);
            this.activeAction = 0;
            addClass(this.el, 'focus');

            /*this.menuEl.addEventListener('mouseenter', this.enterMenuHandler, false);
            this.menuEl.addEventListener('click', this.enterMenuHandler, false);
            this.menuEl.addEventListener('mouseleave', this.leaveMenuHandler, false);*/
            this.el.addEventListener('click', this.clickHandler, false);
            this.el.addEventListener('keydown', this.keydownHandler, false);
        };
        UniMathItem.prototype.lostFocus = function () {
            this.el.removeEventListener('keydown', this.keydownHandler, false);
            this.el.removeEventListener('click', this.clickHandler, false);

            /*this.menuEl.removeEventListener('mouseleave', this.leaveMenuHandler, false);
            this.menuEl.removeEventListener('click', this.enterMenuHandler, false);
            this.menuEl.removeEventListener('mouseenter', this.enterMenuHandler, false);*/
            removeClass(this.el, 'focus');
            this.el.removeChild(this.actionsEl);
            this.actionsEl = this.zoomEl = undefined;
        };
        UniMathItem.prototype.gotHover = function () {
            addClass(this.el, 'hover');
        };
        UniMathItem.prototype.lostHover = function () {
            removeClass(this.el, 'hover');
        };
        return UniMathItem;
    })();

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
            dashboardTrigger.addEventListener('click', function (ev) {
                ev.preventDefault();
                dashboardAction();
            }, false);
        }

        checkDialogSupport();

        console.log('Initialized UniMath: ' + (inlineCount + blockCount) + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');
    }
    UniMath.init = init;
})(UniMath || (UniMath = {}));

UniMath.init();
//# sourceMappingURL=unimath.js.map
