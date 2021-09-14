function searchBrowser(){
  let word=document.getElementsByTagName('input')[0].value;
  location.href=`https://www.duckduckgo.com/?q=${word}`;
}
document.getElementsByTagName('input')[0].addEventListener('keydown',(e)=>{
  let word=document.getElementsByTagName('input')[0].value;
  if(e.keyCode==13&&word!=null){
    location.href=`https://www.duckduckgo.com/?q=${word}`;
  }
})

window.onbeforeunload=()=>{
  document.body.style.setProperty('-webkit-app-region','none');
}
