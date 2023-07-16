function moveBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();

  node.moveBrowser(word);
  node.suggestClose();
}

function textKey(e) {
  const word = e.target.value;

  if (!e.isComposing && word !== '' && e.key.length === 1)
    node.suggest(word);
  else if (!e.isComposing && e.key.length === 1)
    node.suggestClose();

  if (!e.isComposing && e.key === 'ArrowUp') {
    node.suggestUp();
  } else if (!e.isComposing && e.key === 'ArrowDown') {
    node.suggestDown();
  } else if (!e.isComposing && e.key === 'Enter') {
    node.suggestSelect();
  }

  if (!e.isComposing && e.key === 'Enter' && word != null) {
    // <span#opened>
    moveBrowser();
  }

  if (word.length === 0) node.suggestClose();
}
