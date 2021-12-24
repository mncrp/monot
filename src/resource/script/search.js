const url = node.getEngineURL();

function searchBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  if (word) {
    location.href = url + word;
  }
}

document.getElementById('searchButton').addEventListener('click', () => {
  searchBrowser();
});

document.getElementById('search').addEventListener('keydown', (e) => {
  if (!e.isComposing && e.code === 'Enter') {
    searchBrowser();
  }
});
