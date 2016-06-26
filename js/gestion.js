// $('[id^=sf_]')

var clubes;
var socios;
var accionSocio = 'ALTA';

// start init //

setClubes('sf_club_select');
setClubes('sfb_club_select');
setClubes('af_club_select');

setSocios('sf_socio_select');
setSocios('sfb_socio_select');

getSociosConAccionesPendientes('admin-socios-body');

getSociosBajaHistorial('historico-socios-body');

getAsistenciasPendientes('admin-asistencias-body');

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

  var socio = {orden: $('#sfb_socio_select').val(),
               nrori: $('#sfb_nrori').val(),
               nrclub: $('#sfb_club_select').val(),
               mes: $('#sfb_mes').val(),
               motivo: $('#sfb_motivo').val()
               };

  $.ajax({
      type: 'POST',
      url: '../api/socios_POST.php?bajaSocio=true',
      data: JSON.stringify(socio), // or JSON.stringify ({name: 'jonas'}),
      success: function(data) { console.log(data); },
      contentType: "application/json",
      dataType: 'json'
  });
}


function setClubes(elementId) {

  function fillSelect(clubes, id) {
    var options = "";
    clubes.map(function(c) {
      options += "<option value='" + c.nrori + "'>" + c.nombre + "</option>";
    });

    $('#'+id).append(options);
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

function setSocios(elementId) {

  function fillSelect(socios, id) {
    var options = "<option value='0'>Seleccione un socio</option>";
    socios.map(function(s) {
      options += "<option value='" + s.orden + "'>" + (s.apellido ? s.apellido : "") + (s.apellido ? ", " + s.nombre : s.nombre) + "</option>";
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
      fillSelect(socios, elementId);
    });
  }
}

function getSociosConAccionesPendientes(elementId) {

  function fillTable(socios, id) {
    var trs = "";
    socios.map(function(s) {
      trs += "<tr><td>"+s.accion+"</td><td>"+s.club+"</td><td>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+(s.categoria?s.categoria:"")+"</td>"+
      "<td>"+s.nombre+"</td><td>"+s.apellido+"</td><td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td style='width:80px; text-align:center;'><a class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/socios_GET.php?pendientes=true", function(data, status){
    fillTable(data, elementId);
  });
}

function getSociosBajaHistorial(elementId) {

  function fillTable(socios, id) {
    var trs = "";
    socios.map(function(s) {
      trs += "<tr><td>"+s.club+"</td><td>"+s.fecha+"</td><td>"+s.mes+"</td><td>"+s.nombre+"</td><td>"+s.apellido+"</td>"+
      "<td>"+(s.cargo?s.cargo:"")+"</td><td>"+(s.clasificacion?s.clasificacion:"")+"</td><td>"+(s.contacto?s.contacto:"")+"</td><td>"+(s.motivo?s.motivo:"")+"</td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/socios_GET.php?historial=true", function(data, status){
    fillTable(data, elementId);
  });
}


function mostrarSubsection(aMostrar, aOcultar) {

  aMostrar.map(function(elementId) {
    $('.'+elementId).show();
  });

  aOcultar.map(function(elementId) {
    $('.'+elementId).hide();
  });
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
      "<td>"+a.reuniones_completas+"</td><td>"+a.total_socios+"</td><td style='width:80px; text-align:center;'><a class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></a></td></tr>";
    });

    $('#'+id).removeData();
    $('#'+id).html(trs);
  }

  $.get("../api/asistencias_GET.php?pendientes=true", function(data, status){
    fillTable(data, elementId);
  });
}
