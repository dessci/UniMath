module UniMath {
    'use strict';

    function trimFront(s: string): string {
        return s.replace(/^\s+/, '');
    }

    function trimBack(s: string): string {
        return s.replace(/\s+$/, '');
    }

    function isTokenElement(node: Node): boolean {
        return node.localName.match(/^(mi|mn|mo|mtext|mspace|ms)$/) !== null;
    }

    function normalizeMathMLRecurse(node: Node): void {
        // http://www.w3.org/TR/REC-MathML/chap3_2.html
        // http://www.w3.org/TR/MathML2/chapter2.html#fund.collapse
        if (isTokenElement(node)) {
            // may contain <malignmark/> child elements
            var toRemove: Node[] = [];
            Array.prototype.forEach.call(node.childNodes, (n: Node, i: number): void => {
                if (n.nodeType === 3) {
                    var s: string = n.textContent.replace(/\s\s+/g, ' ');
                    if (i === 0) s = trimFront(s);
                    if (i === node.childNodes.length - 1) s = trimBack(s);
                    if (s.length === 0) {
                        toRemove.push(n);
                    } else {
                        n.textContent = s;
                    }
                }
            });
            toRemove.forEach((n: Node): void => {
                node.removeChild(n);
            });
        } else {
            Array.prototype.filter.call(node.childNodes, (n: Node): boolean => {
                return n.nodeType === 3;
            }).forEach((n: Node): void => {
                    node.removeChild(n);
                });
            Array.prototype.forEach.call(node.childNodes, (n: Node): void => {
                normalizeMathMLRecurse(n);
            });
        }
    }

    function normalizeMathML(node: Node): void {
        // http://www.w3.org/TR/MathML2/chapter2.html#fund.collapse
        node.normalize();
        normalizeMathMLRecurse(node);
    }

    export function prettifyMathML(st: string): string {
        var serializer: XMLSerializer = new XMLSerializer();
        var parser: DOMParser = new DOMParser();
        var doc: Document = parser.parseFromString(st, 'application/xml');

        function out(node: Node, indent: string): string {
            if (isTokenElement(node)) {
                return indent + serializer.serializeToString(node);
            } else {
                var newindent: string = indent + '  ';
                var childItems: string[] = Array.prototype.map.call(node.childNodes, (n: Node): string => {
                    return out(n, newindent);
                });
                var innerText: string = '\n' + childItems.join('\n') + '\n' + indent;
                var outerNode: Node = node.cloneNode(false);
                outerNode.textContent = '&';
                return indent + serializer.serializeToString(outerNode).replace('&amp;', innerText);
            }
        }

        normalizeMathML(doc.documentElement);

        return out(doc.documentElement, '');
    }

} 