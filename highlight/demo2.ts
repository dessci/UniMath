module UniMath2 {
    'use strict';

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

    var curFocusElement: HTMLElement = null;
    var curHoverElement: HTMLElement = null;

    function updateFocus(newFocusElement: HTMLElement, newHoverElement: HTMLElement): void {
        var hasFocusClass: HTMLElement = curFocusElement !== null ? curFocusElement : curHoverElement;
        var hasHoverClass: HTMLElement = curFocusElement !== null && curFocusElement !== curHoverElement ? curHoverElement : null;
        var getFocusClass: HTMLElement = newFocusElement !== null ? newFocusElement : newHoverElement;
        var getHoverClass: HTMLElement = newFocusElement !== null && newFocusElement !== newHoverElement ? newHoverElement : null;
        if (hasFocusClass !== getFocusClass) {
            if (hasFocusClass !== null) {
                removeClass(hasFocusClass, 'focus');
                hasFocusClass.blur();
            }
            if (getFocusClass !== null) {
                addClass(getFocusClass, 'focus');
                getFocusClass.focus();
            }
        }
        if (hasHoverClass !== getHoverClass) {
            if (hasHoverClass !== null)
                removeClass(hasHoverClass, 'hover');
            if (getHoverClass !== null)
                addClass(getHoverClass, 'hover');
        }
        curFocusElement = newFocusElement;
        curHoverElement = newHoverElement;
    }

    function zoomAction(): void {
        alert('zoom');
    }
    function menuAction(): void {
        alert('menu');
    }

    export function init(): void {
        var nodelist: NodeList = document.getElementsByClassName('unimath');
        Array.prototype.forEach.call(nodelist, (el: HTMLElement, index: number): void => {
            var activeAction: number = 0;
            var zoomEl: HTMLElement = elementWithClass('span', 'zoom fa fa-search-plus on');
            var menuEl: HTMLElement = elementWithClass('span', 'menu fa fa-external-link');

            function currentActionElement(): HTMLElement {
                return activeAction === 0 ? zoomEl : menuEl;
            }

            function changeActiveAction(newAction: number): void {
                if (newAction !== activeAction) {
                    removeClass(currentActionElement(), 'on');
                    activeAction = newAction;
                    addClass(currentActionElement(), 'on');
                }
            }

            function triggerActiveAction(): void {
                updateFocus(null, null);
                if (activeAction === 0) {
                    zoomAction();
                } else {
                    menuAction();
                }
            }

            el.setAttribute('tabindex', '0');

            el.addEventListener('focus', (): void => { updateFocus(el, curHoverElement); }, true);
            el.addEventListener('blur', (): void => { updateFocus(null, curHoverElement); }, true);

            el.addEventListener('mouseenter', (): void => { updateFocus(curFocusElement, el); }, false);
            el.addEventListener('mouseleave', (): void => { updateFocus(curFocusElement, null); }, false);

            el.addEventListener('keydown', (ev: KeyboardEvent): void => {
                // console.log('keydown', ev.keyCode);
                switch (ev.keyCode) {
                    case 37: // left arrow
                    case 39: // right arrow
                        changeActiveAction((activeAction + 1) % 2);
                        break;
                    case 90: // 'z'
                        activeAction = 0;
                        triggerActiveAction();
                        break;
                    case 77: // 'm'
                        activeAction = 1;
                        triggerActiveAction();
                        break;
                    case 13: // return
                        triggerActiveAction();
                        break;
                }
            });

            menuEl.addEventListener('mouseenter', (): void => { changeActiveAction(1); }, true);
            menuEl.addEventListener('mouseleave', (): void => { changeActiveAction(0); }, true);

            zoomEl.addEventListener('click', zoomAction, false);
            menuEl.addEventListener('click', menuAction, false);
            el.addEventListener('click', triggerActiveAction, false);

            var actionsEl: HTMLElement = elementWithClass('div', 'actions');
            actionsEl.appendChild(zoomEl);
            actionsEl.appendChild(menuEl);
            el.appendChild(actionsEl);
        });
    }
}

UniMath2.init();
