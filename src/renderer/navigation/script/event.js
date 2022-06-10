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

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  node.popupMenu();
});
