window.onload = () => {
  console.log('wallpaper', getComputedStyle(document.documentElement).getPropertyValue('--wallpaper'));
  if (getComputedStyle(document.documentElement).getPropertyValue('--wallpaper') === ' url("file://")') {
    document.getElementsByTagName('h1')[0].id = '';
    document.getElementById('top').classList.remove('wallpaper');
  } else {
    document.getElementsByTagName('h1')[0].id = 'shadow';
    document.getElementById('top').classList.add('wallpaper');
  }
};
