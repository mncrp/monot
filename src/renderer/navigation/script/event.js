/* globals getCurrent */
function each() {
  // when close button clicked
  document.querySelectorAll('div>span>a:last-child').forEach((i) => {
    i.addEventListener('click', () => {
      i.parentNode.remove();
      node.removeTab(getCurrent());
    });
  });
  document.querySelectorAll('div>span').forEach((i) => {
    // when tab-bar clicked
    i.addEventListener('click', () => {
      // remove #opened's id(Opened)
      if (document.getElementById('opened')) {
        document.getElementById('opened').removeAttribute('id');
      }
      // clicked tab
      i.setAttribute('id', 'opened');
      node.tabMove(getCurrent());
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
