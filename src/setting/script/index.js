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
document.getElementsByTagName('input')[1].addEventListener('change',(arg)=>{
  changeExperimental(arg);
  if(arg.target.checked){
    document.getElementById('changedfont').removeAttribute('disabled');
  }else{
    document.getElementById('changedfont').setAttribute('disabled','')
  }
})
document.getElementById('changedfont').addEventListener('input',()=>{
  node.changeExperimentalFunctions('changedfont',document.getElementById('changedfont').value);
})
