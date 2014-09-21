var UniMath;
(function (UniMath) {
    'use strict';

    function camelize(str) {
        return str.replace(/\-(\w)/g, function (str, letter) {
            return letter.toUpperCase();
        });
    }

    function getStyle(el, styleProp) {
        if (document.defaultView && document.defaultView.getComputedStyle)
            return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        if (el.currentStyle)
            return el.currentStyle[camelize(styleProp)];
        return el.style[camelize(styleProp)];
    }

    function go() {
        var el = document.getElementById('eqn1');
        var img = el.getElementsByTagName('img')[0];
        var fontsize = parseFloat(getStyle(el, 'font-size'));
        console.log('font-size', fontsize);
        var imgs = [
            { src: 'eqn0.gif', 'min-em': 23.8 }, { src: 'eqn1.gif', 'min-em': 16.6 },
            { src: 'eqn2.gif', 'min-em': 10.2 }];
        imgs.forEach(function (item) {
            item['min-px'] = fontsize * item['min-em'];
        });
        var current = 0;
        function check() {
            var width = el.offsetWidth;
            var idx = current;
            while (idx + 1 < imgs.length && width < imgs[idx]['min-px'])
                idx++;
            while (idx > 0 && width >= imgs[idx - 1]['min-px'])
                idx--;
            if (idx !== current) {
                current = idx;
                img.style.width = imgs[current]['min-em'] + 'em';
                img.src = imgs[current].src;
            }
        }
        check();
        new ResizeSensor(el, check);
    }
    UniMath.go = go;
})(UniMath || (UniMath = {}));

UniMath.go();
//# sourceMappingURL=app.js.map
