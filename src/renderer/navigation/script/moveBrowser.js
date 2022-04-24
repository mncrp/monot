let engine;

function moveBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();

  let url;
  try {
    url = new URL(word);
  } catch (e) {
    if (word.match(/\S+\.\S+/)) {
      url = new URL(`http://${word}`);
    } else {
      url = new URL(engine + word);
    }
  }
  node.moveBrowser(url.href);
}

document.getElementsByTagName('input')[0].addEventListener('keydown', (e) => {
  const word = document.getElementsByTagName('input')[0].value;
  // press enter
  if (!e.isComposing && e.key === 'Enter' && word != null) {
    // <span#opened>
    moveBrowser();
  }
});
