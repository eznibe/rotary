$(function () {
   $('.dropdown-menu input').click(function (event) {
       event.stopPropagation();
   });
   $('.dropdown-menu button').click(function (event) {
       event.stopPropagation();
   });
});

function openLogin() {
  if($(window).width() <= 991) {
    $('#login-form').show();
    $("html, body").animate({
        scrollTop: $('#login-form').offset().top - 45
    });
  }
}


function login() {

  var login = {usuario: $('#usuario').val(),
               password: $('#password').val(),
               usuario2: $('#usuario_section').val(),
               password2: $('#password_section').val()
               };

  $.ajax({
      type: 'POST',
      url: 'api/usuarios_POST.php?login=true',
      data: JSON.stringify(login),
      success: function(data) {
        console.log(data);
        // TODO  redirect o mostrar cartel error login
        if(data && data.length > 0 && data[0].usuario) {
          console.log(data[0]);
          Cookies.set('logged', data[0]);
          window.location = 'gestion/index.html';
          $('.login-error').hide();
        } else {
          $('.login-error').show();
        }
      },
      contentType: "application/json",
      dataType: 'json'
  });
}
