interface IMathJaxHub {
    Queue(item: any[]): void;
}
interface IMathJax {
    Hub: IMathJaxHub;
}
declare var MathJax: any;

/// <reference path="unimath-backend.ts" />
module UniMath {

    export class MathJaxBackend implements Backend {
        equationZoom(parent: HTMLElement, el: HTMLElement, factor: number): boolean {
            var script: HTMLScriptElement = <HTMLScriptElement> el.querySelector('script[type="math/mml"]');
            if (!script) return false;
            script = <HTMLScriptElement> script.cloneNode(true);
            script.removeAttribute('id');
            var wrap: HTMLElement = document.createElement('div');
            wrap.style.fontSize = (100 * factor) + '%';
            wrap.appendChild(script);
            parent.appendChild(wrap);
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, script]);
            return true;
        }
    }

}