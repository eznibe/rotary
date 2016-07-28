// $('[id^=sf_]')

var clubes;
var socios;
var accionSocio = 'ALTA';

// start init //

var logged = Cookies.get('logged') ? JSON.parse(Cookies.get('logged')) : null;

var isAdmin = +logged.nivel > 2;

if (!logged) {
  // no logueado -> ocultar todo
  mostrarSubsection([], ['btn-admin', 'btn-user']);
}
else if (isAdmin) {
  // admin
  getSociosConAccionesPendientes('admin-socios-body');

  getSociosBajaHistorial('historico-socios-body');

  // getAsistenciasPendientes('admin-asistencias-body');

  // getAsistencias('listado-asistencias-body');

  mostrarSubsection([], ['btn-only-user', 'cf_responsable']);

} else {
  // no admin -> hide some buttons
  mostrarSubsection([], ['btn-admin', 'form-clubes-alta', 'listado-clubes']);

  $('.admin_row').hide();
}

setClubes(['sf_club_select', 'sfb_club_select', 'af_club_select', 'filter_clubes_select']);
// setClubes('sfb_club_select');
// setClubes('af_club_select');
// setClubes('filter_clubes_select');

setSocios('sf_socio_select');
setSocios('sfb_socio_select');

setResponsable();

setPerfil();

// end init //

function sendSocioForm(accion) {

  var socio = {orden: $('#sf_socio_select').val(),
               nrori: $('#sf_nrori').val(),
               nrclub: $('#sf_club_select').val(),
               mes: $('#sf_mes').val(),
               categoria: $('#sf_categoria').val(),
               nombre: $('#sf_nombre').val(),
               apellido: $('#sf_apellido').val(),
               clasificacion: $('#sf_clasificacion').val(),
               contacto: $('#sf_email').val(),
               cargo: $('#sf_cargo').val(),
               usuario_id: $('#sf_usuario_id').val()
               };

  if (validSocio(socio, accion)) {
    $.ajax({
        type: 'POST',
        url: '../api/socios_POST.php?accionSocio='+accionSocio,
        data: JSON.stringify(socio), // or JSON.stringify ({name: 'jonas'}),
        success: function(data) {

          // TODO mostrar cartel de OK y borrar form
          mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
          mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);

          if (isAdmin) {
            // aceptar automaticamente cambios
            aceptarSocioAccionPendiente(null, data.id);
          }

          $.notify("Modificación enviada", {className: 'success', globalPosition: 'right bottom'});
        },
        contentType: "application/json",
        dataType: 'json'
    });
  } else {
    alert('Faltan ingresar campos requeridos en el formulario de socios.');
  }
}

function validSocio(socio, accion) {
  if ((accion == 'MODIFICACION' && socio.orden == 0) ||
      socio.nrclub == 0 ||
      (!isAdmin && socio.mes == 0) ||
      socio.nombre == '' ||
      socio.apellido == '') {
    return false;
  }

  return true;
}


function sendSocioBajaForm(accion) {

  var selectedSocio = socios.filter(function(s) {
    return s.orden == $('#sfb_socio_select').val();
  });

  if (!selectedSocio[0]) {
    selectedSocio = [{}];
  }

  var socio = {orden: $('#sfb_socio_select').val(),
               nrori: selectedSocio[0].nrori,
               nrclub: $('#sfb_club_select').val(),
               mes: $('#sfb_mes').val(),
               motivo: $('#sfb_motivo').val(),
               categoria: selectedSocio[0].categoria,
               nombre: selectedSocio[0].nombre,
               apellido: selectedSocio[0].apellido,
               clasificacion: selectedSocio[0].clasificacion,
               contacto: selectedSocio[0].contacto,
               cargo: selectedSocio[0].cargo,
               usuario_id: $('#sfb_usuario_id').val()
               };

  if (validSocioBaja(socio)) {
    $.ajax({
        type: 'POST',
        url: '../api/socios_POST.php?bajaSocio=true',
        data: JSON.stringify(socio), // or JSON.stringify ({name: 'jonas'}),
        success: function(data) {

          // TODO mostrar cartel de OK
          mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
          mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);

          if (isAdmin) {
            // aceptar automaticamente cambios
            aceptarSocioAccionPendiente(null, data.id);
          }

          $.notify("Baja enviada", {className: 'success', globalPosition: 'right bottom'});
        },
        contentType: "application/json",
        dataType: 'json'
    });
  } else {
    alert('Faltan ingresar campos requeridos en el formulario de baja.');
  }
}

function validSocioBaja(socio) {
  if (socio.orden == 0 ||
      socio.nrclub == 0 ||
      socio.mes == 0 ||
      socio.motivo == 0) {
    return false;
  }

  return true;
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
      if (c.nro == +logged.nrclub) {
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

function filterClub() {
  getSociosListado('listado-socios-body', $('#filter_clubes_select').val());
}

function defaultClub(clubElementId) {
  var match;
  var search = $('#'+clubElementId).val() ?  $('#'+clubElementId).val() : +logged.nrclub;
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

function setSocios(elementId, nrclub, mantenerSocioNro) {

  function fillSelect(socios, id) {
    var options = "<option value='0'>Seleccione un socio</option>";
    socios.map(function(s) {
      if (!nrclub || nrclub == s.nrclub || s.orden === mantenerSocioNro) {
        options += "<option value='" + s.orden + "'" + (s.orden === mantenerSocioNro ? " selected" : "") + ">" + (s.apellido ? s.apellido : "") + (s.apellido ? ", " + s.nombre : s.nombre) + "</option>";
      }
    });

    $('#'+id).removeData();
    $('#'+id).html(options);
  }

  if (socios) {
    // ya estan cargados
    fillSelect(socios, elementId);
  } else {
    $.get("../api/socios_GET.php", function(data, status){
      socios = data;
      // fillSelect(socios, elementId);
    });
  }
}

function updateAllSocios() {

  $.get("../api/socios_GET.php", function(data, status){
    socios = data;
  });
}

function getSociosConAccionesPendientes(elementId) {

  function fillTable(socios, id) {
    var trs = "";
    socios.map(function(s) {
      trs += "<tr><td>"+s.accion+"</td><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+numeroAMes(s.mes)+"</td><td>"+(s.categoria?s.categoria:"")+"</td>"+
      "<td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td><td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+s.informante+"</td>"+
      "<td style='width:80px; text-align:center;' onclick='aceptarSocioAccionPendiente(this);'><input type='hidden' id='sa_id' value='"+s.id+"'/><a class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/socios_GET.php?pendientes=true", function(data, status){
    fillTable(data, elementId);
  });
}

function aceptarSocioAccionPendiente(elem, accionId) {
  var accion = {id: accionId ? accionId : $(elem).find('#sa_id').val()};

  $.ajax({
      type: 'POST',
      url: '../api/socios_POST.php?aceptarAccion=true',
      data: JSON.stringify(accion),
      success: function(data) {
        console.log(data);
        getSociosConAccionesPendientes('admin-socios-body');
        getSociosBajaHistorial('historico-socios-body');

        updateAllSocios();
      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function getSociosBajaHistorial(elementId) {

  function fillTable(socios, id) {
    var trs = "";
    socios.map(function(s) {
      trs += "<tr><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+numeroAMes(s.mes)+"</td><td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td>"+
      "<td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+(s.motivo?s.motivo:"")+"</td><td>"+s.informante+"</td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/socios_GET.php?historial=true", function(data, status){
    fillTable(data, elementId);
  });
}

function getSociosListado(elementId, nrclub) {

  function fillTable(socios, id) {
    var trs = "";
    var onclick = ""
    socios.map(function(s) {
      trs += "<tr><td>"+s.club+"</td><td>"+(s.apellido?s.apellido:'')+"</td><td>"+s.nombre+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td>"+
      "<td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.categoria?s.categoria:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+(s.nrori?s.nrori:"")+"</td>"+
      "<td style='width:80px; text-align:center;' onclick='initSociosForms(\"MODIFICACION\", "+s.orden+");'><input type='hidden' id='sa_id' value='"+s.orden+"'/><a href='index.html#socios' class='btn btn-default'><span class='glyphicon glyphicon-edit'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  var filter = nrclub && nrclub != 0 ? '&nrclub='+nrclub : '&nrclub=-1';

  var orderBy = nrclub == '-' ? 'apellido' : 'cargo';

  $.get("../api/socios_GET.php?orderBy="+orderBy+filter, function(data, status){
    fillTable(data, elementId);
  });

  setClubes('filter_clubes_select', null, true);
}

function initSociosForms(accion, socio_orden) {

  clearSociosForms();

  if (isAdmin) {
    $('#sf_mes_row').hide();
    $('#sf_club_row').show();
  }

  var nrclub = null;

  setClubes(['sf_club_select', 'sfb_club_select'], function() {

    // ocultar socios dropdown si es alta
    accionSocio = accion;
    if (accionSocio === 'ALTA') {
      $('#sf_socio_row').hide();
    }
    else if (accionSocio === 'MODIFICACION'){

      var socio;

      if (socio_orden) {
        // load info del socio ya seleccionado por default
        socio = selectedSocio(socio_orden);
      }

      nrclub = socio ? socio.nrclub : null;

      // default socios correctos si hay club seleccionado
      updateSocios(accion, nrclub);

      if (socio) {
        $('#sf_socio_select').val(socio.orden);
      }

      $('#sf_socio_row').show();
      mostrarSubsection(['form-socios-modificacion', 'form-socios'], ['label-socios', 'form-socios-alta', 'form-socios-baja', 'admin-socios', 'historico-socios', 'listado-socios']);
    } else {
      // BAJA
      updateSocios(accion, nrclub);
    }
  });

}


function updateSocios(accion, nrclub) {
  var clubElementId = accion=='MODIFICACION' ? 'sf_club_select' : 'sfb_club_select';
  var socioElementId = accion=='MODIFICACION' ? 'sf_socio_select' : 'sfb_socio_select';

  nrclub = nrclub ? nrclub : $('#'+clubElementId).val();

  var mantenerSocioNro = isAdmin && $('#'+socioElementId).val()!='0' ? $('#'+socioElementId).val() : null;

  setSocios(socioElementId, nrclub, mantenerSocioNro);
}

function selectedSocio(orden) {

  orden = orden ? orden : $('#sf_socio_select').val();

  // socio seleccionado -> cargar campos de datos personales actuales
  var socio = socios.filter(function(s) {
    return s.orden == orden;
  });

  if(socio && socio.length==1) {

    $('#sf_categoria').val(socio[0].categoria);
    $('#sf_nombre').val(socio[0].nombre);
    $('#sf_apellido').val(socio[0].apellido);
    $('#sf_clasificacion').val(socio[0].clasificacion);
    $('#sf_email').val(socio[0].contacto);
    $('#sf_cargo').val(socio[0].cargo);
    $('#sf_nrori').val(socio[0].nrori);
    $('#sf_club_select').val(socio[0].nrclub);
    // $('#sf_club_mod_select').val(socio[0].nrclub);
  }

  return socio[0];
}

function clearSociosForms() {
  $('#sf_mes').val('0');
  $('#sf_categoria').val('ACTIVO');
  $('#sf_nombre').val('');
  $('#sf_apellido').val('');
  $('#sf_clasificacion').val('');
  $('#sf_email').val('');
  $('#sf_nrori').val('');
  $('#sf_club_select').val('0');
  $('#sf_socio_select').val('0');
  $('#sf_cargo').val('SOCIO');

  $('#sfb_club_select').val('0');
  $('#sfb_socio_select').val('0');
  $('#sfb_nrori').val('');
  $('#sfb_mes').val('0');
  $('#sfb_motivo').val('0');
}

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

          $.notify("Modificación enviada", {className: 'success', globalPosition: 'right bottom'});
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

//---- Asistencias ----//

function sendAsistenciasForm() {

  var asistencias = {nrclub: $('#af_club_select').val(),
                     mes: $('#af_mes').val(),
                     periodo: $('#af_periodo').val(),
                     total_reuniones: $('#af_tot_reun').val(),
                     promedio_asist: $('#af_prom_asist').val(),
                     reuniones_completas: $('#af_reun_comp').val(),
                     total_socios: $('#af_total_soc').val(),
                     usuario_id: $('#af_usuario_id').val()
                     };

  if (validAsistencias(asistencias)) {

    $.ajax({
        type: 'POST',
        url: '../api/asistencias_POST.php?formAsistencias=true',
        data: JSON.stringify(asistencias),
        success: function(data) {
          console.log(data);
          // TODO mostrar cartel de OK y borrar form
          mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
          mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);

          $.notify("Asistencias enviada", {className: 'success', globalPosition: 'right bottom'});
        },
        contentType: "application/json",
        dataType: 'json'
    });
  } else {
    alert('Faltan ingresar campos requeridos en el formulario de asistencias.');
  }
}

function validAsistencias(asistencias) {
  if (asistencias.nrclub == 0 ||
      asistencias.mes == 0 ||
      asistencias.periodo == '' ||
      asistencias.total_reuniones == '' ||
      asistencias.promedio_asist == '' ||
      asistencias.reuniones_completas == '' ||
      asistencias.total_socios == '' ) {
    return false;
  }

  return true;
}

function getAsistenciasPendientes(elementId) {

  function fillTable(asistencias, id) {
    var trs = "";
    asistencias.map(function(a) {
      trs += "<tr><td>"+a.club+"</td><td>"+numeroAMes(a.mes)+"</td><td>"+a.periodo+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
      "<td>"+a.reuniones_completas+"</td><td>"+a.total_socios+"</td><td>"+a.informante+"</td>"+
      "<td style='width:80px; text-align:center;'><a class='btn btn-default' onclick='aceptarAsistenciasPendiente(this);'><input type='hidden' id='af_id' value='"+a.id+"'/><span class='glyphicon glyphicon-ok'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/asistencias_GET.php?aceptadas=false", function(data, status){
    fillTable(data, elementId);
  });
}

function getAsistenciasConfirmadas(elementId) {

  function fillTable(asistencias, id) {
    var trs = "";
    asistencias.map(function(a) {
      trs += "<tr><td>"+a.club+"</td><td>"+numeroAMes(a.mes)+"</td><td>"+a.periodo+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
      "<td>"+a.reuniones_completas+"</td><td>"+a.total_socios+"</td><td>"+a.informante+"</td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/asistencias_GET.php?aceptadas=true", function(data, status){
    fillTable(data, elementId);
  });
}

function aceptarAsistenciasPendiente(elem) {
  var accion = {id: $(elem).find('#af_id').val()};

  $.ajax({
      type: 'POST',
      url: '../api/asistencias_POST.php?aceptarAccion=true',
      data: JSON.stringify(accion),
      success: function(data) {
        getAsistenciasPendientes('admin-asistencias-body');
      },
      contentType: "application/json",
      dataType: 'json'
  });
}


function clearAsistenciasForm() {
  $('#af_club_select').val('0');
  $('#af_mes').val('0');
  $('#af_periodo').val('2016');
  $('#af_tot_reun').val('');
  $('#af_prom_asist').val('');
  $('#af_reun_comp').val('');
  $('#af_total_soc').val('');

  setClubes('af_club_select');

  // defaultClub();
}

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

//---- Varios ----//

function mostrarSubsection(aMostrar, aOcultar) {

  aMostrar.map(function(elementId) {
    $('.'+elementId).show();
  });

  aOcultar.map(function(elementId) {
    $('.'+elementId).hide();
  });
}

function clearLogin() {
  Cookies.remove('logged');
}


function setResponsable() {
  if(!logged) {
    return;
  }

  var responsable = +logged.nivel > 1 ? 'Admin' : (logged.nombre + (logged.apellido ? (', '+logged.apellido) : ''));


  $('#sf_responsable').html(responsable);
  $('#sf_usuario_id').val(logged.id);

  $('#sfb_responsable').html(responsable);
  $('#sfb_usuario_id').val(logged.id);

  $('#af_responsable').html(responsable);
  $('#af_usuario_id').val(logged.id);

  $('#cf_responsable').html(responsable);
  $('#cf_usuario_id').val(logged.id);
}

function numeroAMes(nroMes) {
  switch(nroMes) {
    case '01':
        return 'ENERO';
    case '02':
        return 'FEBRERO';
    case '03':
        return 'MARZO';
    case '04':
        return 'ABRIL';
    case '05':
        return 'MAYO';
    case '06':
        return 'JUNIO';
    case '07':
        return 'JULIO';
    case '08':
        return 'AGOSTO';
    case '09':
        return 'SEPTIEMBRE';
    case '10':
        return 'OCTUBRE';
    case '11':
        return 'NOVIEMBRE';
    case '12':
        return 'DICIEMBRE';
    default:
        return '0';
      }
}
