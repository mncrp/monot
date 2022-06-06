document.getElementsByTagName('select')[0].addEventListener('change', () => {
  node.changeSearchEngine(document.getElementsByTagName('select')[0].value);
});

function changeExperimental(arg) {
  node.changeExperimentalFunctions(arg.target.value, arg.target.checked);
}

document.getElementsByTagName('input')[0].addEventListener('change', changeExperimental);
document.getElementsByTagName('input')[1].addEventListener('change', (arg) => {
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
document.getElementsByTagName('input')[2].addEventListener('change', changeExperimental);

function setSearchList(array){
  let searctList = document.getElementsByTagName('select')[0];
  for (var i = 0; i < array.length; i++) {
    let list = document.createElement("option");
    list.value = array[i].id;
    list.textContent = array[i].name;
    searctList.appendChild(list);
}
}
