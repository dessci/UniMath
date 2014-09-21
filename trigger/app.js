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

    function notImpl() {
        alert('Not implemented');
    }

    var menuItems = [
        { label: 'View MathML source', action: notImpl },
        { label: 'Search', action: notImpl },
        { label: 'About', action: notImpl }
    ];

    var contextMenu = ContextMenu.create(menuItems);

    function setupMenu(el) {
        addListen(el, 'contextmenu', function (ev) {
            contextMenu.show(el, ev.clientX, ev.clientY);
        });
    }

    function makeExpander(el) {
        var arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.innerHTML = '<div></div>';
        el.appendChild(arrow);

        var div = document.createElement('div');
        div.className = 'menu';
        div.innerHTML = '<i class="glyphicon glyphicon-list-alt"></i> <span>MathML Source</span>' + '&nbsp;&nbsp;<i class="glyphicon glyphicon-share"></i> <span>Share</span>' + '&nbsp;&nbsp;<i class="glyphicon glyphicon-search"></i> <span>Search</span>';

        var openHandler, closeHandler;

        openHandler = function (ev) {
            el.appendChild(div);
            el.removeEventListener('click', openHandler, false);
            el.addEventListener('click', closeHandler, false);
        };

        closeHandler = function (ev) {
            el.removeChild(div);
            el.removeEventListener('click', closeHandler, false);
            el.addEventListener('click', openHandler, false);
        };

        el.addEventListener('click', openHandler, false);
    }

    function setupModal(el) {
        el.addEventListener('click', function (ev) {
            $('#myModal').modal();
        }, false);
    }

    function go() {
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el, i) {
            if (i === 0) {
                makeExpander(el);
            } else if (i === 1) {
                setupModal(el);
            } else if (i === 2) {
                setupMenu(el);
            }
        });
    }
    UniMath.go = go;
})(UniMath || (UniMath = {}));

UniMath.go();
//# sourceMappingURL=app.js.map
