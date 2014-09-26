module UniMath {
    export interface Backend {
        equationZoom(parent: HTMLElement, eqnEl: HTMLElement, factor: number): boolean;
    }
} 