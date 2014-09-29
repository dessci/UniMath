module UniMath {
    'use strict';

    export interface Backend {
        equationZoom(parent: HTMLElement, eqnEl: HTMLElement, factor: number): boolean;
        getSource(eqnEl: HTMLElement): string;
    }
} 