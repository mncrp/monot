let engine;

// get current tab number
function getCurrent() {
  // source: https://lab.syncer.jp/Web/JavaScript/Snippet/54/
  let el = document.getElementsByTagName('span');
  el = [].slice.call(el);
  return el.indexOf(document.getElementById('opened'));
}

function moveBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();
  try {
    try {
      const url = new URL(word);
      node.moveBrowser(url.href, getCurrent());
    } catch (e) {
      if (word.match(/\S+\.\S+/)) {
        node.moveBrowser(`http://${word}`, getCurrent());
      } else {
        node.moveBrowser(engine + word, getCurrent());
      }
    }
  } catch (e) {
    node.moveBrowser(engine + word, getCurrent());
  }
}

document.getElementsByTagName('input')[0]
  .addEventListener('keyup', (e) => {
    const word = document.getElementsByTagName('input')[0].value;
    // press enter
    if (e.keyCode === 13 && word != null) {
      // <span#opened>
      moveBrowser();
    }
  });
