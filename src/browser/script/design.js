window.onload = () => {
  if (getComputedStyle(document.documentElement).getPropertyValue('--wallpaper') === ' url("file://")') {
    document.getElementsByTagName('h1')[0].id = '';
  } else {
    document.getElementsByTagName('h1')[0].id = 'shadow';
  }
};
