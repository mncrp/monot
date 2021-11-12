/**
 *
 */
function moveBrowser() {
  let word = document.getElementsByTagName("input")[0].value;
  node.moveBrowser(word);
}
/**
 *
 */
function maxMin() {
  node.maxMin();
}
document.getElementsByTagName("input")[0].addEventListener("keydown", (e) => {
  let word = document.getElementsByTagName("input")[0].value;
  if (e.keyCode == 13 && word != null) {
    node.moveBrowser(word);
  }
});
/*
function options(){
  node.optionsWindow();
}
*/
