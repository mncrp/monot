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

document.getElementsById('search').addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    searchBrowser();
  }
});
