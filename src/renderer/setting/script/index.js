// appearance
function ui(which) {
  if (document.getElementsByClassName('selected')[0] === undefined) {
    document.getElementById(which).classList.add('selected');
  } else {
    document.getElementsByClassName('selected')[0].classList.remove('selected');
    node.changeUI(which);
    document.getElementById(which).classList.add('selected');
  }
}

// engine
document.getElementsByTagName('select')[0].addEventListener('change', () => {
  node.changeSearchEngine(document.getElementsByTagName('select')[0].value);
});

// experimental
function changeExperimental(e) {
  node.changeExperimentalFunctions(e.target.value, e.target.checked);
}
const experimentalElement = document.getElementById('experiments');
experimentalElement.getElementsByTagName('input')[0].addEventListener('change', changeExperimental);
experimentalElement.getElementsByTagName('input')[1].addEventListener('change', changeExperimental);
experimentalElement.getElementsByTagName('input')[2].addEventListener('change', (arg) => {
  changeExperimental(arg);
  if (arg.target.checked) {
    document.getElementById('changedfont').removeAttribute('disabled');
  } else {
    document.getElementById('changedfont').setAttribute('disabled', '');
  }
});
document.getElementById('changedfont').addEventListener('input', () => {
  node.changeExperimentalFunctions('changedfont', document.getElementById('changedfont').value);
});
experimentalElement.getElementsByTagName('input')[3].addEventListener('change', changeExperimental);

