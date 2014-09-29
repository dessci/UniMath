/// <reference path="unimath-mathjax.ts" />
/// <reference path="unimath-xml.ts" />

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

    var backend: Backend = new MathJaxBackend();

    function loadDialogPolyfill(onLoad: () => void): void {
        var head: HTMLHeadElement = document.getElementsByTagName('head')[0];
        var link: HTMLLinkElement = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'css/dialog-polyfill.css';
        head.insertBefore(link, head.firstChild);
        var script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'js/dialog-polyfill.js';
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

    function createDialogElement(title: string): HTMLDialogElement {
        var dialog: HTMLDialogElement = <HTMLDialogElement> elementWithClass('dialog', 'unimath-dialog');
        if ('dialogPolyfill' in window)
            dialogPolyfill.registerDialog(dialog);
        var header: HTMLElement = elementWithClass('div', 'header');
        header.appendChild(document.createTextNode(title));
        var closer: HTMLElement = elementWithClass('i', 'fa fa-times');
        function closeClick(ev: PointerEvent): void {
            ev.stopPropagation();
            dialog.close();
        }
        function onClose(): void {
            closer.removeEventListener('click', closeClick, false);
            dialog.removeEventListener('close', onClose, false);
        }
        header.appendChild(closer);
        dialog.appendChild(header);
        closer.addEventListener('click', closeClick, false);
        dialog.addEventListener('close', onClose, false);
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

    /*function menuAction(): void {
        alert('menu');
    }*/

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

    function shareAction(item: UniMathItem): void {
        alert('Share');
    }

    function searchAction(item: UniMathItem): void {
        alert('Search');
    }

    var highlightAll: boolean = false;
    function highlightAllAction(): void {
        highlightAll = !highlightAll;
        var nodelist: NodeList = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, (el: HTMLElement): void => {
            if (highlightAll) {
                addClass(el, 'hover');
            } else {
                removeClass(el, 'hover');
            }
        });
    }

    function noopAction(): void {
        alert('Not implemented');
    }

    interface MenuItemData {
        html: string;
        callback: (item?: UniMathItem) => void;
        button?: HTMLButtonElement;
        clickHandler?: (ev: PointerEvent) => void;
    }

    var dashboardItems: MenuItemData[] = [
        { html: '<i class="fa fa-lightbulb-o"></i> Highlight All Equations', callback: highlightAllAction },
        { html: '<i class="fa fa-question"></i> Action 2', callback: noopAction },
        { html: '<i class="fa fa-question"></i> Action 3', callback: noopAction },
        { html: '<i class="fa fa-question"></i> Action 4', callback: noopAction }
    ];

    function dashboardAction(): void {
        var dialog: HTMLDialogElement = createDialogElement('Universal Math Dashboard');
        var body: HTMLElement = elementWithClass('div', 'body');
        dialog.appendChild(body);
        document.body.appendChild(dialog);

        var menuContainer: HTMLElement = elementWithClass('div', 'dashboard');
        dashboardItems.forEach((item: MenuItemData): void => {
            item.button = document.createElement('button');
            item.button.innerHTML = item.html;
            item.clickHandler = (ev: PointerEvent): void => {
                ev.stopPropagation();
                dialog.close();
                item.callback(this);
            };
            item.button.addEventListener('click', item.clickHandler, false);
            menuContainer.appendChild(item.button);
        });
        body.appendChild(menuContainer);

        function closer(): void {
            dialog.removeEventListener('close', closer, false);
            dashboardItems.forEach((item: MenuItemData): void => {
                item.button.removeEventListener('click', item.clickHandler, false);
            });
        }

        dialog.addEventListener('close', closer, false);
        dialog.showModal();
    }

    var menuItems: MenuItemData[] = [
        {
            html: '<i class="fa fa-file-text"></i> View MathML Source',
            callback: (item: UniMathItem): void => item.viewSourceAction()
        },
        { html: '<i class="fa fa-share-alt"></i> Share', callback: shareAction },
        { html: '<i class="fa fa-search"></i> Search', callback: searchAction },
        { html: '<i class="fa fa-dashboard"></i> Page Dashboard', callback: dashboardAction }
    ];

    class UniMathItem {
        private zoomEl: HTMLElement;
        //private menuEl: HTMLElement;
        private actionsEl: HTMLElement;
        private activeAction: number;
        private eatFocusClick: boolean = true;

        public viewSourceAction(): void {
            var dialog: HTMLDialogElement = createDialogElement('MathML Source for Equation ' + this.eqnNumber);
            var body: HTMLElement = elementWithClass('div', 'body');
            var text: HTMLTextAreaElement = document.createElement('textarea');
            var src: string = backend.getSource(this.el);
            src = UniMath.prettifyMathML(src);
            text.value = src;
            text.disabled = true;
            body.appendChild(text);
            dialog.appendChild(body);
            document.body.appendChild(dialog);
            dialog.showModal();
        }

        private zoomAction(): void {
            var dialog: HTMLDialogElement = createDialogElement('Equation ' + this.eqnNumber);
            var body: HTMLElement = elementWithClass('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            if (!backend.equationZoom(body, this.el, 2))
                body.appendChild(document.createTextNode('Error'));

            var menuContainer: HTMLElement = elementWithClass('div', 'menu');
            menuItems.forEach((item: MenuItemData): void => {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = (ev: PointerEvent): void => {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback(this);
                };
                item.button.addEventListener('click', item.clickHandler, false);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer(): void {
                dialog.removeEventListener('close', closer, false);
                menuItems.forEach((item: MenuItemData): void => {
                    item.button.removeEventListener('click', item.clickHandler, false);
                });
            }

            dialog.addEventListener('close', closer, false);
            dialog.showModal();
        }

        private triggerActiveAction(): void {
            this.el.blur();
            this.eatFocusClick = true;
            //if (this.activeAction === 0) {
            this.zoomAction();
            /*} else {
                menuAction();
            }*/
        }

        private clickHandler: () => void = (): void => {
            if (this.eatFocusClick) {
                this.eatFocusClick = false;
            } else {
                this.triggerActiveAction();
            }
        };

        /*private changeActiveAction(newAction: number): void {
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
        };*/

        private keydownHandler: (ev: KeyboardEvent) => void = (ev: KeyboardEvent): void => {
            // console.log('keydown', ev.keyCode);
            switch (ev.keyCode) {
                /*case 37: // left arrow
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
                    break;*/
                case 13: // return
                    this.triggerActiveAction();
                    break;
            }
        };

        /*private currentActionElement(): HTMLElement {
            return this.activeAction === 0 ? this.zoomEl : this.menuEl;
        }*/

        constructor(private el: HTMLElement, private eqnNumber: number, private focusManager: IFocusManager) {
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
            //this.zoomEl = elementWithClass('span', 'zoom fa fa-search-plus on');
            this.zoomEl = elementWithClass('span', 'zoom fa fa-superscript');
            //this.menuEl = elementWithClass('span', 'menu fa fa-external-link');
            this.actionsEl = elementWithClass('div', 'actions');
            this.actionsEl.appendChild(this.zoomEl);
            //this.actionsEl.appendChild(this.menuEl);
            this.el.appendChild(this.actionsEl);
            this.activeAction = 0;
            addClass(this.el, 'focus');
            /*this.menuEl.addEventListener('mouseenter', this.enterMenuHandler, false);
            this.menuEl.addEventListener('click', this.enterMenuHandler, false);
            this.menuEl.addEventListener('mouseleave', this.leaveMenuHandler, false);*/
            this.el.addEventListener('click', this.clickHandler, false);
            this.el.addEventListener('keydown', this.keydownHandler, false);
        }
        lostFocus(): void {
            this.el.removeEventListener('keydown', this.keydownHandler, false);
            this.el.removeEventListener('click', this.clickHandler, false);
            /*this.menuEl.removeEventListener('mouseleave', this.leaveMenuHandler, false);
            this.menuEl.removeEventListener('click', this.enterMenuHandler, false);
            this.menuEl.removeEventListener('mouseenter', this.enterMenuHandler, false);*/
            removeClass(this.el, 'focus');
            this.el.removeChild(this.actionsEl);
            this.actionsEl = this.zoomEl = /*this.menuEl =*/ undefined;
        }
        gotHover(): void {
            addClass(this.el, 'hover');
        }
        lostHover(): void {
            removeClass(this.el, 'hover');
        }
    }

    var focusManager: IFocusManager = new FocusManager();

    export function init(): void {
        var totalCount: number = 0, blockCount: number = 0, inlineCount: number = 0;
        var nodelist: NodeList = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, (el: HTMLElement): void => {
            totalCount++;
            if (el.localName === 'div') {
                blockCount++;
            } else {
                inlineCount++;
            }
            new UniMathItem(el, totalCount, focusManager);
        });

        var dashboardTrigger: HTMLElement = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', (ev: PointerEvent): void => {
                ev.preventDefault();
                dashboardAction();
            }, false);
        }

        checkDialogSupport();

        console.log('Initialized UniMath: ' + (inlineCount + blockCount)
            + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');

        /*var src = '<math><mi>    <malignmark/>  <malignmark/> regre   </mi></math>';
        //var src = '<math>x</math>';
        console.log(src);
        src = UniMath.prettifyMathML(src);
        console.log(src);*/
    }
}

UniMath.init();
 