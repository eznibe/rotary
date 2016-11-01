// $('[id^=sf_]')

var clubes;
var socios;
var accionSocio = 'ALTA';

// start init //

var resetHash = getParameterByName('hash');

var logged = Cookies.get('logged') && !resetHash ? JSON.parse(Cookies.get('logged')) : null;

var isAdmin = logged && +logged.nivel > 2;


if (resetHash && !logged) {
  setUsuarioHash(resetHash);
}
else if (!logged) {
  // no logueado -> ocultar todo
  mostrarSubsection([], ['btn-admin', 'btn-user']);
}
else if (isAdmin) {
  // admin
  getSociosConAccionesPendientes('admin-socios-body');

  getSociosBajaHistorial('historico-socios-body');

  mostrarSubsection([], ['btn-only-user', 'cf_responsable']);

} else {
  // no admin -> hide some buttons
  mostrarSubsection([], ['btn-admin', 'form-clubes-alta', 'listado-clubes']);

  $('.admin_row').hide();

  // show message to fill the email if neccesary
  if (qs('l')) {
    alertarFaltaEmail(logged.id);
  }
}

setClubes(['sf_club_select', 'sfb_club_select', 'af_club_select', 'filter_clubes_select']);

setSocios('sf_socio_select');
setSocios('sfb_socio_select');

setResponsable();

// setMesActual(['sf_mes', 'sfb_mes', 'af_mes']);
setMesActual(['sf_mes', 'sfb_mes']);

setPerfil();

// end init //

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

function setMesActual(elementIds) {

  elementIds.map(function(id) {

    $('#' + id).val(getMesActual());
  });
}

function getMesActual() {
  return moment().format('MM');
}

function getPeriodoActual() {
  if (+moment().format('MM') <= 6) {
    // segunda parte del periodo => año actual menos 1
    returnmoment().add(-1, 'years').format('YYYY');;
  } else {
    return moment().format('YYYY');
  }
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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function sendMail(form) {

  $.ajax({
      type: 'POST',
      url: '../api/mails_POST.php',
      data: JSON.stringify(form), // or JSON.stringify ({name: 'jonas'}),
      success: function(data) {

      },
      contentType: "application/json",
      dataType: 'json'
  });
}

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}
