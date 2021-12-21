const url = node.getEngineURL();

function searchBrowser() {
  const word = document.getElementsByTagName('input')[0].value;
  location.href = url + word;
}
document.getElementsByTagName('input')[0].addEventListener('keydown', (e) => {
  const word = document.getElementsByTagName('input')[0].value;
  if (e.keyCode === 13 && word != null) {
    location.href = url + word;
  }
});
