setInterval(() => {
  const date = new Date();
  document.getElementById('clock').innerText = `${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:${
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}`;
}, 250);
