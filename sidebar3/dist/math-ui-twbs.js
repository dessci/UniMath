/// <reference path="jquery.d.ts" />
/// <reference path="../bower_components/math-item/math-item.d.ts" />
var FlorianMath;
(function (FlorianMath) {
    'use strict';
    var requireLibsResolve;
    FlorianMath.requireLibs = (function () {
        var promise = new FlorianMath.Promise(function (resolve) {
            requireLibsResolve = resolve;
        });
        return function () { return promise; };
    })();
    function jQueryPresent() {
        return 'jQuery' in window && jQuery.fn.on;
    }
    function fail() {
        //console.log('Unable to load jQuery');
    }
    FlorianMath.domReady().then(function () {
        if (!jQueryPresent()) {
            var IEpre9 = navigator.userAgent.match(/MSIE [6-8]/i), version = IEpre9 ? '1.11.2' : '2.1.3', script = document.createElement('script'), head = document.querySelector('head'), done = false;
            script.src = 'https://code.jquery.com/jquery-' + version + '.min.js';
            script.async = true;
            script.onload = script.onreadystatechange = function () {
                if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
                    done = true;
                    //jQueryPresent() ? requireLibsResolve(<JQueryStatic> jQuery.noConflict(true)) : fail();
                    if (jQueryPresent()) {
                        //console.log('jQuery loaded');
                        requireLibsResolve(jQuery.noConflict(true));
                    }
                    else
                        fail();
                }
            };
            script.onerror = function () {
                if (!done) {
                    done = true;
                    fail();
                }
            };
            head.appendChild(script);
        }
        else
            requireLibsResolve(jQuery);
    });
})(FlorianMath || (FlorianMath = {}));
/// <reference path="jquery.d.ts" />
/// <reference path="../bower_components/math-item/math-item.d.ts" />
/// <reference path="requirelibs.ts" />
var FlorianMath;
(function (FlorianMath) {
    'use strict';
    var global = window, doc = document, $, ACTIVE_CLASS = 'active', focusItem, hoverItem, menuItem, menuRemover, sidebar;
    var log = function () {
    };
    if ('console' in global && console.log)
        log = function (message, arg1, arg2) {
            if (arg2 !== undefined)
                console.log(message, arg1, arg2);
            else if (arg1 !== undefined)
                console.log(message, arg1);
            else
                console.log(message);
        };
    function map(list, fn) {
        var result = [];
        FlorianMath.each(list, function (item) {
            result.push(fn(item));
        });
        return result;
    }
    function getWidth(el) {
        var b = el.getBoundingClientRect();
        return b.right - b.left;
    }
    function getIdName(mathItem) {
        return 'Equation ' + (mathItem._private.id + 1);
    }
    function getUserName(mathItem) {
        return mathItem.getAttribute('name');
    }
    function getFullName(mathItem) {
        var name = getIdName(mathItem), userName = getUserName(mathItem);
        if (userName)
            name += ' (' + userName + ')';
        return name;
    }
    function setDataTransfer(data, mathItem) {
        var sources = mathItem.getSources({ markup: true });
        FlorianMath.each(sources, function (source) {
            data.setData(FlorianMath.getSourceType(source), FlorianMath.getSourceMarkup(source));
        });
    }
    function stopEvent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }
    function zoomAction(item) {
        var popup = $('<div class="math-ui item-zoom" />'), contentRef, mathItemClone = item.cloneNode(true);
        function handler(ev) {
            if (ev.type === 'mousedown' && ev.which !== 1)
                return;
            ev.stopPropagation();
            if (contentRef)
                contentRef.remove();
            popup.remove();
            $(doc).off('mousedown keydown', handler);
        }
        HTMLMathItemElement.manualCreate(mathItemClone, true);
        mathItemClone.clean();
        popup.append(mathItemClone);
        $(doc).on('mousedown keydown', handler);
        $(item).append(popup);
        if (item.shadowRoot) {
            contentRef = $('<content select=".item-zoom" />');
            $(item.shadowRoot).append(contentRef);
        }
        HTMLMathItemElement.manualAttach(mathItemClone, true);
    }
    function showMenu(item) {
        var $item = $(item), contentElement, display_inline, eraser = $('<div class="eraser"/>'), icons = map(['cog', 'zoom-in', 'unchecked', 'question-sign'], function (i) { return $('<span class="glyphicon glyphicon-' + i + '" />'); }), top = $('<div class="top" />').append($('<span class="eqn-name" />').append(getIdName(item)), icons), body = $('<div class="body" />'), menu = $('<div class="math-ui focus-menu" />').append(eraser, top, body);
        function doZoom() {
            $item.blur();
            zoomAction(item);
        }
        function toggleSelected() {
            var on = item.selected = !item.selected;
            icons[2].toggleClass('glyphicon-unchecked', !on).toggleClass('glyphicon-check', on);
        }
        if ($item.hasClass(ACTIVE_CLASS))
            return;
        $item.addClass(ACTIVE_CLASS).append(menu);
        if (item.shadowRoot) {
            contentElement = $('<content select=".focus-menu" />');
            $(item.shadowRoot).append(contentElement);
        }
        display_inline = $item.css('display') === 'inline';
        if (display_inline)
            $item.css('display', 'inline-block'); // correct width on Chrome
        var item_padding = 2, focus_border_width = 2, menu_left = 8, itemWidth = getWidth(item);
        if (itemWidth >= 0) {
            eraser.width(itemWidth - 2 * item_padding - focus_border_width - menu_left);
        }
        if (display_inline)
            $item.css('display', 'inline');
        menu.on('mousedown keydown', function (ev) {
            if (ev.type === 'mousedown' && ev.which !== 1)
                return;
            stopEvent(ev);
            top.children().each(function (k) {
                if (ev.target === this) {
                    if (k <= 1)
                        sidebar.show(0);
                    else if (k === 2)
                        doZoom();
                    else
                        toggleSelected();
                }
            });
        });
        sidebar.setEquation(item);
        menuItem = item;
        menuRemover = function () {
            menu.remove();
            if (contentElement)
                contentElement.remove();
            $item.removeClass(ACTIVE_CLASS);
            sidebar.setEquation(null);
            menuItem = menuRemover = null;
        };
    }
    function checkState() {
        var item = focusItem || hoverItem;
        if (item === menuItem)
            return;
        if (menuItem)
            menuRemover();
        if (item)
            showMenu(item);
    }
    function onFocus() {
        focusItem = this;
        checkState();
    }
    function onBlur() {
        if (sidebar.isShowing())
            return;
        focusItem = null;
        checkState();
    }
    function onMouseEnter() {
        if (sidebar.isShowing())
            return;
        hoverItem = this;
        checkState();
    }
    function onMouseLeave() {
        if (sidebar.isShowing())
            return;
        hoverItem = null;
        checkState();
    }
    var BootstrapLookAndFeel = (function () {
        function BootstrapLookAndFeel($) {
            this.$ = $;
            this.container = [];
            this.highlighted = false;
        }
        BootstrapLookAndFeel.prototype.add = function (mathItem) {
            var $mathItem = $(mathItem);
            this.container.push(mathItem);
            if (!$mathItem.attr('id'))
                $mathItem.attr('id', 'math-item-' + this.container.length);
            $mathItem.attr('tabindex', 0).attr('draggable', 'true').focus(onFocus).blur(onBlur);
            $mathItem.mousedown(function (ev) {
                ev.stopPropagation();
            });
            $mathItem.mouseenter(onMouseEnter).mouseleave(onMouseLeave);
            $mathItem.on('dragstart', function (ev) {
                if (ev.originalEvent.dataTransfer) {
                    var dt = ev.originalEvent.dataTransfer, mainMarkup = mathItem.getMainMarkup();
                    try {
                        if (mainMarkup)
                            dt.setData(FlorianMath.MIME_TYPE_PLAIN, mainMarkup.markup);
                        setDataTransfer(dt, mathItem);
                    }
                    catch (e) {
                        // IE only accepts type 'text' http://stackoverflow.com/a/18051912/212069
                        if (mainMarkup)
                            dt.setData('text', mainMarkup.markup);
                    }
                }
            });
        };
        BootstrapLookAndFeel.prototype.highlightAll = function () {
            var on = this.highlighted = !this.highlighted;
            FlorianMath.each(this.container, function (mathItem) {
                $(mathItem).toggleClass('highlight', on);
            });
        };
        BootstrapLookAndFeel.prototype.showDashboard = function () {
            sidebar.show(2);
        };
        BootstrapLookAndFeel.prototype.itemCount = function () {
            return this.container.length;
        };
        return BootstrapLookAndFeel;
    })();
    FlorianMath.mathUI;
    var MarkupPage = (function () {
        function MarkupPage(controller) {
            this.controller = controller;
            this.root = $('<h5>Markup <a href="#">back</a></h5>' + '<p class="text-info" />' + '<form>' + '  <div class="form-group">' + '    <label for="math-ui-markup-type">Type</label>' + '    <select id="math-ui-markup-type" class="form-control" />' + '  </div>' + '  <div class="form-group">' + '    <label for="math-ui-markup">Markup</label> <i class="glyphicon glyphicon-new-window"></i>' + '    <textarea id="math-ui-markup" class="form-control" rows="10" />' + '  </div>' + '</form>');
            $(this.root[0]).find('a').click(function (ev) {
                ev.preventDefault();
                controller.popPage();
            });
        }
        MarkupPage.prototype.setEquation = function (item) {
            var selector = $(this.root[2]).find('select'), sources = item ? item.getSources({ markup: true }) : [];
            $(this.root[1]).text(item ? getFullName(item) : '');
            selector.empty();
            FlorianMath.each(sources, function (source) {
                selector.append($('<option/>').append(FlorianMath.getSourceType(source)));
            });
        };
        MarkupPage.prototype.getRoot = function () {
            return this.root;
        };
        MarkupPage.pageName = 'markup';
        return MarkupPage;
    })();
    var PermalinkPage = (function () {
        function PermalinkPage(controller) {
            this.controller = controller;
            this.root = $('<h5>Permalink <a href="#">back</a></h5>' + '<p class="text-info" />' + '<input type="text" class="form-control" value="http://example.com/kjgr983h">');
            $(this.root[0]).find('a').click(function (ev) {
                ev.preventDefault();
                controller.popPage();
            });
        }
        PermalinkPage.prototype.setEquation = function (item) {
            $(this.root[1]).text(item ? getFullName(item) : '');
        };
        PermalinkPage.prototype.getRoot = function () {
            return this.root;
        };
        PermalinkPage.pageName = 'permalink';
        return PermalinkPage;
    })();
    var ToCodePage = (function () {
        function ToCodePage(controller) {
            this.controller = controller;
            this.root = $('<h5>Convert to Code <a href="#">back</a></h5>' + '<p class="text-info" />' + '<form>' + '  <div class="form-group">' + '    <label for="math-ui-markup-type">Language</label>' + '    <select id="math-ui-markup-type" class="form-control">' + '      <option>JavaScript</option>' + '      <option>C++</option>' + '      <option>Mathematica</option>' + '    </select>' + '  </div>' + '  <div class="form-group">' + '    <label for="math-ui-markup">Code</label> <i class="glyphicon glyphicon-new-window"></i>' + '    <textarea id="math-ui-markup" class="form-control" rows="10">for (int i=0; i < 10; i++)\n  n += i;</textarea>' + '  </div>' + '</form>');
            $(this.root[0]).find('a').click(function (ev) {
                ev.preventDefault();
                controller.popPage();
            });
        }
        ToCodePage.prototype.setEquation = function (item) {
            $(this.root[1]).text(item ? getFullName(item) : '');
        };
        ToCodePage.prototype.getRoot = function () {
            return this.root;
        };
        ToCodePage.pageName = 'tocode';
        return ToCodePage;
    })();
    var EqnPage = (function () {
        function EqnPage(controller) {
            var _this = this;
            this.controller = controller;
            var nav = $('<ul class="nav nav-pills nav-stacked" />');
            FlorianMath.each(['Markup', 'Permalink', 'Convert to code', 'Open with', 'Share', 'Search', 'Speak'], function (label) {
                nav.append($('<li role="presentation" />').append($('<a href="#" />').append(label)));
            });
            nav.click(function (ev) {
                nav.find('a').each(function (k, elem) {
                    if (ev.target === elem) {
                        ev.preventDefault();
                        var name = [MarkupPage.pageName, PermalinkPage.pageName, ToCodePage.pageName, null, null, null, null][k];
                        if (name)
                            _this.controller.pushPage(name);
                    }
                });
            });
            this.root = $([$('<p class="text-info" />')[0], $('<p class="text-info" />')[0], nav[0]]);
            controller.registerPage(MarkupPage.pageName, new MarkupPage(controller));
            controller.registerPage(PermalinkPage.pageName, new PermalinkPage(controller));
            controller.registerPage(ToCodePage.pageName, new ToCodePage(controller));
        }
        EqnPage.prototype.setEquation = function (item) {
            $(this.root[0]).text(item ? 'Number on page: ' + (item._private.id + 1) + ' out of ' + FlorianMath.mathUI.itemCount() : '');
            if (item && getUserName(item))
                $(this.root[1]).text('Equation name: ' + getUserName(item)).show();
            else
                $(this.root[1]).hide();
        };
        EqnPage.prototype.getRoot = function () {
            return this.root;
        };
        EqnPage.pageName = 'eqn';
        return EqnPage;
    })();
    var SelectionPage = (function () {
        function SelectionPage() {
            this.root = $('<emph>Not implemented yet</emph>');
        }
        SelectionPage.prototype.setEquation = function (item) {
        };
        SelectionPage.prototype.getRoot = function () {
            return this.root;
        };
        SelectionPage.pageName = 'selection';
        return SelectionPage;
    })();
    var GeneralPage = (function () {
        function GeneralPage() {
            var p = $('<p/>'), nav = $('<ul class="nav nav-pills nav-stacked" />');
            FlorianMath.each(['Highlight all equations', 'List all', 'Help', 'About'], function (label) {
                nav.append($('<li role="presentation" />').append($('<a href="#" />').append(label)));
            });
            nav.click(function (ev) {
                nav.find('a').each(function (k, elem) {
                    if (ev.target === elem) {
                        ev.preventDefault();
                        if (k === 0)
                            FlorianMath.mathUI.highlightAll();
                    }
                });
            });
            this.root = $([p[0], nav[0]]);
        }
        GeneralPage.prototype.setEquation = function (item) {
        };
        GeneralPage.prototype.getRoot = function () {
            $(this.root[0]).text('Equations on page: ' + FlorianMath.mathUI.itemCount());
            return this.root;
        };
        GeneralPage.pageName = 'general';
        return GeneralPage;
    })();
    var Sidebar = (function () {
        function Sidebar() {
            var _this = this;
            this.body = $('<div class="panel-body" />');
            this.topmenu = $('<div class="btn-group btn-group-justified" role="group"><a href="#" class="btn btn-sm btn-primary active">Equation</a><a href="#" class="btn btn-sm btn-primary">Selection</a><a href="#" class="btn btn-sm btn-primary">Page</a></div>');
            this.pages = {};
            this.pageStack = [];
            this.currentItem = null;
            var closer = $('<button type="button" class="close">&times;</button>');
            $(doc.body).append($('<div id="math-ui-viewport" />').append($('<div id="math-ui-bar" class="math-ui" />').append($('<div class="panel panel-primary" />').append($('<div class="panel-heading" />').append(closer, $('<h4 class="panel-title">Math UI</h4>')), this.topmenu, this.body))));
            closer.click(function (ev) {
                _this.hide();
            });
            this.registerPage(EqnPage.pageName, new EqnPage(this));
            this.registerPage(SelectionPage.pageName, new SelectionPage());
            this.registerPage(GeneralPage.pageName, new GeneralPage());
            this.topmenu.click(function (ev) {
                ev.preventDefault();
                _this.topmenu.find('a').each(function (k, elem) {
                    if (ev.target === elem) {
                        _this.showTop(k);
                    }
                });
            });
            $(doc).mousedown(function () {
                if (_this.isShowing())
                    _this.hide();
            });
            $('#math-ui-bar').mousedown(function (ev) {
                ev.stopPropagation();
            });
        }
        Sidebar.prototype.registerPage = function (name, page) {
            this.pages[name] = page;
        };
        Sidebar.prototype._pushPage = function (page) {
            this.pageStack.push(page);
            this.body.contents().detach();
            this.body.append(page.getRoot());
            this.body.find('a').first().focus();
        };
        Sidebar.prototype.pushPage = function (name) {
            this._pushPage(this.pages[name]);
        };
        Sidebar.prototype.popPage = function () {
            this.pageStack.pop();
            this._pushPage(this.pageStack.pop());
        };
        Sidebar.prototype.setEquation = function (item) {
            this.currentItem = item;
            this.topmenu.find('a').first().toggleClass('disabled', !item);
            for (var n in this.pages)
                if (this.pages.hasOwnProperty(n))
                    this.pages[n].setEquation(item);
        };
        Sidebar.prototype.showTop = function (k) {
            var as = this.topmenu.find('a');
            as.removeClass('active');
            $(as[k]).addClass('active');
            var name = [EqnPage.pageName, SelectionPage.pageName, GeneralPage.pageName][k];
            this.pageStack = [];
            this.pushPage(name);
        };
        Sidebar.prototype.show = function (topIndex) {
            $(document.body).addClass('math-ui-show');
            this.showTop(topIndex);
        };
        Sidebar.prototype.hide = function () {
            $(document.body).removeClass('math-ui-show');
            if (menuRemover)
                menuRemover();
            if (this.currentItem)
                $(this.currentItem).focus();
        };
        Sidebar.prototype.isShowing = function () {
            return $(document.body).hasClass('math-ui-show');
        };
        return Sidebar;
    })();
    FlorianMath.requireLibs().then(function (jq) {
        $ = jq;
        sidebar = new Sidebar();
        FlorianMath.mathUI = new BootstrapLookAndFeel($);
        FlorianMath.dispatchCustomEvent(doc, 'created.math-ui');
        FlorianMath.initialized().then(function () {
            log('Applying MathUI to math-items');
            FlorianMath.each(doc.querySelectorAll('math-item'), function (mathItem) {
                FlorianMath.mathUI.add(mathItem);
            });
        });
        function pagerendered() {
            log('page rendered');
            if (location.hash) {
                var item = doc.querySelector(FlorianMath.MATH_ITEM_TAG + location.hash);
                if (item) {
                    item.scrollIntoView();
                    item.focus();
                }
            }
        }
        if (FlorianMath.rendering())
            FlorianMath.addCustomEventListener(doc, FlorianMath.ALL_RENDERED_EVENT, function onpagerendered() {
                FlorianMath.removeCustomEventListener(doc, FlorianMath.ALL_RENDERED_EVENT, onpagerendered);
                pagerendered();
            });
        else
            pagerendered();
    });
})(FlorianMath || (FlorianMath = {}));

FlorianMath.requireLibs().then(function (jQuery) {
});
