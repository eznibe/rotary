
alter table usuarios add column responsable varchar(128);

alter table usuarios add column mail varchar(128);

alter table reset_claves add column usuarioid int;

alter table envio_mail_formularios add column usuarioid int;

insert into usuarios (nrclub, usuario, password, nivel, mail)
select nro, nrori, concat('az', substring(OLD_PASSWORD(nombre),1,6)), 2, IF(INSTR(contacto, '@') > 0, contacto, null) from clubes;
