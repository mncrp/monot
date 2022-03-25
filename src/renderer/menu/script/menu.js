const frame = document.getElementById('iframeEntity');
const frameTop = document.getElementById('iframe');

function prev() {
  frameTop.className = '';
}

function move(page) {
  if (frameTop.className !== 'displaying') {
    frameTop.className = 'displaying';
    frame.src = `./${page}.html`;
  }
}
