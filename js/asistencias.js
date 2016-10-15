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

          if (data.successful) {
            $.notify("Asistencias enviada", {className: 'success', globalPosition: 'right bottom'});

            asistencias.type = 'Asistencias';
            sendMail(asistencias);
          } else {
            $.notify("Error al enviar, intente de nuevo", {className: 'error', globalPosition: 'right bottom'});
          }
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
      trs += "<tr><td>"+a.club+"</td><td>"+numeroAMes(a.mes)+"</td><td>"+a.periodo+"</td><td>"+a.fecha+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
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
      trs += "<tr><td>"+a.club+"</td><td>"+numeroAMes(a.mes)+"</td><td>"+a.periodo+"</td><td>"+a.fecha+"</td><td>"+a.total_reuniones+"</td><td>"+a.promedio_asist+"</td>"+
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
  $('#af_mes').val(getMesActual());
  $('#af_periodo').val(getPeriodoActual());
  $('#af_tot_reun').val('');
  $('#af_prom_asist').val('');
  $('#af_reun_comp').val('');
  $('#af_total_soc').val('');

  setClubes('af_club_select');
}
