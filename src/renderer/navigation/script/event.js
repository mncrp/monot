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
}
each();

document.getElementsByTagName('div')[0].addEventListener('click', () => {
  if (!document.getElementById('opened')) {
    try {
      // if #opened doesn't exist
      try {
        document.querySelector('div>span:last-child').setAttribute('id', 'opened');
      } catch (e) {
        return;
      }

    } catch (e) {
      // if tab doesn't exist(error handling)
      if (!document.getElementsByTagName('span')[0]) {
        newtab();
      }
    }
  }
});

function newtab(title) {
  if (document.getElementById('opened')) {
    document.getElementById('opened').removeAttribute('id');
  }
  document.getElementsByTagName('div')[0].innerHTML = `
    ${document.getElementsByTagName('div')[0].innerHTML}
    <span id="opened">
      <a href="javascript:void(0)">${title}</a>
      <a href="javascript:void(0)"></a>
    </span>
  `;
  each();
  node.newtab();
}
