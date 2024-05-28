if (window.translated !== undefined) {
  window.translated();
}

!async function() {
  [...(
    (
      document.head.innerHTML +
      document.body.innerHTML
    )
      .matchAll(/\$\{[0-9a-zA-Z_].+\}/g)
  )].forEach(async(el) => {
    const res = await node.translate(el[0].substring(2, el[0].length - 1));
    document.body.innerHTML = document.body.innerHTML.replace(el, res);
    document.head.innerHTML = document.head.innerHTML.replace(el, res);
  });

  [...(
    (
      document.head.innerHTML +
      document.body.innerHTML
    )
      .matchAll(/\$\[[0-9a-zA-Z_].+\]/g)
  )].forEach(async(el) => {
    const res = await node.translateAbout(el[0].substring(2, el[0].length - 1));
    document.body.innerHTML = document.body.innerHTML.replace(el, res);
    document.head.innerHTML = document.head.innerHTML.replace(el, res);
  });
}();
