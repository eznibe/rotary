//---- Perfil ----//

function sendPerfilForm() {

  var perfil = {id: logged ? logged.id : $('#pf_id').val(), // usuario_id
                hash: $('#pf_hash').val(),
                orden: $('#pf_orden').val(),
                usuario: $('#pf_usuario').val(),
                password: $('#pf_password').val(),
                repeatPassword: $('#pf_repeat_password').val(),
                responsable: $('#pf_responsable').val(),
                mail: $('#pf_mail').val()
               };

  if(validPerfil(perfil)) {
    $.ajax({
        type: 'POST',
        url: '../api/usuarios_POST.php?formPerfil=true',
        data: JSON.stringify(perfil),
        success: function(data) {
          // console.log(data);
          // TODO mostrar cartel de OK y borrar form
          mostrarSubsection(['label-socios', 'section-socios', 'btn-user', 'btn-only-user', 'mbr-navbar__column li'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios', 'btn-admin']);
          mostrarSubsection(['label-clubes', 'section-clubes'], ['form-clubes', 'admin-clubes', 'listado-clubes']);
          mostrarSubsection(['label-asistencias', 'section-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
          mostrarSubsection(['label-perfil'], ['form-perfil']);

          if (logged) {
            logged.usuario = perfil.usuario;
            logged.responsable = perfil.responsable;
            logged.mail = perfil.mail;
            Cookies.set('logged', logged);
          } else {
            // set cookies and default values after reset passw complete
            $.get("../api/socios_GET.php?byUsuario=true&usuario_id="+perfil.id, function(data, status){
              logged = {nivel: data.nivel,
                usuario: data.usuario,
                id: data.usuario_id,
                nombre: data.nombre,
                apellido: data.apellido,
                responsable: data.responsable,
                mail: data.mail,
                club: data.club,
                nrclub: data.nrclub};
              Cookies.set('logged', logged);
              setClubes(['sf_club_select', 'sfb_club_select', 'af_club_select', 'filter_clubes_select']);
              setResponsable();
              $('.admin_row').hide();

              window.location = 'index.html';
            });
          }

          $.notify("Modificación enviada", {className: 'success', globalPosition: 'right bottom'});
        },
        contentType: "application/json",
        dataType: 'json'
    });
  } else {
    alert('Formulario de edición de perfil inválido.');
  }
}

function validPerfil(perfil) {
  if (perfil.usuario == '' ||
      (perfil.password != '' && perfil.password != perfil.repeatPassword)) {
    return false;
  }

  return true;
}


function setPerfil() {
  $('#pf_usuario').val(logged ? logged.usuario : '');
  $('#pf_usuario_lbl').html(logged ? logged.usuario : '');
  $('#pf_responsable').val(logged ? logged.responsable : '');
  $('#pf_mail').val(logged ? logged.mail : '');
}

function clearPerfilForm() {
  $('#pf_usuario').val(logged ? logged.usuario : '');
  $('#pf_usuario_lbl').html(logged ? logged.usuario : '');
  $('#pf_responsable').val(logged ? logged.responsable : '');
  $('#pf_mail').val(logged ? logged.mail : '');
  $('#pf_password').val('');
  $('#pf_repeat_password').val('');
}


function crearUsuario(nrorden, nrclub, nombre, apellido, club) {

  var usuario = nombre.toLowerCase().trim()+'.'+apellido.toLowerCase().trim();
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

function crearUsuarioClub(nrclub, nroriclub, club) {

  var usuario = nroriclub;
  var password = club.toLowerCase();

  var user = {usuario: usuario,
              password: password,
              nrclub: nrclub
            };


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


function setUsuarioHash(hash) {

  $.get("../api/usuarios_GET.php?hash=" + hash, function(data, status){
    if (data.successful) {
      $('#pf_usuario').val(data.result.usuario);
      $('#pf_responsable').val(data.result.responsable);
      $('#pf_mail').val(data.result.mail);
      $('#pf_id').val(data.result.id);
      $('#pf_hash').val(data.result.hash);
      $('#pf_orden').val(data.result.orden);

      // mostrar solo la section de perfil
      mostrarSubsection(['form-perfil'], ['label-perfil', 'section-socios', 'section-clubes', 'section-asistencias', 'mbr-navbar__column li']);

      // location.hash = "#perfil";
      $("html, body").animate({ scrollTop: $('#perfil').offset().top - 65 }, 1000);
    } else {
      mostrarSubsection([], ['form-perfil', 'label-perfil', 'label-socios', 'label-clubes', 'label-asistencias', 'btn-admin', 'btn-user', 'btn-only-user', 'mbr-navbar__column li']);
    }
  });
}

function alertarFaltaEmail(logged) {

  $.get("../api/usuarios_GET.php?id="+logged.id, function(data, status){
    if (data.changePassword) {
      $('#messageText').html('Actualice la contraseña por default que le fue asignada a su usuario.');
      $('#messageModal').modal('show');

      mostrarSubsection(['form-perfil'], ['label-perfil']);
      $("html, body").animate({ scrollTop: $('#perfil').offset().top - 65 }, 1000);
    }
    else if (!data.mail && logged.nivel === "2") {
      // alert('Por favor complete su email así podemos enviarle constancia de sus modificaciones en el sistema de gestión. Para esto actualice en su información de perfil el campo "Mail de contacto".');
      $('#messageText').html('Por favor complete su email así podemos enviarle constancia de sus modificaciones en el sistema de gestión. Para esto actualice en su información de perfil el campo "Mail de contacto".');
      $('#messageModal').modal('show');

      mostrarSubsection(['form-perfil'], ['label-perfil']);
      $("html, body").animate({ scrollTop: $('#perfil').offset().top - 65 }, 1000);
    }
    else if (logged.nivel === "1") {
      $('#messageText').html('Este usuario va a ser dado de baja próximamente, debe utitlizar el usuario del club.');
      $('#messageModal').modal('show');
    }
  });
}
