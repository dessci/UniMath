var UniMath;
(function (UniMath) {
    'use strict';

    function go() {
        var unimathEls = document.getElementsByClassName('unimath');

        function commonAction() {
            alert('To do...');
        }

        Array.prototype.forEach.call(unimathEls, function (el) {
            el.addEventListener('click', commonAction, false);
        });
    }
    UniMath.go = go;
})(UniMath || (UniMath = {}));

UniMath.go();
