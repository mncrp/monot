function moveBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();

  node.moveBrowser(word);
}

const textKey = (e) => {
  const word = e.target.value;
  console.log(word === '');
  if (word !== '')
    node.suggest(word);
  else
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
};

