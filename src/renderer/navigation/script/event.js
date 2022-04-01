function each() {
  // when close button clicked
  document.querySelectorAll('div>span>a:last-child').forEach((element, index) => {
    element.addEventListener('click', () => {
      element.parentNode.remove();
      node.removeTab(index);
    });
  });
  document.querySelectorAll('div>span').forEach((element, index) => {
    // when tab-bar clicked
    element.addEventListener('click', () => {
      // remove #opened's id(Opened)
      const openedTab = document.getElementById('opened');
      if (openedTab) {
        openedTab.removeAttribute('id');
      }
      // clicked tab
      element.setAttribute('id', 'opened');
      node.tabMove(index);
    });
  });

  if (document.getElementById('opened') === null) {
    newtab('Home');
  }
}
each();

document.getElementsByTagName('div')[0].addEventListener('click', () => {
  if (document.getElementById('opened') === null) {
    if (document.querySelector('div > span:last-child') !== null) {
      document.querySelector('div>span:last-child').setAttribute('id', 'opened');
    }
    // if tab doesn't exist(error handling)
    if (document.getElementsByTagName('span')[0] === null) {
      newtab();
    }
  }
});

function newtab(title) {
  if (document.getElementById('opened') !== null) {
    document.getElementById('opened').removeAttribute('id');
  }
  document.getElementsByTagName('div')[0].innerHTML = `
    ${document.getElementsByTagName('div')[0].innerHTML}
    <span id="opened">
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
