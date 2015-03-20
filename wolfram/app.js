/// <reference path="math-item.d.ts" />s
/// <reference path="jquery.d.ts" />
var FlorianMath;
(function (FlorianMath) {
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
    function onFocus() {
        var contentElement, $item = $(this), display_inline, eraser = $('<div class="eraser"/>'), name = $('<span/>').append('Equation 2'), icons = map(['menu', 'zoom-in', 'star-empty'], function (i) { return $('<span class="icon icon-' + i + '" />'); }), iconspan = $('<span/>').append(icons), menu = $('<div class="math-ui-focus-menu" />').append(eraser, name, iconspan);
        if ($item.hasClass('focus'))
            return;
        $item.addClass('focus').append(menu).blur(function () {
            menu.remove();
            if (contentElement)
                contentElement.remove();
            $item.removeClass('focus');
        });
        if (this.shadowRoot) {
            contentElement = $('<content select=".math-ui-focus-menu" />');
            $(this.shadowRoot).append(contentElement);
        }
        display_inline = $item.css('display') === 'inline';
        if (display_inline)
            $item.css('display', 'inline-block'); // correct width on Chrome
        var item_padding = 2, focus_border_width = 2, menu_left = 8, itemWidth = getWidth(this);
        if (itemWidth >= 0) {
            log(itemWidth - 2 * item_padding - focus_border_width - menu_left);
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
    }
    FlorianMath.initialized().then(function () {
        log('initialized');
        $('math-item').attr('tabindex', 0).focus(onFocus);
    });
})(FlorianMath || (FlorianMath = {}));
//# sourceMappingURL=app.js.map