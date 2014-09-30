var UniMath;
(function (UniMath) {
    'use strict';
})(UniMath || (UniMath = {}));
/// <reference path="unimath-backend.ts" />

var UniMath;
(function (UniMath) {
    'use strict';

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
        MathJaxBackend.prototype.getSource = function (el) {
            var script = el.querySelector('script[type="math/mml"]');
            if (!script)
                return 'Unable to get source';
            return script.innerHTML;
        };
        return MathJaxBackend;
    })();
    UniMath.MathJaxBackend = MathJaxBackend;
})(UniMath || (UniMath = {}));
var UniMath;
(function (UniMath) {
    'use strict';

    function trimFront(s) {
        return s.replace(/^\s+/, '');
    }

    function trimBack(s) {
        return s.replace(/\s+$/, '');
    }

    function isTokenElement(node) {
        return node.localName.match(/^(mi|mn|mo|mtext|mspace|ms)$/) !== null;
    }

    function normalizeMathMLRecurse(node) {
        // http://www.w3.org/TR/REC-MathML/chap3_2.html
        // http://www.w3.org/TR/MathML2/chapter2.html#fund.collapse
        if (isTokenElement(node)) {
            // may contain <malignmark/> child elements
            var toRemove = [];
            Array.prototype.forEach.call(node.childNodes, function (n, i) {
                if (n.nodeType === 3) {
                    var s = n.textContent.replace(/\s\s+/g, ' ');
                    if (i === 0)
                        s = trimFront(s);
                    if (i === node.childNodes.length - 1)
                        s = trimBack(s);
                    if (s.length === 0) {
                        toRemove.push(n);
                    } else {
                        n.textContent = s;
                    }
                }
            });
            toRemove.forEach(function (n) {
                node.removeChild(n);
            });
        } else {
            Array.prototype.filter.call(node.childNodes, function (n) {
                return n.nodeType === 3;
            }).forEach(function (n) {
                node.removeChild(n);
            });
            Array.prototype.forEach.call(node.childNodes, function (n) {
                normalizeMathMLRecurse(n);
            });
        }
    }

    function normalizeMathML(node) {
        // http://www.w3.org/TR/MathML2/chapter2.html#fund.collapse
        node.normalize();
        normalizeMathMLRecurse(node);
    }

    function prettifyMathML(st) {
        var serializer = new XMLSerializer();
        var parser = new DOMParser();
        var doc = parser.parseFromString(st, 'application/xml');

        function out(node, indent) {
            if (isTokenElement(node)) {
                return indent + serializer.serializeToString(node);
            } else {
                var newindent = indent + '  ';
                var childItems = Array.prototype.map.call(node.childNodes, function (n) {
                    return out(n, newindent);
                });
                var innerText = '\n' + childItems.join('\n') + '\n' + indent;
                var outerNode = node.cloneNode(false);
                outerNode.textContent = '&';
                return indent + serializer.serializeToString(outerNode).replace('&amp;', innerText);
            }
        }

        normalizeMathML(doc.documentElement);

        return out(doc.documentElement, '');
    }
    UniMath.prettifyMathML = prettifyMathML;
})(UniMath || (UniMath = {}));
/// <reference path="unimath-mathjax.ts" />
/// <reference path="unimath-xml.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

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

    var UniMathItem = (function () {
        /*private currentActionElement(): HTMLElement {
        return this.activeAction === 0 ? this.zoomEl : this.menuEl;
        }*/
        function UniMathItem(el, eqnNumber, page) {
            var _this = this;
            this.el = el;
            this.eqnNumber = eqnNumber;
            this.page = page;
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
                return page.focusIn(_this);
            }, false);
            el.addEventListener('blur', function () {
                return page.focusOut();
            }, false);
            el.addEventListener('mouseenter', function () {
                _this.eatFocusClick = false;
                page.hoverIn(_this);
            }, false);
            el.addEventListener('mouseleave', function () {
                _this.eatFocusClick = true;
                page.hoverOut();
            }, false);
        }
        UniMathItem.prototype.dashboardAction = function () {
            this.page.dashboardAction();
        };

        UniMathItem.prototype.shareAction = function () {
            alert('Share');
        };

        UniMathItem.prototype.searchAction = function () {
            alert('Search');
        };

        UniMathItem.prototype.viewSourceAction = function () {
            var dialog = createDialogElement('MathML Source for Equation ' + this.eqnNumber);
            var body = elementWithClass('div', 'body');
            var text = document.createElement('textarea');
            var src = backend.getSource(this.el);
            src = UniMath.prettifyMathML(src);
            text.value = src;
            text.disabled = true;
            body.appendChild(text);
            dialog.appendChild(body);
            document.body.appendChild(dialog);
            dialog.showModal();
        };

        UniMathItem.prototype.zoomAction = function () {
            var _this = this;
            var dialog = createDialogElement('Equation ' + this.eqnNumber);
            var body = elementWithClass('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            if (!backend.equationZoom(body, this.el, 2))
                body.appendChild(document.createTextNode('Error'));

            var menuContainer = elementWithClass('div', 'menu');
            UniMathItem.menuItems.forEach(function (item) {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = function (ev) {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback.call(_this);
                };
                item.button.addEventListener('click', item.clickHandler, false);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer() {
                dialog.removeEventListener('close', closer, false);
                UniMathItem.menuItems.forEach(function (item) {
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
        UniMathItem.menuItems = [
            {
                html: '<i class="fa fa-file-text"></i> View MathML Source',
                callback: UniMathItem.prototype.viewSourceAction
            },
            { html: '<i class="fa fa-share-alt"></i> Share', callback: UniMathItem.prototype.shareAction },
            { html: '<i class="fa fa-search"></i> Search', callback: UniMathItem.prototype.searchAction },
            {
                html: '<i class="fa fa-dashboard"></i> Page Dashboard',
                callback: UniMathItem.prototype.dashboardAction
            }
        ];
        return UniMathItem;
    })();

    var UniMathPage = (function (_super) {
        __extends(UniMathPage, _super);
        function UniMathPage(nodelist) {
            var _this = this;
            _super.call(this);
            this.highlightAll = false;
            var totalCount = 0, blockCount = 0, inlineCount = 0;
            this.items = Array.prototype.map.call(nodelist, function (el) {
                totalCount++;
                if (el.localName === 'div') {
                    blockCount++;
                } else {
                    inlineCount++;
                }
                return new UniMathItem(el, totalCount, _this);
            });
            console.log('Initialized UniMath page: ' + totalCount + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');
        }
        UniMathPage.prototype.dashboardAction = function () {
            var _this = this;
            var dialog = createDialogElement('Universal Math Dashboard');
            var body = elementWithClass('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            var menuContainer = elementWithClass('div', 'dashboard');
            UniMathPage.dashboardItems.forEach(function (item) {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = function (ev) {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback.call(_this);
                };
                item.button.addEventListener('click', item.clickHandler, false);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer() {
                dialog.removeEventListener('close', closer, false);
                UniMathPage.dashboardItems.forEach(function (item) {
                    item.button.removeEventListener('click', item.clickHandler, false);
                });
            }

            dialog.addEventListener('close', closer, false);
            dialog.showModal();
        };

        UniMathPage.prototype.noopAction = function () {
            alert('Not implemented');
        };

        UniMathPage.prototype.highlightAllAction = function () {
            var _this = this;
            this.highlightAll = !this.highlightAll;
            this.items.forEach(function (item) {
                if (_this.highlightAll) {
                    item.gotHover();
                } else {
                    item.lostHover();
                }
            });
        };
        UniMathPage.dashboardItems = [
            {
                html: '<i class="fa fa-lightbulb-o"></i> Highlight All Equations',
                callback: UniMathPage.prototype.highlightAllAction
            },
            { html: '<i class="fa fa-question"></i> Action 2', callback: UniMathPage.prototype.noopAction },
            { html: '<i class="fa fa-question"></i> Action 3', callback: UniMathPage.prototype.noopAction },
            { html: '<i class="fa fa-question"></i> Action 4', callback: UniMathPage.prototype.noopAction }
        ];
        return UniMathPage;
    })(FocusManager);

    function init() {
        var page = new UniMathPage(document.getElementsByClassName('unimath'));

        var dashboardTrigger = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', function (ev) {
                ev.preventDefault();
                page.dashboardAction();
            }, false);
        }

        checkDialogSupport();
        /*var src = '<math><mi>    <malignmark/>  <malignmark/> regre   </mi></math>';
        //var src = '<math>x</math>';
        console.log(src);
        src = UniMath.prettifyMathML(src);
        console.log(src);*/
    }
    UniMath.init = init;
})(UniMath || (UniMath = {}));

UniMath.init();
/// <reference path="unimath-backend.ts" />

var UniMath;
(function (UniMath) {
    'use strict';

    var MathMLBackend = (function () {
        function MathMLBackend() {
        }
        MathMLBackend.prototype.equationZoom = function (parent, el, factor) {
            var mathNodes = el.getElementsByTagName('math');
            if (mathNodes.length !== 1)
                return false;
            var mml = mathNodes[0];
            mml = mml.cloneNode(true);
            mml.removeAttribute('id');
            var wrap = document.createElement('div');
            wrap.style.fontSize = (100 * factor) + '%';
            wrap.appendChild(mml);
            parent.appendChild(wrap);
            return true;
        };
        MathMLBackend.prototype.getSource = function (el) {
            var mathNodes = el.getElementsByTagName('math');
            if (mathNodes.length !== 1)
                return 'Unable to get source';
            var mml = mathNodes[0];
            return mml.outerHTML;
        };
        return MathMLBackend;
    })();
    UniMath.MathMLBackend = MathMLBackend;
})(UniMath || (UniMath = {}));
//# sourceMappingURL=unimath.js.map
