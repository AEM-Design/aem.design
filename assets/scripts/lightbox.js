function wrap(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}

document.addEventListener("DOMContentLoaded", function() {
  var elements = document.querySelectorAll(".page__content p img, .page__content table img");
  elements.forEach(element => {
      var url = element.getAttribute('src');
      var alt = element.getAttribute('alt');
      if(url) {
          var a = document.createElement('a');
          a.setAttribute("href",url);
          a.setAttribute("data-lightbox",'');
          a.setAttribute("title",alt);
          wrap(element, a);
      }
  });

});
