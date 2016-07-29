//---- Socios ----//

function sendSocioForm(accion) {

  var socio = {orden: $('#sf_socio_select').val(),
               nrori: $('#sf_nrori').val(),
               nrclub: $('#sf_club_select').val(),
               mes: $('#sf_mes').val(),
               periodo: $('#sf_periodo').val(),
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
               periodo: $('#sfb_periodo').val(),
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
      trs += "<tr><td>"+s.accion+"</td><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+numeroAMes(s.mes)+"</td><td>"+s.periodo+"</td><td>"+(s.categoria?s.categoria:"")+"</td>"+
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
      trs += "<tr><td>"+s.club+"</td><td nowrap>"+s.fecha+"</td><td>"+numeroAMes(s.mes)+"</td><td>"+s.periodo+"</td><td>"+s.nombre+"</td><td>"+(s.apellido?s.apellido:'')+"</td>"+
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
    // $('#sf_mes_row').hide();
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
  $('#sf_mes').val(getMesActual());
  $('#sf_periodo').val(getPeriodoActual());
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
  $('#sfb_mes').val(getMesActual());
  $('#sfb_periodo').val(getPeriodoActual());
  $('#sfb_motivo').val('0');
}

function filterClub() {
  getSociosListado('listado-socios-body', $('#filter_clubes_select').val());
}
