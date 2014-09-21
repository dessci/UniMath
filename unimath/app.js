/*
* Limited support:
*                                  Chrome Firefox IE Opera Safari
*  Event.stopPropagation           +      +       9  +     +
*  Function.prototype.bind         7      4       9  11.60 5.1.4
*  Array.prototype.forEach/map     +      1.5     9  +     +
*  document.getElementsByClassName +      3.0     9  +     +
*
*                                  Android Chrome/Android Firefox Opera Safari
*  Function.prototype.bind         4.0     0.16           4.0     11.50 6.0
*  Array.prototype.forEach/map     +       +              1.0     +     +
*  document.getElementsByClassName ?       ?              ?       ?     ?
*
* General support:
*  Event.preventDefault, document.createElement, Element.className, document.createTextNode,
*  for..in
*
*/
var UniMath;
(function (UniMath) {
    'use strict';

    function addListen(el, type, callback) {
        var wrapper = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            callback(ev);
        };
        el.addEventListener(type, wrapper, false);
        return wrapper;
    }

    function removeListen(el, type, callback) {
        el.removeEventListener(type, callback, false);
    }

    var ContextMenu;
    (function (ContextMenu) {
        function applyClassName(el, className) {
            el.className = className;
            return el;
        }

        function createLI(data) {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(data));
            return li;
        }

        var MenuItem = (function () {
            function MenuItem(main, parent, menuItem) {
                var _this = this;
                this.parent = parent;
                this.label = menuItem.label;
                if (menuItem.action) {
                    this.action = function () {
                        return main.callAction(menuItem.action);
                    };
                }
                if (menuItem.subitems) {
                    this.submenu = new Menu(main, menuItem.subitems);
                }
                this.el = createLI(this.label);
                if (this.submenu) {
                    var sp = document.createElement('span');
                    sp.innerHTML = '&#9654;';
                    this.el.appendChild(sp);
                    this.action = function () {
                        _this.parent.closeSubmenus();
                        _this.submenu.open(_this.el.offsetLeft + _this.el.offsetWidth, _this.el.offsetTop);
                        _this.el.appendChild(_this.submenu.el);
                        _this.submenu.isOpen = true;
                    };
                    addListen(this.el, 'mouseenter', this.action);
                } else {
                    addListen(this.el, 'mouseenter', function () {
                        return _this.parent.closeSubmenus();
                    });
                }
                addListen(this.el, 'click', this.action);
            }
            MenuItem.prototype.open = function () {
            };
            MenuItem.prototype.close = function () {
                if (this.submenu) {
                    if (this.submenu.isOpen) {
                        this.el.removeChild(this.submenu.el);
                        this.submenu.isOpen = false;
                    }
                    this.submenu.close();
                }
            };
            MenuItem.prototype.widthEm = function () {
                return this.label.length;
            };
            return MenuItem;
        })();

        var Menu = (function () {
            function Menu(main, menuItems) {
                var _this = this;
                this.isOpen = false;
                this.items = menuItems.map(function (item) {
                    return new MenuItem(main, _this, item);
                });
                this.el = applyClassName(document.createElement('div'), 'unimath-popup');
                var ul = document.createElement('ul');
                var maxWidth = 0;
                this.items.forEach(function (item) {
                    item.open();
                    maxWidth = Math.max(maxWidth, item.widthEm());
                    ul.appendChild(item.el);
                });
                this.el.appendChild(ul);
                this.el.style.height = (this.items.length * (1 + 2 * 0.1) + 2 * 0.2) + 'em';
                this.el.style.width = maxWidth + 'em';
                addListen(this.el, 'click', this.closeSubmenus.bind(this));
            }
            Menu.prototype.open = function (x, y) {
                this.el.style.left = x + 'px';
                this.el.style.top = y + 'px';
            };
            Menu.prototype.closeSubmenus = function () {
                this.items.forEach(function (item) {
                    return item.close();
                });
            };
            Menu.prototype.close = function () {
                this.closeSubmenus();
            };
            return Menu;
        })();

        var PopupMenuImpl = (function () {
            function PopupMenuImpl(menuItems) {
                this.rootMenu = new Menu(this, menuItems);
                this.overlay = applyClassName(document.createElement('div'), 'unimath-overlay');
            }
            PopupMenuImpl.prototype.show = function (el, x, y) {
                this.target = el;
                this.rootMenu.open(x, y);
                this.overlay.appendChild(this.rootMenu.el);
                document.body.appendChild(this.overlay);
                this.closer = addListen(this.overlay, 'click', this.close.bind(this));
            };
            PopupMenuImpl.prototype.close = function () {
                removeListen(this.overlay, 'click', this.closer);
                this.overlay.removeChild(this.rootMenu.el);
                this.rootMenu.close();
                document.body.removeChild(this.overlay);
            };
            PopupMenuImpl.prototype.callAction = function (handler) {
                this.close();
                handler(this.target);
            };
            return PopupMenuImpl;
        })();

        
        function create(menuItems) {
            return new PopupMenuImpl(menuItems);
        }
        ContextMenu.create = create;
    })(ContextMenu || (ContextMenu = {}));

    function go() {
        function getMathMLSource(el) {
            for (var child = el.firstChild; child; child = child.nextSibling) {
                if (child.localName === 'script') {
                    var s = child;
                    if (s.hasAttribute('type') && s.getAttribute('type') === 'application/mathml+xml') {
                        return s.innerHTML;
                    }
                }
            }
            return null;
        }

        function copyToClipboardAction(el) {
            var source = getMathMLSource(el);
            if (source) {
                source = source.trim();
                source = source.replace(/\n/g, '');
                source = source.replace(/\s+(<[^>]+>)/g, '$1');
                source = source.replace(/(<\/\s+>)\s+/g, '$1');
                prompt('Copy to clipboard', source);
            } else
                alert('Unable to find MathML source');
        }

        function viewMathMLSource(el) {
            var source = getMathMLSource(el);
            if (source != null) {
                var win = window.open('about:blank', 'View MathML Source', 'width=800,height=600,resizable,scrollbars=yes,status=0');
                var pre = win.document.createElement('pre');
                pre.appendChild(win.document.createTextNode(source));
                win.document.body.appendChild(pre);
            } else
                alert('Unable to find MathML source');
        }

        function searchAction() {
            alert('Search not implemented yet');
        }

        function aboutAction() {
            alert('About not implemented yet');
        }

        function notImpl() {
            alert('Not implemented yet');
        }

        var menuItems = [
            { label: 'View MathML source', action: copyToClipboardAction },
            { label: 'View MathML source 2', action: viewMathMLSource },
            { label: 'Search', action: searchAction },
            {
                label: 'Item with submenu',
                subitems: [
                    { label: 'Sub 1', action: notImpl },
                    {
                        label: 'Sub 2', subitems: [
                            { label: 'Subsub 2.1', action: notImpl }
                        ]
                    },
                    { label: 'Sub 3', action: notImpl }
                ]
            },
            { label: 'About', action: aboutAction }
        ];

        var contextMenu = ContextMenu.create(menuItems);

        function setupElement(el) {
            addListen(el, 'contextmenu', function (ev) {
                contextMenu.show(el, ev.clientX, ev.clientY);
            });
        }

        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, setupElement);
    }
    UniMath.go = go;
})(UniMath || (UniMath = {}));

UniMath.go();
//# sourceMappingURL=app.js.map
