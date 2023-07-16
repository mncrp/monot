let url;
function searchBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  if (word) {
    location.href = url.replace('%s', word);
  }
}

function searchEnter(e) {
  if (!e.isComposing && e.key === 'Enter') {
    searchBrowser();
  }
}
