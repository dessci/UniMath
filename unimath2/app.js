var UniMath;
(function (UniMath) {
    'use strict';

    function loadDialogPolyfill(onLoad) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'dialog-polyfill.css';
        head.insertBefore(link, head.firstChild);
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'dialog-polyfill.js';
        script.onload = onLoad;
        head.appendChild(script);
    }

    function checkDialogSupport() {
        var testEl = document.createElement('dialog');
        if (testEl instanceof HTMLUnknownElement) {
            loadDialogPolyfill(function () {
                console.log('Successfully loaded dialog polyfill');
                var dialogs = document.getElementsByTagName('dialog');
                Array.prototype.forEach.call(dialogs, function (dialog) {
                    dialogPolyfill.registerDialog(dialog);
                });
            });
        }
    }

    function elementWithClass(tagName, className) {
        var el = document.createElement(tagName);
        el.className = className;
        return el;
    }

    function showModal(dialog, onClose) {
        function closing() {
            dialog.removeEventListener('close', closing, false);
            if (onClose)
                onClose();
        }
        ;
        dialog.addEventListener('close', closing, false);
        dialog.showModal();
    }

    function go() {
        checkDialogSupport();
        var nodelist = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, function (el) {
            el.appendChild(elementWithClass('span', 'nofocus fa fa-superscript'));
            var d = elementWithClass('div', 'focus');
            d.appendChild(elementWithClass('span', 'zoom fa fa-search-plus'));
            var menuEl = elementWithClass('span', 'menu fa fa-external-link');
            d.appendChild(menuEl);
            el.appendChild(d);
            function showZoom() {
                var jaxElement = el.querySelector('script[type="math/mml"]');
                var dialog = document.getElementById('unimath-zoom');
                var closeElement = dialog.querySelector('button');
                function closeTrigger() {
                    dialog.close();
                }
                ;
                closeElement.addEventListener('click', closeTrigger, false);
                var jaxClone = jaxElement.cloneNode(true);
                var eqn = dialog.querySelector('.eqn');
                eqn.appendChild(jaxClone);
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, jaxClone]);
                showModal(dialog, function () {
                    closeElement.removeEventListener('click', closeTrigger, false);
                    while (eqn.firstChild) {
                        eqn.removeChild(eqn.firstChild);
                    }
                });
            }
            function showSourceDialog(source) {
                console.log('showSourceDialog');
                var dialog = document.getElementById('unimath-source');
                function closeTrigger() {
                    dialog.close();
                }
                var pre = document.createElement('pre');
                pre.appendChild(document.createTextNode(source));
                dialog.appendChild(pre);
                showModal(dialog, function () {
                    dialog.removeChild(pre);
                    document.removeEventListener('click', closeTrigger, false);
                });
                document.addEventListener('click', closeTrigger, false);
            }
            function showMenu(ev) {
                ev.stopPropagation();
                var dialog = document.getElementById('unimath-menu');
                function closeTrigger() {
                    dialog.close();
                }
                function showSource(ev) {
                    ev.stopPropagation();
                    closeTrigger();
                    var jaxElement = el.querySelector('script[type="math/mml"]');
                    var source = jaxElement.textContent;
                    showSourceDialog(source);
                }
                var liEls = dialog.getElementsByTagName('li');
                liEls[0].addEventListener('click', showSource, false);
                liEls[3].addEventListener('click', closeTrigger, false);
                showModal(dialog, function () {
                    liEls[0].removeEventListener('click', showSource, false);
                    liEls[3].removeEventListener('click', closeTrigger, false);
                });
            }
            el.addEventListener('click', showZoom, false);
            menuEl.addEventListener('click', showMenu, false);
        });
    }
    UniMath.go = go;
})(UniMath || (UniMath = {}));

UniMath.go();
//# sourceMappingURL=app.js.map
