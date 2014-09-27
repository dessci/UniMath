/// <reference path="unimath-backend.ts" />

interface HTMLMathElement extends HTMLElement { }

module UniMath {
    'use strict';

    export class MathMLBackend implements Backend {
        equationZoom(parent: HTMLElement, el: HTMLElement, factor: number): boolean {
            var mathNodes: NodeList = el.getElementsByTagName('math');
            if (mathNodes.length !== 1) return false;
            var mml: HTMLMathElement = <HTMLMathElement> mathNodes[0];
            mml = <HTMLMathElement> mml.cloneNode(true);
            mml.removeAttribute('id');
            var wrap: HTMLElement = document.createElement('div');
            wrap.style.fontSize = (100 * factor) + '%';
            wrap.appendChild(mml);
            parent.appendChild(wrap);
            return true;
        }
    }

}