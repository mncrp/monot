//get current tab number
function getCurrent(){
  //source: https://lab.syncer.jp/Web/JavaScript/Snippet/54/
  let el=document.getElementsByTagName('span');
  el=[].slice.call(el);
  return el.indexOf(document.getElementById('opened'));
}

function moveBrowser(){
  let word=document.getElementsByTagName('input')[0].value;
  document.activeElement.blur();
  node.moveBrowser(word,getCurrent());
}
document.getElementsByTagName('input')[0].addEventListener('keydown',(e)=>{
  let word=document.getElementsByTagName('input')[0].value;
  //press enter
  if(e.keyCode==13&&word!=null){
    //<span#opened>
    document.activeElement.blur();
    node.moveBrowser(word,getCurrent());
  }
})
