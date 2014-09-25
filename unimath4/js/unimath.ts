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

    function loadDialogPolyfill(onLoad: () => void): void {
        var head: HTMLHeadElement = document.getElementsByTagName('head')[0];
        var link: HTMLLinkElement = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'dialog-polyfill.css';
        head.insertBefore(link, head.firstChild);
        var script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'dialog-polyfill.js';
        script.onload = onLoad;
        head.appendChild(script);
    }

    function checkDialogSupport(): void {
        var testEl: HTMLElement = document.createElement('dialog');
        if (testEl instanceof HTMLUnknownElement) {
            loadDialogPolyfill((): void => {
                console.log('Successfully loaded dialog polyfill');
            });
        }
    }

    function createDialogElement(): HTMLDialogElement {
        var dialog: HTMLDialogElement = document.createElement('dialog');
        if ('dialogPolyfill' in window)
            dialogPolyfill.registerDialog(dialog);
        return dialog;
    }

    function elementWithClass(tagName: string, className: string): HTMLElement {
        var el: HTMLElement = document.createElement(tagName);
        el.className = className;
        return el;
    }

    function addClass(el: HTMLElement, cls: string): void {
        var cur: string = el.className.trim();
        if (!cur) {
            el.className = cls;
        } else if ((' ' + cur + ' ').indexOf(' ' + cls + ' ') < 0) {
            el.className = cur + ' ' + cls;
        }
    }

    function removeClass(el: HTMLElement, cls: string): void {
        el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').trim();
    }

    /*<dialog id = "unimath-zoom" >
        <div class="eqn" >< / div >
        <div style = "font-size:50%; margin: 0.4em" > To do: Panning or scroll bars for overflowing equations </div >
        <button>Close </button >
    </dialog >*/

    function zoomAction(): void {
        var dialog: HTMLDialogElement = createDialogElement();
        var eqnDiv: HTMLDivElement = document.createElement('div');
        eqnDiv.appendChild(document.createTextNode('Zoooom'));
        dialog.appendChild(eqnDiv);
        document.body.appendChild(dialog);
        dialog.showModal();
    }

    function menuAction(): void {
        alert('menu');
    }

    interface IFocusManager {
        focusIn(el: UniMathItem): void;
        focusOut(): void;
        hoverIn(el: UniMathItem): void;
        hoverOut(): void;
    }

    class FocusManager implements IFocusManager {
        private curFocusItem: UniMathItem = null;
        private curHoverItem: UniMathItem = null;

        private updateFocus(newFocusElement: UniMathItem, newHoverElement: UniMathItem): void {
            var hasFocusClass: UniMathItem = this.curFocusItem !== null ? this.curFocusItem : this.curHoverItem;
            var hasHoverClass: UniMathItem = this.curFocusItem !== null && this.curFocusItem !== this.curHoverItem
                ? this.curHoverItem : null;
            var getFocusClass: UniMathItem = newFocusElement !== null ? newFocusElement : newHoverElement;
            var getHoverClass: UniMathItem = newFocusElement !== null && newFocusElement !== newHoverElement
                ? newHoverElement : null;
            if (hasFocusClass !== getFocusClass) {
                if (hasFocusClass !== null) hasFocusClass.lostFocus();
                if (getFocusClass !== null) getFocusClass.gotFocus();
            }
            if (hasHoverClass !== getHoverClass) {
                if (hasHoverClass !== null) hasHoverClass.lostHover();
                if (getHoverClass !== null) getHoverClass.gotHover();
            }
            this.curFocusItem = newFocusElement;
            this.curHoverItem = newHoverElement;
        }

        focusIn(el: UniMathItem): void {
            this.updateFocus(el, this.curHoverItem);
        }
        focusOut(): void {
            this.updateFocus(null, this.curHoverItem);
        }
        hoverIn(el: UniMathItem): void {
            this.updateFocus(this.curFocusItem, el);
        }
        hoverOut(): void {
            this.updateFocus(this.curFocusItem, null);
        }
    }

    class UniMathItem {
        private zoomEl: HTMLElement;
        private menuEl: HTMLElement;
        private actionsEl: HTMLElement;
        private activeAction: number;
        private eatFocusClick: boolean = true;

        private triggerActiveAction(): void {
            this.el.blur();
            this.eatFocusClick = true;
            var action: () => void = this.activeAction === 0 ? zoomAction : menuAction;
            setTimeout(action, 0);
        }

        private clickHandler: () => void = (): void => {
            if (this.eatFocusClick) {
                this.eatFocusClick = false;
            } else {
                this.triggerActiveAction();
            }
        };

        private changeActiveAction(newAction: number): void {
            if (newAction !== this.activeAction) {
                removeClass(this.currentActionElement(), 'on');
                this.activeAction = newAction;
                addClass(this.currentActionElement(), 'on');
            }
        }

        private enterMenuHandler: () => void = (): void => {
            this.changeActiveAction(1);
        };

        private leaveMenuHandler: () => void = (): void => {
            this.changeActiveAction(0);
        };

        private keydownHandler: (ev: KeyboardEvent) => void = (ev: KeyboardEvent): void => {
            // console.log('keydown', ev.keyCode);
            switch (ev.keyCode) {
                case 37: // left arrow
                case 39: // right arrow
                    this.changeActiveAction((this.activeAction + 1) % 2);
                    break;
                case 90: // 'z'
                    this.changeActiveAction(0);
                    this.triggerActiveAction();
                    break;
                case 77: // 'm'
                    this.changeActiveAction(1);
                    this.triggerActiveAction();
                    break;
                case 13: // return
                    this.triggerActiveAction();
                    break;
            }
        };

        private currentActionElement(): HTMLElement {
            return this.activeAction === 0 ? this.zoomEl : this.menuEl;
        }

        constructor(private el: HTMLElement, private focusManager: IFocusManager) {
            el.setAttribute('tabindex', '0');
            el.addEventListener('focus', (ev: FocusEvent): void => { focusManager.focusIn(this); }, false);
            el.addEventListener('blur', (): void => { focusManager.focusOut(); }, false);
            el.addEventListener('mouseenter', (): void => {
                this.eatFocusClick = false;
                focusManager.hoverIn(this);
            }, false);
            el.addEventListener('mouseleave', (): void => {
                this.eatFocusClick = true;
                focusManager.hoverOut();
            }, false);
        }
        gotFocus(): void {
            this.zoomEl = elementWithClass('span', 'zoom fa fa-search-plus on');
            this.menuEl = elementWithClass('span', 'menu fa fa-external-link');
            this.actionsEl = elementWithClass('div', 'actions');
            this.actionsEl.appendChild(this.zoomEl);
            this.actionsEl.appendChild(this.menuEl);
            this.el.appendChild(this.actionsEl);
            this.activeAction = 0;
            addClass(this.el, 'focus');
            this.menuEl.addEventListener('mouseenter', this.enterMenuHandler, false);
            this.menuEl.addEventListener('click', this.enterMenuHandler, false);
            this.menuEl.addEventListener('mouseleave', this.leaveMenuHandler, false);
            this.el.addEventListener('click', this.clickHandler, false);
            this.el.addEventListener('keydown', this.keydownHandler, false);
        }
        lostFocus(): void {
            this.el.removeEventListener('keydown', this.keydownHandler, false);
            this.el.removeEventListener('click', this.clickHandler, false);
            this.menuEl.removeEventListener('mouseleave', this.leaveMenuHandler, false);
            this.menuEl.removeEventListener('click', this.enterMenuHandler, false);
            this.menuEl.removeEventListener('mouseenter', this.enterMenuHandler, false);
            removeClass(this.el, 'focus');
            this.el.removeChild(this.actionsEl);
            this.actionsEl = this.zoomEl = this.menuEl = undefined;
        }
        gotHover(): void {
            addClass(this.el, 'hover');
        }
        lostHover(): void {
            removeClass(this.el, 'hover');
        }
    }

    function showDashboard(ev: PointerEvent): void {
        ev.preventDefault();
        alert('Dashboard');
    }

    var focusManager: IFocusManager = new FocusManager();

    export function init(): void {
        var blockCount: number = 0, inlineCount: number = 0;
        var nodelist: NodeList = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, (el: HTMLElement): void => {
            if (el.localName === 'div')
                blockCount++;
            else
                inlineCount++;
            new UniMathItem(el, focusManager);
        });

        var dashboardTrigger: HTMLElement = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', showDashboard, false);
        }

        console.log('Initialized UniMath: ' + (inlineCount + blockCount)
            + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');
    }
}

UniMath.init();
