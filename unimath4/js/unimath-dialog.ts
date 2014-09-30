/// <reference path="unimath-dom.ts" />

interface HTMLDialogElement extends HTMLElement {
    showModal(): void;
    show(): void;
    close(): void;
}

interface Document {
    createElement(tagName: 'dialog'): HTMLDialogElement;
}

interface DialogPolyfill {
    registerDialog(el: Element): void;
}

declare var dialogPolyfill: DialogPolyfill;

module UniMath {
    'use strict';

    function loadDialogPolyfill(onLoad: EventListener): void {
        var head: HTMLHeadElement = document.getElementsByTagName('head')[0];
        var link: HTMLLinkElement = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'css/dialog-polyfill.css';
        head.insertBefore(link, head.firstChild);  // should be placed before other CSS rules
        var script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'js/dialog-polyfill.js';
        script.onload = onLoad;
        head.appendChild(script);
    }

    export function checkDialogSupport(): void {
        var testEl: HTMLElement = document.createElement('dialog');
        if (testEl instanceof HTMLUnknownElement) {
            loadDialogPolyfill((): void => {
                console.log('Successfully loaded dialog polyfill');
            });
        }
    }

    export function createDialogElement(title: string): HTMLDialogElement {
        var dialog: HTMLDialogElement = <HTMLDialogElement> createElement('dialog', 'unimath-dialog');
        if ('dialogPolyfill' in window)
            dialogPolyfill.registerDialog(dialog);
        var header: HTMLElement = createElement('div', 'header');
        header.appendChild(document.createTextNode(title));
        var closer: HTMLElement = createElement('i', 'fa fa-times');
        function closeClick(ev: PointerEvent): void {
            ev.stopPropagation();
            dialog.close();
        }
        function onClose(): void {
            removeEventListenerFn(closer, 'click', closeClick);
            removeEventListenerFn(dialog, 'close', onClose);
        }
        header.appendChild(closer);
        dialog.appendChild(header);
        addEventListenerFn(closer, 'click', closeClick);
        addEventListenerFn(dialog, 'close', onClose);
        return dialog;
    }

}
