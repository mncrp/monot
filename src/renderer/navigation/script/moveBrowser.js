function moveBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();

  node.moveBrowser(word);
}

function textKey(e) {
  const word = e.target.value;

  if (word !== '' && e.key.length === 1)
    node.suggest(word);
  else if (e.key.length === 1)
    node.suggestClose();

  if (!e.isComposing && e.key === 'ArrowUp') {
    node.suggestUp();
  } else if (!e.isComposing && e.key === 'ArrowDown') {
    node.suggestDown();
  } else if (!e.isComposing && e.key === 'Enter') {
    node.suggestSelect();
  }

  if (!e.isComposing && e.key === 'Enter' && word != null) {
    console.log(e);
    // <span#opened>
    moveBrowser();
  }
}
