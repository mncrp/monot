const frame = () => document.getElementById('iframeEntity');
const frameTop = () => document.getElementById('iframe');

// eslint-disable-next-line
function prev() {
  frameTop().className = '';
}

// eslint-disable-next-line
function move(page) {
  if (frameTop().className !== 'displaying') {
    frameTop().className = 'displaying';
    frame().src = `./${page}.html`;
  }
}
