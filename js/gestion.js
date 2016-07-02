// $('[id^=sf_]')

var clubes;
var socios;
var accionSocio = 'ALTA';

// start init //

var logged = Cookies.get('logged') ? JSON.parse(Cookies.get('logged')) : null;

if (!logged) {
  // no logueado -> ocultar todo
  mostrarSubsection([], ['btn-admin', 'btn-user']);
}
else if (+logged.nivel > 2) {
  // admin
  getSociosConAccionesPendientes('admin-socios-body');

  getSociosBajaHistorial('historico-socios-body');

  // getAsistenciasPendientes('admin-asistencias-body');

  // getAsistencias('listado-asistencias-body');

} else {
  // no admin -> hide some buttons
  mostrarSubsection([], ['btn-admin', 'menu-clubes', 'clubes']);

  // $('#sf_cargo_row').hide();
}

setClubes('sf_club_select');
setClubes('sfb_club_select');
setClubes('af_club_select');

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

  $.ajax({
      type: 'POST',
      url: '../api/socios_POST.php?accionSocio='+accionSocio,
      data: JSON.stringify(socio), // or JSON.stringify ({name: 'jonas'}),
      success: function(data) {
        console.log(data);
        // TODO mostrar cartel de OK y borrar form
        mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
        mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
      },
      contentType: "application/json",
      dataType: 'json'
  });
}


function sendSocioBajaForm(accion) {

  var selectedSocio = socios.filter(function(s) {
    return s.orden == $('#sfb_socio_select').val();
  });

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

  $.ajax({
      type: 'POST',
      url: '../api/socios_POST.php?bajaSocio=true',
      data: JSON.stringify(socio), // or JSON.stringify ({name: 'jonas'}),
      success: function(data) {
        console.log(data);
        // TODO mostrar cartel de OK
        mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
        mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
      },
      contentType: "application/json",
      dataType: 'json'
  });
}


function setClubes(elementId) {

  function fillSelect(clubes, id) {
    var match;
    var options = "<option value='0'>Ingrese Club</option>";
    clubes.map(function(c) {
      options += "<option value='" + c.nrori + "'>" + c.nombre + "</option>";
      if (c.nrori == +logged.nrclub) {
        match = c.nrori;
      }
    });

    $('#'+id).removeData();
    $('#'+id).html(options);

    if (match) {
      $('#'+id).val(match);
      $('#'+id).prop('disabled', 'disabled');
    }
  }

  if (clubes) {
    // ya estan cargados
    fillSelect(clubes, elementId);
  } else {
    $.get("../api/clubes_GET.php", function(data, status){
      clubes = data;
      fillSelect(clubes, elementId);
    });
  }
}

function defaultClub() {
  var match;
  clubes.map(function(c) {
    if (c.nrori == +logged.nrclub) {
      match = c.nrori;
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

function setSocios(elementId, nrclub) {

  function fillSelect(socios, id) {
    var options = "<option value='0'>Seleccione un socio</option>";
    socios.map(function(s) {
      if (!nrclub || nrclub == s.nrclub) {
        options += "<option value='" + s.orden + "'>" + (s.apellido ? s.apellido : "") + (s.apellido ? ", " + s.nombre : s.nombre) + "</option>";
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
      trs += "<tr><td>"+s.accion+"</td><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+(s.categoria?s.categoria:"")+"</td>"+
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

function aceptarSocioAccionPendiente(elem) {
  var accion = {id: $(elem).find('#sa_id').val()};

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
      trs += "<tr><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td>"+
      "<td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+(s.motivo?s.motivo:"")+"</td><td>"+s.informante+"</td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/socios_GET.php?historial=true", function(data, status){
    fillTable(data, elementId);
  });
}

function initSociosForms(accion) {

  clearSociosForms();

  defaultClub();

  // ocultar socios dropdown si es alta
  accionSocio = accion;
  if (accionSocio === 'ALTA') {
    $('#sf_socio_row').hide();
  }
  else {
    $('#sf_socio_row').show();
  }

  // default socios correctos si hay club seleccionado
  updateSocios(accion);
}

function updateSocios(accion) {
  var clubElementId = accion=='MODIFICACION' ? 'sf_club_select' : 'sfb_club_select';
  var socioElementId = accion=='MODIFICACION' ? 'sf_socio_select' : 'sfb_socio_select';

  setSocios(socioElementId, $('#'+clubElementId).val());
}

function selectedSocio() {
  // socio seleccionado -> cargar campos de datos personales actuales
  var socio = socios.filter(function(s) {
    return s.orden == $('#sf_socio_select').val();
  });

  if(socio && socio.length==1) {

    $('#sf_categoria').val(socio[0].categoria);
    $('#sf_nombre').val(socio[0].nombre);
    $('#sf_apellido').val(socio[0].apellido);
    $('#sf_clasificacion').val(socio[0].clasificacion);
    $('#sf_email').val(socio[0].contacto);
    $('#sf_cargo').val(socio[0].cargo);
  }
}

function clearSociosForms() {
  $('#sf_mes').val('0');
  $('#sf_categoria').val('ACTIVO');
  $('#sf_nombre').val('');
  $('#sf_apellido').val('');
  $('#sf_clasificacion').val('');
  $('#sf_email').val('');
  $('#sf_club_select').val('0');
  $('#sf_socio_select').val('0');
  $('#sf_cargo').val('SOCIO');

  $('#sfb_club_select').val('0');
  $('#sfb_socio_select').val('0');
  $('#sfb_nrori').val('');
  $('#sfb_mes').val('0');
  $('#sfb_motivo').val('');
}

//---- Clubes ----//

function initClubesForm(nrori) {

  clearClubesForm();

  if (nrori) {
    // => modificacion
    var club = clubes.filter(function(c) {
      return c.nrori == nrori;
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

      mostrarSubsection(['form-clubes-modificacion', 'form-clubes'], ['form-clubes-alta', 'label-clubes', 'label-socios', 'form-socios-modificacion', 'form-socios-baja', 'admin-socios', 'historico-socios', 'listado-clubes']);
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
               nro: $('#cf_nro').val()
               };

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
      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function getClubesListado(zonaSurId, zonaOesteId) {

  function fillTable(clubes, id) {
    var trsSur = "";
    var trsOeste = "";
    clubes.filter(function(c) {
      return c.distrito == 4915;
    }).map(function(c) {
      trsSur += "<tr><td>"+c.nombre+"</td><td>"+c.direccion+"</td><td>"+c.zona+"</td><td>"+c.dia+"</td><td>"+c.horario+"</td>"+
      "<td>"+c.aniversario+"</td><td>"+c.contacto+"</td><td>"+c.asistente+"</td><td>"+c.nrori+"</td>"+
      "<td style='width:80px; text-align:center;'><a class='btn btn-default' href='index.html#clubes' onclick='initClubesForm("+c.nrori+");'><input type='hidden' id='cf_id' value='"+c.nro+"'/><span class='glyphicon glyphicon-edit'></span></a></td></tr>";
    });

    $('#'+zonaSurId).removeData();
    $('#'+zonaSurId).html(trsSur);

    clubes.filter(function(c) {
      return c.distrito == 4855;
    }).map(function(c) {
      trsOeste += "<tr><td>"+c.nombre+"</td><td>"+c.direccion+"</td><td>"+c.zona+"</td><td>"+c.dia+"</td><td>"+c.horario+"</td>"+
      "<td>"+c.aniversario+"</td><td>"+c.contacto+"</td><td>"+c.asistente+"</td><td>"+c.nrori+"</td>"+
      "<td style='width:80px; text-align:center;'><a class='btn btn-default' href='index.html#clubes' onclick='initClubesForm("+c.nrori+");'><input type='hidden' id='cf_id' value='"+c.nro+"'/><span class='glyphicon glyphicon-edit'></span></a></td></tr>";
    });

    $('#'+zonaOesteId).removeData();
    $('#'+zonaOesteId).html(trsOeste);
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

  $.ajax({
      type: 'POST',
      url: '../api/asistencias_POST.php?formAsistencias=true',
      data: JSON.stringify(asistencias),
      success: function(data) {
        console.log(data);
        // TODO mostrar cartel de OK y borrar form
        mostrarSubsection(['label-socios'], ['form-socios-baja', 'form-socios', 'form-socios-modificacion', 'form-socios-alta', 'admin-socios', 'historico-socios']);
        mostrarSubsection(['label-asistencias'], ['form-asistencias', 'admin-asistencias', 'listado-asistencias']);
      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function getAsistenciasPendientes(elementId) {

  function fillTable(asistencias, id) {
    var trs = "";
    asistencias.map(function(a) {
      trs += "<tr><td>"+a.club+"</td><td>"+a.mes+"</td><td>"+a.periodo+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
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
      trs += "<tr><td>"+a.club+"</td><td>"+a.mes+"</td><td>"+a.periodo+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
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
  $('#af_periodo').val('2015');
  $('#af_tot_reun').val('');
  $('#af_prom_asist').val('');
  $('#af_reun_comp').val('');
  $('#af_total_soc').val('');

  defaultClub();
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
}
