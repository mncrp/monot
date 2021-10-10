/*document.getElementById('custom').addEventListener('click',()=>{
  node.filePopUp();
})
document.getElementById('default').addEventListener('click',()=>{
  node.writeBackgroundDefault();
})*/
document.getElementsByTagName('select')[0].addEventListener('change',()=>{
  node.changeSearchEngine(document.getElementsByTagName('select')[0].value)
})

function changeExperimental(arg){
  node.changeExperimentalFunctions(arg.target.value,arg.target.checked);
}

document.getElementsByTagName('input')[0].addEventListener('change',changeExperimental);
