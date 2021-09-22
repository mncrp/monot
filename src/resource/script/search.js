var url=node.getEngineURL()

function searchBrowser(){
  let word=document.getElementsByTagName('input')[0].value;
  location.href=url+word;
}
document.getElementsByTagName('input')[0].addEventListener('keydown',(e)=>{
  let word=document.getElementsByTagName('input')[0].value;
  if(e.keyCode==13&&word!=null){
    location.href=url+word;
  }
})

function setting(){
  if(document.querySelector('body>div:nth-child(2)').id==''){
    document.querySelector('body>div:nth-child(2)').setAttribute('id','opened');
  }else if(document.querySelector('body>div:nth-child(2)').id=='opened'){
    document.querySelector('body>div:nth-child(2)').removeAttribute('id');
  }
}
