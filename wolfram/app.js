/// <reference path="math-item.d.ts" />s
/// <reference path="jquery.d.ts" />
var FlorianMath;
(function (FlorianMath) {
    var ACTIVE_CLASS = 'active', focusItem, hoverItem, menuItem, menuRemover;
    function map(list, fn) {
        var result = [];
        FlorianMath.each(list, function (item) {
            result.push(fn(item));
        });
        return result;
    }
    var log = function (a1, a2) {
    };
    if ('console' in window)
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
    function showMenu(item) {
        var contentElement, $item = $(item), display_inline, eraser = $('<div class="eraser"/>'), name = $('<span/>').append('Equation 2'), icons = map(['menu', 'zoom-in', 'star-empty'], function (i) { return $('<span class="icon icon-' + i + '" />'); }), iconspan = $('<span/>').append(icons), menu = $('<div class="math-ui-focus-menu" />').append(eraser, name, iconspan);
        if ($item.hasClass(ACTIVE_CLASS))
            return;
        $item.addClass(ACTIVE_CLASS).append(menu);
        if (item.shadowRoot) {
            contentElement = $('<content select=".math-ui-focus-menu" />');
            $(item.shadowRoot).append(contentElement);
        }
        display_inline = $item.css('display') === 'inline';
        if (display_inline)
            $item.css('display', 'inline-block'); // correct width on Chrome
        var item_padding = 2, focus_border_width = 2, menu_left = 8, itemWidth = getWidth(item);
        if (itemWidth >= 0) {
            //log(itemWidth - 2*item_padding - focus_border_width - menu_left);
            eraser.width(itemWidth - 2 * item_padding - focus_border_width - menu_left);
        }
        if (display_inline)
            $item.css('display', 'inline');
        icons[0].on('mousedown', function (ev) {
            var items = $('<div/>');
            stopEvent(ev);
            FlorianMath.each(['Get markup', 'Convert to code', 'Open with', 'Share', 'Search', 'Speak'], function (label) {
                items.append($('<a href="#" />').append(label));
            });
            iconspan.append(items);
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
    FlorianMath.initialized().then(function () {
        log('initialized');
        $('math-item').attr('tabindex', 0).focus(onFocus).blur(onBlur);
        if (location.hash === '#hoverfocus') {
            $('math-item').mouseenter(onMouseEnter).mouseleave(onMouseLeave);
        }
    });
})(FlorianMath || (FlorianMath = {}));
//# sourceMappingURL=app.js.map