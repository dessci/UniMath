/// <reference path="unimath-dom.ts" />
/// <reference path="unimath-dialog.ts" />
/// <reference path="unimath-mathjax.ts" />
/// <reference path="unimath-xml.ts" />

module UniMath {
    'use strict';

    var backend: Backend = new MathJaxBackend();

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

    interface MenuItemData {
        html: string;
        callback: () => void;
        button?: HTMLButtonElement;
        clickHandler?: (ev: PointerEvent) => void;
    }

    class UniMathItem {
        private actionsEl: HTMLElement;
        private eatFocusClick: boolean = true;
        static menuItems: MenuItemData[] = [
            {
                html: '<i class="fa fa-file-text"></i> View MathML Source',
                callback: UniMathItem.prototype.viewSourceAction
            },
            { html: '<i class="fa fa-share-alt"></i> Share', callback: UniMathItem.prototype.shareAction },
            { html: '<i class="fa fa-search"></i> Search', callback: UniMathItem.prototype.searchAction },
            {
                html: '<i class="fa fa-dashboard"></i> Page Dashboard',
                callback: UniMathItem.prototype.dashboardAction
            }
        ];

        private dashboardAction(): void {
            this.page.dashboardAction();
        }

        private shareAction(): void {
            alert('Share');
        }

        private searchAction(): void {
            alert('Search');
        }

        private viewSourceAction(): void {
            var dialog: HTMLDialogElement = createDialogElement('MathML Source for Equation ' + this.eqnNumber);
            var body: HTMLElement = createElement('div', 'body');
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

        private menuAction(): void {
            var dialog: HTMLDialogElement = createDialogElement('Equation ' + this.eqnNumber);
            var body: HTMLElement = createElement('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            if (!backend.equationZoom(body, this.el, 2))
                body.appendChild(document.createTextNode('Error'));

            var menuContainer: HTMLElement = createElement('div', 'menu');
            UniMathItem.menuItems.forEach((item: MenuItemData): void => {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = (ev: PointerEvent): void => {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback.call(this);
                };
                addEventListenerFn(item.button, 'click', item.clickHandler);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer(): void {
                removeEventListenerFn(dialog, 'close', closer);
                UniMathItem.menuItems.forEach((item: MenuItemData): void =>
                    removeEventListenerFn(item.button, 'click', item.clickHandler));
            }

            addEventListenerFn(dialog, 'close', closer);
            dialog.showModal();
        }

        private triggerMenu(): void {
            this.el.blur();
            this.eatFocusClick = true;
            this.menuAction();
        }

        private clickHandler: (ev: PointerEvent) => void = (ev: PointerEvent): void => {
            if (this.eatFocusClick) {
                this.eatFocusClick = false;
            } else {
                this.triggerMenu();
            }
        };

        private keydownHandler: (ev: KeyboardEvent) => void = (ev: KeyboardEvent): void => {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                ev.stopPropagation();
                this.triggerMenu();
            }
        };

        constructor(private el: HTMLElement, private eqnNumber: number, private page: UniMathPage) {
            el.setAttribute('tabindex', '0');
            addEventListenerFn(el, 'focus', (): void => page.focusIn(this));
            addEventListenerFn(el, 'blur', (): void => page.focusOut());
            addEventListenerFn(el, 'mouseenter', (): void => { this.eatFocusClick = false; page.hoverIn(this); });
            addEventListenerFn(el, 'mouseleave', (): void => { this.eatFocusClick = true; page.hoverOut(); });
        }
        gotFocus(): void {
            var zoomEl: HTMLElement = createElement('span', 'zoom fa fa-superscript');
            this.actionsEl = createElement('div', 'actions');
            this.actionsEl.appendChild(zoomEl);
            this.el.appendChild(this.actionsEl);
            addClass(this.el, 'focus');
            addEventListenerFn(this.el, 'click', this.clickHandler);
            addEventListenerFn(this.el, 'keypress', this.keydownHandler);
        }
        lostFocus(): void {
            removeEventListenerFn(this.el, 'keypress', this.keydownHandler);
            removeEventListenerFn(this.el, 'click', this.clickHandler);
            removeClass(this.el, 'focus');
            this.el.removeChild(this.actionsEl);
            this.actionsEl = undefined;
        }
        gotHover(): void {
            addClass(this.el, 'hover');
        }
        lostHover(): void {
            removeClass(this.el, 'hover');
        }
    }

    class UniMathPage extends FocusManager {
        private items: UniMathItem[];
        private highlightAll: boolean = false;
        static dashboardItems: MenuItemData[] = [
            {
                html: '<i class="fa fa-lightbulb-o"></i> Highlight All Equations',
                callback: UniMathPage.prototype.highlightAllAction
            },
            { html: '<i class="fa fa-question"></i> Action 2', callback: UniMathPage.prototype.noopAction },
            { html: '<i class="fa fa-question"></i> Action 3', callback: UniMathPage.prototype.noopAction },
            { html: '<i class="fa fa-question"></i> Action 4', callback: UniMathPage.prototype.noopAction }
        ];

        public dashboardAction(): void {
            var dialog: HTMLDialogElement = createDialogElement('Universal Math Dashboard');
            var body: HTMLElement = createElement('div', 'body');
            dialog.appendChild(body);
            document.body.appendChild(dialog);

            var menuContainer: HTMLElement = createElement('div', 'dashboard');
            UniMathPage.dashboardItems.forEach((item: MenuItemData): void => {
                item.button = document.createElement('button');
                item.button.innerHTML = item.html;
                item.clickHandler = (ev: PointerEvent): void => {
                    ev.stopPropagation();
                    dialog.close();
                    item.callback.call(this);
                };
                addEventListenerFn(item.button, 'click', item.clickHandler);
                menuContainer.appendChild(item.button);
            });
            body.appendChild(menuContainer);

            function closer(): void {
                removeEventListenerFn(dialog, 'close', closer);
                UniMathPage.dashboardItems.forEach((item: MenuItemData): void =>
                    removeEventListenerFn(item.button, 'click', item.clickHandler));
            }

            addEventListenerFn(dialog, 'close', closer);
            dialog.showModal();
        }

        private noopAction(): void {
            alert('Not implemented');
        }

        private highlightAllAction(): void {
            this.highlightAll = !this.highlightAll;
            this.items.forEach((item: UniMathItem): void => {
                if (this.highlightAll) {
                    item.gotHover();
                } else {
                    item.lostHover();
                }
            });
        }

        constructor(nodelist: NodeList) {
            super();
            var totalCount: number = 0, blockCount: number = 0, inlineCount: number = 0;
            this.items = Array.prototype.map.call(nodelist, (el: HTMLElement): UniMathItem => {
                totalCount++;
                if (el.localName === 'div') {
                    blockCount++;
                } else {
                    inlineCount++;
                }
                return new UniMathItem(el, totalCount, this);
            });
            console.log('Initialized UniMath page: ' + totalCount
                + ' (' + inlineCount + ' inline, ' + blockCount + ' block)');
        }

    }

    export function init(): void {
        var page: UniMathPage = new UniMathPage(document.getElementsByClassName('unimath'));

        var dashboardTrigger: HTMLElement = document.getElementById('unimath-dashboard-trigger');
        if (dashboardTrigger) {
            addEventListenerFn(dashboardTrigger, 'click', (ev: PointerEvent): void => {
                ev.preventDefault();
                page.dashboardAction();
            });
        }

        checkDialogSupport();

        /*var src = '<math><mi>    <malignmark/>  <malignmark/> regre   </mi></math>';
        //var src = '<math>x</math>';
        console.log(src);
        src = UniMath.prettifyMathML(src);
        console.log(src);*/
    }
}

UniMath.init();
