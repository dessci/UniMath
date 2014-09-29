var UniMath;
(function (UniMath) {
    'use strict';

    function trimFront(s) {
        return s.replace(/^\s+/, '');
    }

    function trimBack(s) {
        return s.replace(/\s+$/, '');
    }

    function isTokenElement(node) {
        return node.localName.match(/^(mi|mn|mo|mtext|mspace|ms)$/) !== null;
    }

    function normalizeMathMLRecurse(node) {
        if (isTokenElement(node)) {
            var toRemove = [];
            Array.prototype.forEach.call(node.childNodes, function (n, i) {
                if (n.nodeType === 3) {
                    var s = n.textContent.replace(/\s\s+/g, ' ');
                    if (i === 0)
                        s = trimFront(s);
                    if (i === node.childNodes.length - 1)
                        s = trimBack(s);
                    if (s.length === 0) {
                        toRemove.push(n);
                    } else {
                        n.textContent = s;
                    }
                }
            });
            toRemove.forEach(function (n) {
                node.removeChild(n);
            });
        } else {
            Array.prototype.filter.call(node.childNodes, function (n) {
                return n.nodeType === 3;
            }).forEach(function (n) {
                node.removeChild(n);
            });
            Array.prototype.forEach.call(node.childNodes, function (n) {
                normalizeMathMLRecurse(n);
            });
        }
    }

    function normalizeMathML(node) {
        node.normalize();
        normalizeMathMLRecurse(node);
    }

    function prettifyMathML(st) {
        var serializer = new XMLSerializer();
        var parser = new DOMParser();
        var doc = parser.parseFromString(st, 'application/xml');

        function out(node, indent) {
            if (isTokenElement(node)) {
                return indent + serializer.serializeToString(node);
            } else {
                var newindent = indent + '  ';
                var childItems = Array.prototype.map.call(node.childNodes, function (n) {
                    return out(n, newindent);
                });
                var innerText = '\n' + childItems.join('\n') + '\n' + indent;
                var outerNode = node.cloneNode(false);
                outerNode.textContent = '&';
                return indent + serializer.serializeToString(outerNode).replace('&amp;', innerText);
            }
        }

        normalizeMathML(doc.documentElement);

        return out(doc.documentElement, '');
    }
    UniMath.prettifyMathML = prettifyMathML;
})(UniMath || (UniMath = {}));
