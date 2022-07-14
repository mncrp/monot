function select(n) {
  let num;
  num = [].slice.call(document.getElementsByTagName('div')).indexOf(document.getElementById('selected'));
  if (num === -1) num = 0;
  console.log(num + n);
  try {
    if (document.getElementById('selected') === null) {
      document.getElementsByTagName('div')[num + n].id = 'selected';
    } else {
      document.getElementById('selected').id = '';
      document.getElementsByTagName('div')[num + n].id = 'selected';
    }
  } catch (e) {
    console.error(e);
  }
}
