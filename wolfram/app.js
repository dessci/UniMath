/// <reference path="math-item.d.ts" />s
/// <reference path="jquery.d.ts" />
var FlorianMath;
(function (FlorianMath) {
    var global = window, doc = document, ACTIVE_CLASS = 'active', focusItem, hoverItem, menuItem, menuRemover;
    function map(list, fn) {
        var result = [];
        FlorianMath.each(list, function (item) {
            result.push(fn(item));
        });
        return result;
    }
    var log = function (a1, a2) {
    };
    if ('console' in global)
        log = function (a1, a2) {
            if (a2 !== undefined)
                console.log(a1, a2);
            else
                console.log(a1);
        };
    function getWidth(el) {
        var b = el.getBoundingClientRect();
        return b.right - b.left;
    }
    function stopEvent(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }
    function getName(mathItem) {
        return 'Equation ' + (mathItem._private.id + 1);
    }
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
    var preventBlur = false;
    function showMenu(item) {
        var contentElement, $item = $(item), display_inline, bodyHandler, eraser = $('<div class="math-ui eraser"/>'), icons = map(['menu', 'zoom-in', 'star-empty', 'question'], function (i) { return $('<span class="icon icon-' + i + '" />'); }), top = $('<div class="math-ui top" />').append($('<span class="math-ui eqn-name" />').append(getName(item)), icons), body = $('<div class="math-ui body" />'), menu = $('<div class="math-ui focus-menu" />').append(eraser, top, body);
        function getMarkup() {
            bodyHandler = function (ev) {
                log('bodyHandler');
                //ev.stopPropagation();
            };
            body.empty().append($('<select><option selected>MathML</option><option>TeX</option></select>'), $('<textarea rows="5" />').append(doc.createTextNode('<math>\n  <mi>x</mi>\n</math>')));
        }
        function showCommands() {
            var items = $('<div class="math-ui list-group" />');
            FlorianMath.each(['Get markup', 'Convert to code', 'Open with', 'Share', 'Search', 'Speak'], function (label) {
                items.append($('<a href="#" />').append(label));
            });
            body.empty().append(items);
            /*bodyHandler = (ev) => {
                stopEvent(ev);
                items.children().each(function (k) {
                    if (ev.target === this) {
                        if (k === 0) {
                            getMarkup();
                        }
                    }
                });
            };*/
        }
        function doZoom() {
            $item.blur();
            zoomAction(item);
        }
        function toggleSelected() {
            var on = item.selected = !item.selected;
            icons[2].toggleClass('icon-star-empty', !on).toggleClass('icon-star-full', on);
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
            //preventBlur = true;
            if (bodyHandler)
                bodyHandler(ev);
        });
        /*body.on('mouseup', () => {
            preventBlur = false;
            log('mouseup', preventBlur);
        });*/
        menu.on('mousedown keydown', function (ev) {
            if (ev.type === 'mousedown' && ev.which !== 1)
                return;
            //log('menu handler');
            top.children().each(function (k) {
                if (ev.target === this) {
                    stopEvent(ev);
                    switch (k) {
                        case 0:
                        case 1:
                            showCommands();
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
        //log('onFocus', this);
        focusItem = this;
        checkState();
    }
    function onBlur() {
        //log('onBlur', this);
        if (!preventBlur) {
            focusItem = null;
            checkState();
        }
    }
    function onMouseEnter() {
        hoverItem = this;
        checkState();
    }
    function onMouseLeave() {
        hoverItem = null;
        checkState();
    }
    FlorianMath.initialized().then(function () {
        log('initialized');
        $('math-item').attr('tabindex', 0).focus(onFocus).blur(onBlur);
        if (location.hash === '#hoverfocus') {
            $('math-item').mouseenter(onMouseEnter).mouseleave(onMouseLeave);
        }
    });
})(FlorianMath || (FlorianMath = {}));
//# sourceMappingURL=app.js.map