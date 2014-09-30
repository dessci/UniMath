module UniMath {
    'use strict';

    export interface EventFn {
        (el: HTMLElement, type: string, callback: EventListener): void;
    }

    export var addEventListenerFn: EventFn = window.document.addEventListener
        ? (element: HTMLElement, type: string, fn: EventListener): void => element.addEventListener(type, fn, false)
        : (element: HTMLElement, type: string, fn: EventListener): void => { element.attachEvent('on' + type, fn); };

    export var removeEventListenerFn: EventFn = window.document.removeEventListener
        ? (element: HTMLElement, type: string, fn: EventListener): void => element.removeEventListener(type, fn, false)
        : (element: HTMLElement, type: string, fn: EventListener): void => element.detachEvent('on' + type, fn);

    export function createElement(tagName: string, className: string): HTMLElement {
        var el: HTMLElement = document.createElement(tagName);
        el.className = className;
        return el;
    }

    export function addClass(el: HTMLElement, cls: string): void {
        var cur: string = el.className.trim();
        if (!cur) {
            el.className = cls;
        } else if ((' ' + cur + ' ').indexOf(' ' + cls + ' ') < 0) {
            el.className = cur + ' ' + cls;
        }
    }

    export function removeClass(el: HTMLElement, cls: string): void {
        el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').trim();
    }

}
