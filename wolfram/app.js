/// <reference path="math-item.d.ts" />s
/// <reference path="jquery.d.ts" />
var FlorianMath;
(function (FlorianMath) {
    var log = function (a1, a2) {
    };
    if ('console' in window)
        log = function (a1, a2) {
            if (a2 !== undefined)
                console.log(a1, a2);
            else
                console.log(a1);
        };
    function onFocus() {
        var contentElement, $item = $(this), menu = $('<div class="math-ui-focus-menu"><div class="eraser"/><span>Equation 2</span><span class="icon icon-menu" /><span class="icon icon-zoom-in" /><span class="icon icon-star-empty" /></div>');
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
    }
    FlorianMath.initialized().then(function () {
        log('initialized');
        $('math-item').attr('tabindex', 0).focus(onFocus);
    });
})(FlorianMath || (FlorianMath = {}));
//# sourceMappingURL=app.js.map