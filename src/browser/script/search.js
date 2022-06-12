let url;
function searchBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  if (word) {
    location.href = url + word;
  }
}

document.getElementById('searchButton').addEventListener('click', () => {
  searchBrowser();
});

document.addEventListener('keydown', (e) => {
  if (e.target === document.getElementById('search')) {
    const word = document.getElementsByTagName('input')[0].value;
    // press enter
    if (!e.isComposing && e.key === 'Enter' && word != null) {
      // <span#opened>
      searchBrowser();
    }
  }
});
