function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
  window.onscroll = function () {
    var btnHome = document.querySelector('.btn-home');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      btnHome.style.display = 'block';
    } else {
      btnHome.style.display = 'none';
    }
  };