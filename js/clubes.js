//---- Clubes ----//

function initClubesForm(nro) {

  if (nro == -1) {
    // modificacion desde usuario con rol de socio
    nro = +logged.nrclub;
  }

  clearClubesForm();

  if (nro) {
    // => modificacion
    var club = clubes.filter(function(c) {
      return c.nro == nro;
    });

    if(club && club.length==1) {

      $('#cf_nombre').val(club[0].nombre);
      $('#cf_direccion').val(club[0].direccion);
      $('#cf_localidad').val(club[0].localidad);
      $('#cf_zona').val(club[0].zona);
      $('#cf_dia').val(club[0].dia);
      $('#cf_horario').val(club[0].horario);
      $('#cf_aniversario').val(club[0].aniversario);
      $('#cf_contacto').val(club[0].contacto);
      $('#cf_asistente').val(club[0].asistente);
      $('#cf_nrori').val(club[0].nrori);
      $('#cf_nro').val(club[0].nro);

      mostrarSubsection(['form-clubes-modificacion', 'form-clubes'], ['form-clubes-alta', 'label-clubes', 'form-socios-modificacion', 'form-socios-baja', 'admin-socios', 'historico-socios', 'listado-clubes']);
    }
  }
}

function sendClubForm() {

  var club = { nrori: $('#cf_nrori').val(),
               nombre: $('#cf_nombre').val(),
               direccion: $('#cf_direccion').val(),
               localidad: $('#cf_localidad').val(),
               zona: $('#cf_zona').val(),
               dia: $('#cf_dia').val(),
               horario: $('#cf_horario').val(),
               aniversario: $('#cf_aniversario').val(),
               contacto: $('#cf_contacto').val(),
               asistente: $('#cf_asistente').val(),
               nro: $('#cf_nro').val(),
               usuario_id: $('#cf_usuario_id').val(),
               isAdmin: isAdmin
               };

  if (validClub(club)) {

    $('.btn-send-form').hide();

    $.ajax({
        type: 'POST',
        url: '../api/clubes_POST.php?clubAccion=true',
        data: JSON.stringify(club),
        success: function(data) {
          console.log(data);
          // TODO mostrar cartel de OK y borrar form
          mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
          mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
          mostrarSubsection(['label-clubes'], ['form-clubes', 'form-clubes-alta', 'form-clubes-modificacion', 'listado-clubes']);

          $('.btn-send-form').show();

          if (data.successful) {
            $.notify("Modificación enviada", {className: 'success', globalPosition: 'right bottom'});

            club.type = 'MODIFICACION club';
            sendMail(club);

            if (!club.nro) {
              // new club
              crearUsuarioClub(data.newnro, club.nrori, club.nombre);
            }
          } else {
            $.notify("Error al enviar, intente de nuevo", {className: 'error', globalPosition: 'right bottom'});
          }
        },
        contentType: "application/json",
        dataType: 'json'
    });
  } else {
    alert('Faltan ingresar campos requeridos en el formulario del club.');
  }
}

function validClub(club) {
  if (club.nombre == '') {
    return false;
  }

  if (!club.nro && !club.nrori) {
    // if new club then should have nrori
    return false;
  }

  return true;
}

function aceptarClubAccionPendiente(elem, accionId) {
  var accion = {id: accionId ? accionId : $(elem).find('#ca_id').val()};

  $.ajax({
      type: 'POST',
      url: '../api/clubes_POST.php?aceptarAccion=true',
      data: JSON.stringify(accion),
      success: function(data) {
        console.log(data);
        getClubesConAccionesPendientes('admin-clubes-body');

        // updateAllClubes();
      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function getClubesConAccionesPendientes(elementId) {

  function fillTable(clubes, id) {
    var trs = "";
    clubes.map(function(c) {
      trs += "<tr><td>MODIFICACION</td><td>"+c.nombre+"</td><td nowrap>"+c.fecha+"</td><td>"+(c.direccion?c.direccion:'')+"</td><td>"+(c.localidad?c.localidad:'')+"</td><td>"+(c.zona?c.zona:'')+"</td>"+
      "<td>"+(c.dia?c.dia:'')+"</td><td>"+(c.horario?c.horario:'')+"</td><td>"+(c.contacto?c.contacto:"")+"</td><td>"+(c.asistente?c.asistente:"")+"</td><td>"+c.informante+"</td>"+
      "<td style='width:80px; text-align:center;' onclick='aceptarClubAccionPendiente(this);'><input type='hidden' id='ca_id' value='"+c.id+"'/><a class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/clubes_GET.php?pendientes=true", function(data, status){
    fillTable(data, elementId);
  });
}

function getClubesListado(zonaSurId, zonaOesteId) {

  function fillTable(clubes, id) {
    var trsSur = "";
    var trsOeste = "";
    clubes.map(function(c) {
      trsSur += "<tr><td>"+c.nombre+"</td><td>"+c.direccion+"</td><td>"+c.zona+"</td><td>"+c.dia+"</td><td>"+c.horario+"</td>"+
      "<td>"+c.aniversario+"</td><td>"+c.contacto+"</td><td>"+c.asistente+"</td><td>"+c.nrori+"</td>"+
      "<td style='width:80px; text-align:center;'><a class='btn btn-default' href='index.html#clubes' onclick='initClubesForm("+c.nro+");'><input type='hidden' id='cf_id' value='"+c.nro+"'/><span class='glyphicon glyphicon-edit'></span></a></td></tr>";
    });

    $('#'+zonaSurId).removeData();
    $('#'+zonaSurId).html(trsSur);
  }

  $.get("../api/clubes_GET.php", function(data, status){
    clubes = data;
    fillTable(data, zonaSurId, zonaOesteId);
  });
}

function clearClubesForm() {
  $('#cf_nombre').val('');
  $('#cf_direccion').val('');
  $('#cf_localidad').val('');
  $('#cf_zona').val('Todas');
  $('#cf_dia').val('Todos');
  $('#cf_horario').val('');
  $('#cf_aniversario').val('');
  $('#cf_contacto').val('');
  $('#cf_asistente').val('');
  $('#cf_nrori').val('');
  $('#cf_nro').val('');
}

function defaultClub(clubElementId) {
  var match;
  var search = $('#'+clubElementId).val() ?  $('#'+clubElementId).val() : (logged ? +logged.nrclub : '');
  clubes.map(function(c) {
    if (c.nro == search) {
      match = c.nro;
    }
  });

  if (match) {
    $('#sf_club_select').val(match);
    $('#sf_club_select').prop('disabled', 'disabled');
    $('#sfb_club_select').val(match);
    $('#sfb_club_select').prop('disabled', 'disabled');
    $('#af_club_select').val(match);
    $('#af_club_select').prop('disabled', 'disabled');
  }
}


function setClubes(elementIds, callback, todos) {

  elementIds = [].concat(elementIds);

  function fillSelect(clubes, id) {
    var match;
    var options = "<option value='0'>Ingrese Club</option>";
    if(todos) {
      options += "<option value='-'>Todos</option>";
    }
    clubes.map(function(c) {
      options += "<option value='" + c.nro + "'>" + c.nombre + "</option>";
      if (logged && c.nro == +logged.nrclub) {
        match = c.nro;
      }
    });

    $('#'+id).removeData();
    $('#'+id).html(options);

    if (match) {
      $('#'+id).val(match);
      $('#'+id).prop('disabled', 'disabled');
    }
  }


  $.get("../api/clubes_GET.php", function(data, status){
    clubes = data;
    elementIds.map(function(elementId) {

      fillSelect(clubes, elementId);

      defaultClub(elementId);

      if (callback) {
        callback();
      }
    });
  });
}
