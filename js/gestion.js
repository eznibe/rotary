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
  mostrarSubsection([], ['btn-admin']);
}

setClubes('sf_club_select');
setClubes('sfb_club_select');
setClubes('af_club_select');

setSocios('sf_socio_select');
setSocios('sfb_socio_select');

setResponsable();

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
               cargo: 'SOCIO'
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
               cargo: selectedSocio[0].cargo
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
      trs += "<tr><td>"+s.accion+"</td><td>"+s.club+"</td><td>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+(s.categoria?s.categoria:"")+"</td>"+
      "<td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td><td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td>"+
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
      trs += "<tr><td>"+s.club+"</td><td>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td>"+
      "<td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+(s.motivo?s.motivo:"")+"</td></tr>";
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

  $('#sfb_club_select').val('0');
  $('#sfb_socio_select').val('0');
  $('#sfb_nrori').val('');
  $('#sfb_mes').val('0');
  $('#sfb_motivo').val('');
}


//---- Asistencias ----//

function sendAsistenciasForm() {

  var asistencias = {nrclub: $('#af_club_select').val(),
                     mes: $('#af_mes').val(),
                     periodo: $('#af_periodo').val(),
                     total_reuniones: $('#af_tot_reun').val(),
                     promedio_asist: $('#af_prom_asist').val(),
                     reuniones_completas: $('#af_reun_comp').val(),
                     total_socios: $('#af_total_soc').val()
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
      "<td>"+a.reuniones_completas+"</td><td>"+a.total_socios+"</td>"+
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
      "<td>"+a.reuniones_completas+"</td><td>"+a.total_socios+"</td></tr>";
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
