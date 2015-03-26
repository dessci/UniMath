(function () {

var e, k;

e = document.querySelector('body');
e.style.marginRight = "300px";

e = document.createElement('div');
e.style.position = "fixed";
e.style.top = "0";
e.style.bottom = "0";
e.style.right = "0";
e.style.width = "286px";
e.style.backgroundColor = "#fff";
e.style.borderLeft = "4px solid #888";
e.style.padding = "5px";

function para(txt) {
  var p = document.createElement('p');
  p.style.font = "14px/16px sans-serif";
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
