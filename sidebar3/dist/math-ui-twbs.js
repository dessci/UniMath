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
    var global = window, doc = document;
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
    function getName(mathItem) {
        return 'Equation ' + (mathItem._private.id + 1);
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
    FlorianMath.mathUI;
    FlorianMath.requireLibs().then(function ($) {
        var ACTIVE_CLASS = 'active', focusItem, hoverItem, menuItem, menuRemover, sidebar;
        function Sidebar() {
            var _this = this;
            var body = $('<div class="panel-body" />'), closer = $('<button type="button" class="close">&times;</button>');
            $(document.body).append($('<div id="math-ui-viewport" />').append($('<div id="math-ui-bar" class="math-ui" />').append($('<div class="panel panel-primary" />').append($('<div class="panel-heading" />').append(closer, $('<h4 class="panel-title">Math UI</h4>')), body))));
            closer.click(function (ev) {
                _this.hide();
            });
            this.body = body;
            this.reset();
        }
        Sidebar.prototype.reset = function () {
            var nav = $('<ul class="nav nav-pills nav-stacked" />'), pagenav = $('<ul class="nav nav-pills nav-stacked" />'), body = this.body;
            FlorianMath.each(['Markup', 'Permalink', 'Convert to code', 'Open with', 'Share', 'Search', 'Speak'], function (label) {
                nav.append($('<li role="presentation" />').append($('<a href="#" />').append(label)));
            });
            FlorianMath.each(['Highlight all equations', 'List all', 'Help', 'About'], function (label) {
                pagenav.append($('<li role="presentation" />').append($('<a href="#" />').append(label)));
            });
            body.empty().append($('<h5>Equation 8</h5>'), $('<h6>Pythagoras\'s Theorem</h6>'), nav).append($('<h5>General</h5>'), pagenav);
            nav.click(function (ev) {
                nav.find('a').each(function (k, elem) {
                    if (ev.target === elem) {
                        if (k === 0) {
                            body.empty();
                            body.append($('<a href="#"><h5><i class="glyphicon glyphicon-chevron-left"></i> Markup</h5></a>'));
                            body.append($('<h6>Equation 8 (Pythagoras\'s Theorem)</h6>'));
                            body.append($('<form>' + '  <div class="form-group">' + '    <label for="math-ui-markup-type">Type</label>' + '    <select id="math-ui-markup-type" class="form-control">' + '      <option>MathML</option>' + '      <option>TeX</option>' + '    </select>' + '  </div>' + '  <div class="form-group">' + '    <label for="math-ui-markup">Markup</label> <i class="glyphicon glyphicon-new-window"></i>' + '    <textarea id="math-ui-markup" class="form-control" rows="10"><math display="block">\n    <mstyle displaystyle="true">\n        <mi>f</mi>\n        <mrow>\n            <mo>(</mo>\n            <mi>a</mi>\n            <mo>)</mo>\n        </mrow>\n        <mo>=</mo>\n        <mfrac>\n            <mn>1</mn>\n            <mrow>\n                <mn>2</mn>\n                <mi>π<!-- π --></mi>\n                <mi>i</mi>\n            </mrow>\n        </mfrac>\n        <msub>\n            <mo>∮</mo>\n            <mrow>\n                <mi>γ</mi>\n            </mrow>\n        </msub>\n        <mfrac>\n            <mrow>\n                <mi>F</mi>\n                <mo>(</mo>\n                <mi>z</mi>\n                <mo>)</mo>\n            </mrow>\n            <mrow>\n                <mi>z</mi>\n                <mo>−</mo>\n                <mi>a</mi>\n            </mrow>\n        </mfrac>\n        <mi>d</mi>\n        <mi>z</mi>\n    </mstyle>\n</math></textarea>' + '  </div>' + '</form>'));
                        }
                        else if (k === 1) {
                            body.empty();
                            body.append($('<h5><button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>Permalink</h5>'));
                            body.append($('<input type="text" class="form-control" value="http://example.com/kjgr983h">'));
                        }
                        else if (k === 2) {
                            body.empty();
                            body.append($('<ol class="breadcrumb"><li><a href="#">Top</a></li><li class="active">Convert to code</li></ol>'));
                            body.append('<form>' + '  <div class="form-group">' + '    <label for="math-ui-markup-type">Language</label>' + '    <select id="math-ui-markup-type" class="form-control">' + '      <option>JavaScript</option>' + '      <option>C++</option>' + '      <option>Mathematica</option>' + '    </select>' + '  </div>' + '  <div class="form-group">' + '    <label for="math-ui-markup">Code</label> <i class="glyphicon glyphicon-new-window"></i>' + '    <textarea id="math-ui-markup" class="form-control" rows="10">for (int i=0; i < 10; i++)\n  n += i;</textarea>' + '  </div>' + '</form>');
                        }
                    }
                });
            });
        };
        Sidebar.prototype.show = function () {
            $(document.body).addClass('math-ui-show');
            this.body.find('a').first().focus();
        };
        Sidebar.prototype.hide = function () {
            $(document.body).removeClass('math-ui-show');
            this.reset();
        };
        sidebar = new Sidebar();
        // Zoom
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
            var $item = $(item), contentElement, display_inline, bodyHandler, eraser = $('<div class="eraser"/>'), icons = map(['cog', 'zoom-in', 'unchecked', 'question-sign'], function (i) { return $('<span class="glyphicon glyphicon-' + i + '" />'); }), top = $('<div class="top" />').append($('<span class="eqn-name" />').append(getName(item)), icons), body = $('<div class="body" />'), menu = $('<div class="math-ui focus-menu" />').append(eraser, top, body);
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
            body.on('mousedown keydown', function (ev) {
                if (ev.type === 'mousedown' && ev.which !== 1)
                    return;
                if (bodyHandler)
                    bodyHandler(ev);
            });
            menu.on('mousedown keydown', function (ev) {
                if (ev.type === 'mousedown' && ev.which !== 1)
                    return;
                top.children().each(function (k) {
                    if (ev.target === this) {
                        stopEvent(ev);
                        switch (k) {
                            case 0:
                            case 1:
                                sidebar.show();
                                break;
                            case 2:
                                doZoom();
                                break;
                            case 3:
                                toggleSelected();
                                break;
                        }
                    }
                });
            });
            menuItem = item;
            menuRemover = function () {
                menu.remove();
                if (contentElement)
                    contentElement.remove();
                $item.removeClass(ACTIVE_CLASS);
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
            focusItem = null;
            checkState();
        }
        function onMouseEnter() {
            hoverItem = this;
            checkState();
        }
        function onMouseLeave() {
            hoverItem = null;
            checkState();
        }
        // Main class
        function BootstrapLookAndFeel(jq) {
            this.container = [];
            this.highlighted = false;
            this.$ = jq;
        }
        BootstrapLookAndFeel.prototype.add = function (mathItem) {
            var $mathItem = $(mathItem);
            this.container.push(mathItem);
            if (!$mathItem.attr('id'))
                $mathItem.attr('id', 'math-item-' + this.container.length);
            $mathItem.attr('tabindex', 0).attr('draggable', 'true').focus(onFocus).blur(onBlur);
            if (location.hash === '#hoverfocus') {
                $('math-item').mouseenter(onMouseEnter).mouseleave(onMouseLeave);
            }
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
