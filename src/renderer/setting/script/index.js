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
function engine(e) {
  node.changeSearchEngine(e.target.value);
}

// experimental
function experimental(e) {
  const value = e.target.value;
  const checked = e.target.checked;

  // Communicate change (main)
  node.changeExperimentalFunctions(value, checked);
}

function setSearchList(array) {
  let searctList = document.getElementsByTagName('select')[1];
  for (let i = 0; i < array.length; i++) {
    const list = document.createElement('option');
    list.value = array[i].id;
    list.textContent = array[i].name;
    searctList.appendChild(list);
  }
}

function addEngine() {
  node.addEngine(document.getElementById('engine-url').value, document.getElementById('engine-name').value);
}
