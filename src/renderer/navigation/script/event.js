let canMove = true;

function initEvent() {
  document.getElementsByTagName('div')[0].innerHTML = document.getElementsByTagName('div')[0].innerHTML;
}

function each() {
  // when close button clicked
  document.querySelectorAll('div>span>a:last-child').forEach((element, index) => {
    element.addEventListener('click', () => {
      canMove = false;
      element.parentNode.remove();
      node.removeTab(index).then(() => {
        canMove = true;
      });
      initEvent();
      each();
    });
  });
  document.querySelectorAll('div>span').forEach((element, index) => {
    // when tab-bar clicked
    element.addEventListener('click', () => {
      if (!canMove) return;
      node.tabMove(index);
    });
  });
}
each();

// eslint-disable-next-line no-unused-vars
function newtab(title) {
  document.getElementsByTagName('div')[0].innerHTML = `
    ${document.getElementsByTagName('div')[0].innerHTML}
    <span>
      <a href="#">${title}</a>
      <a href="#"></a>
    </span>
  `;
  each();
  node.newtab();
}

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  node.popupMenu();
});
