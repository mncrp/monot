function select(n) {
  let num;
  num = [].slice.call(document.getElementsByTagName('div')).indexOf(document.getElementById('selected'));
  if (num === -1) {
    num = 0;
    if (n === 1) n = 0;
  }
  try {
    if (document.getElementById('selected') === null) {
      document.getElementsByTagName('div')[num + n].id = 'selected';
    } else {
      document.getElementById('selected').id = '';
      document.getElementsByTagName('div')[num + n].id = 'selected';
    }
  } catch (e) {
    node.close();
  }
}
