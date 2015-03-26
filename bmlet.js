(function () {

var e, k;

document.querySelector('html').style.marginLeft = "300px";

e = document.createElement('style');
e.textContent="#math-ui { position: fixed; top: 0; bottom: 0; left: 0; width: 286px; background-color: #fff; border-right: 4px solid #888; padding: 5px; overflow-y: scroll; } #math-ui p { font: 14px/16px sans serif; }";
document.querySelector('head').appendChild(e);

e = document.createElement('div');
e.setAttribute('id', 'math-ui');

function para(txt) {
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(txt));
  return p;
}

e.appendChild(para('This is the sidebar'));
e.appendChild(para('Item properties can be put here'));

for (k=0; k < 10; k++) {
  e.appendChild(para('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'));
}

document.body.appendChild(e);

})();
