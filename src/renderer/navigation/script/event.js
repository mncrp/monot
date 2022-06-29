let canMove = true;

function initEvent() {
  document.getElementsByTagName('div')[0].innerHTML = document.getElementsByTagName('div')[0].innerHTML;
}

function each() {
  // when close button clicked
  document.querySelectorAll('div > span > p:last-child').forEach((element, index) => {
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
  document.querySelectorAll('div > span').forEach((element, index) => {
    // when tab-bar clicked
    element.addEventListener('click', () => {
      if (!canMove) return;
      node.tabSwitch(index);
    });
    // move tab
    element.addEventListener('dragend', (e) => {
      const pointerX = e.target.getBoundingClientRect().x + e.offsetX + 5;
      const y = document.body.classList.contains('thin') ? 15 : 40;
      const el = document.elementFromPoint(pointerX, y)?.parentElement === document.getElementsByTagName('div')[0] ?
        document.elementFromPoint(pointerX + 30, y).parentElement :
        document.elementFromPoint(pointerX, y).parentElement;
      const els = document.getElementsByTagName('span');
      const target = [].slice.call(els).indexOf(e.target);
      const destination = [].slice.call(els).indexOf(el);
      document.getElementsByTagName('div')[0].insertBefore(e.target, el);
      node.tabMove(target, destination);
      each();
    });
  });
}
each();

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  node.popupMenu();
});
