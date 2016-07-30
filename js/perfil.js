//---- Perfil ----//

function sendPerfilForm() {

  var perfil = {id: logged.id,
                usuario: $('#pf_usuario').val(),
                password: $('#pf_password').val()
               };

  $.ajax({
      type: 'POST',
      url: '../api/usuarios_POST.php?formPerfil=true',
      data: JSON.stringify(perfil),
      success: function(data) {
        // console.log(data);
        // TODO mostrar cartel de OK y borrar form
        mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
        mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
        mostrarSubsection(['label-perfil'], ['form-perfil']);

        logged.usuario = perfil.usuario;

        $.notify("Modificación enviada", {className: 'success', globalPosition: 'right bottom'});
      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function setPerfil() {
  $('#pf_usuario').val(logged ? logged.usuario : '');
}

function clearPerfilForm() {
  $('#pf_usuario').val(logged ? logged.usuario : '');
  $('#pf_password').val('');
  $('#pf_repeat_password').val('');
}


function crearUsuario(nrorden, nrclub, nombre, apellido, club) {

  var usuario = nombre.toLowerCase()+'.'+apellido.toLowerCase();
  var password = club.toLowerCase();

  var user = {usuario: usuario,
              password: password,
              nrori: nrorden,
              nrclub: nrclub
            };

  if (confirm('Confirma creación de usuario para el socio: ' + nombre + ' ' + apellido + ' ?')) {

    $.ajax({
        type: 'POST',
        url: '../api/usuarios_POST.php?nuevoUsuario=true',
        data: JSON.stringify(user),
        success: function(data) {

          prompt('Copie y guarde estos datos del usuario creado:', 'Usuario: '+ usuario +' Contraseña: ' + password);
        },
        contentType: "application/json",
        dataType: 'json'
    });
  }
}
