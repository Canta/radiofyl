
/*
drop database if exists radiofyl_radiofyl;
create database radiofyl_radiofyl;
*/

use radiofyl_radiofyl;

drop table if exists servidor;
create table servidor(
	id int not null auto_increment primary key,
	nombre varchar(255) not null,
	descripcion varchar(1000),
	id_tipo_servidor int not null
) DEFAULT CHARSET=utf8;


drop table if exists tipo_servidor;
create table tipo_servidor(
	id int not null auto_increment primary key,
	nombre varchar(255) not null,
	descripcion varchar(1000) not null,
	id_padre int
) DEFAULT CHARSET=utf8;


insert into tipo_servidor (nombre,descripcion) values ('IceCast', 'Servicio de código abierto para transmisión, inspirado en ShoutCast');
insert into tipo_servidor (nombre,descripcion) values ('ShoutCast', 'Servicio privado para transmisión, creado por la gente del WinAmp');
insert into tipo_servidor (nombre,descripcion, id_padre) values ('G.I.S.S.', 'Una versión ligeramente modificada del IceCast, que utiliza la red de giss.tv. Utiliza un método de chequeo de información diferente al del resto de los IceCasts.',1);
insert into tipo_servidor (nombre,descripcion, id_padre) values ('Listen2MyRadio - ShoutCast', 'Listen2MyRadio.com tiene un servicio de ShoutCast en el cual fallan los chequeos automáticos de otros ShoutCasts, pero tiene otra forma de confirmar su disponibilidad.',2);
insert into tipo_servidor (nombre,descripcion, id_padre) values ('Listen2MyRadio - IceCast', 'Listen2MyRadio.com tiene un servicio de IceCast en el cual fallan los chequeos automáticos de otros IceCasts, pero tiene otra forma de confirmar su disponibilidad.',1);

ALTER TABLE servidor
ADD CONSTRAINT FK_servidor_tipo_servidor
FOREIGN KEY (id_tipo_servidor) REFERENCES tipo_servidor(id);  


drop table if exists formato_stream;
create table formato_stream(
	id int not null auto_increment primary key,
	nombre varchar(50) not null,
	mime_type varchar(50),
	codec varchar(50), /* mp3, aac, mkv, etc */
	tipo varchar(50) not null /* audio, video, etc*/
) default charset = utf8;

insert into formato_stream (nombre, mime_type, codec, tipo) values ('mpeg genérico (1,2,3)', 'audio/mpeg', 'mp3', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('Ogg Vorbis I Profile', 'audio/ogg', 'ogg', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('Advanced Audio Coding (AAC)', 'audio/aac', 'aac', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('AAC en un contenedor MP4', 'audio/mp4', 'mp4', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('Ogg Audio Profile (audio in Ogg container)', 'audio/ogg', 'oga', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('Ogg Speex Profile', 'audio/ogg', 'spx', 'audio');
insert into formato_stream (nombre, mime_type, codec, tipo) values ('FLAC', 'audio/flac', 'flac', 'audio');

drop table if exists propiedades;
create table propiedades(
	id int not null primary key auto_increment,
	nombre varchar(50) unique not null,
	tipo_de_dato varchar(10) not null,
	regex varchar(255),
	valor_default varchar(50),
	codename varchar(50) not null
) default charset = utf8;

insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('URL', 'URL', 'string', '^.+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('USER_TRANSMISION', 'User de transmisión', 'string', '^.+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('PASS_TRANSMISION', 'Pass de transmisión', 'string', '^.+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('MAIL_GESTION', 'Mail para gestión', 'string', '^.+@.+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('RADIO_ID', 'Radio ID', 'int', '^[0-9]+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('MOUNT_POINT', 'MountPoint', 'string', '^.+$', null);
insert into propiedades (codename, nombre, tipo_de_dato, regex, valor_default) values ('FORMATO_STREAM', 'Formato de Stream', 'int', '^[0-9]+$', null);

drop table if exists props_x_tipo_servidor;
create table props_x_tipo_servidor(
	id_prop int not null,
	id_tipo_servidor int not null,
	primary key(id_prop, id_tipo_servidor)
) default charset = utf8;

ALTER TABLE props_x_tipo_servidor
ADD CONSTRAINT FK_props_x_tipo_servidor_prop
FOREIGN KEY (id_prop) REFERENCES propiedades(id)  
ON DELETE CASCADE;

ALTER TABLE props_x_tipo_servidor
ADD CONSTRAINT FK_props_x_tipo_servidor_tipo
FOREIGN KEY (id_tipo_servidor) REFERENCES tipo_servidor(id)  
ON DELETE CASCADE;

drop table if exists props_x_servidor;
create table props_x_servidor(
	id_servidor int not null,
	id_prop int not null,
	valor varchar(255),
	primary key(id_servidor, id_prop)
) default charset = utf8;

ALTER TABLE props_x_servidor
ADD CONSTRAINT FK_props_x_servidor_prop
FOREIGN KEY (id_prop) REFERENCES propiedades(id)  
ON DELETE CASCADE;

ALTER TABLE props_x_servidor
ADD CONSTRAINT FK_props_x_servidor_servidor
FOREIGN KEY (id_servidor) REFERENCES servidor(id)  
ON DELETE CASCADE;

drop table if exists transmision;
create table transmision(
	id int not null primary key auto_increment,
	url varchar(1000) not null,
	inicio timestamp not null default CURRENT_TIMESTAMP,
	fin timestamp,
	id_usuario int not null default '1',
	id_formato_stream int not null,
	nombre varchar(50),
	descripcion varchar(255),
	hash varchar(41) null,
	estable int(1) default 0
) default charset = utf8;

CREATE TRIGGER before_insert_transmision
BEFORE INSERT ON transmision
FOR EACH ROW
SET new.hash = PASSWORD(rand());

alter table transmision
add constraint FK_transmision_formato_stream
foreign key (id_formato_stream) references formato_stream(id);

drop table if exists servidor_x_transmision;
create table servidor_x_transmision(
	id int not null primary key auto_increment,
	id_transmision int not null,
	id_servidor int not null
) default charset = utf8;

alter table servidor_x_transmision
add constraint FK_servidorxtransmision_idtransmision
foreign key (id_transmision) references transmision(id);

alter table servidor_x_transmision
add constraint FK_servidorxtransmision_idservidor
foreign key (id_servidor) references servidor(id);


drop table if exists grabacion;
create table grabacion(
	id int not null primary key auto_increment,
	fecha timestamp not null default CURRENT_TIMESTAMP,
	id_usuario int not null,
	nombre varchar(50) not null,
	descripcion varchar(1000)
) default charset = utf8;

drop table if exists link_grabacion;
create table link_grabacion(
	id int not null primary key auto_increment,
	url varchar(1000) not null,
	id_grabacion int not null
) default charset = utf8;

alter table link_grabacion
add constraint FK_link_grabacion
foreign key (id_grabacion) references grabacion(id)
on delete cascade;


insert into servidor (nombre,descripcion, id_tipo_servidor) values ('RadioFyL, canal #1','La radio del forofyl.com.ar',3 );
insert into props_x_servidor (id_prop, id_servidor, valor) values (1,1,'http://giss.tv:8000/radiofyl.mp3');
insert into props_x_servidor (id_prop, id_servidor, valor) values (2,1,'source');
insert into props_x_servidor (id_prop, id_servidor, valor) values (3,1,'rfpq9');
insert into props_x_servidor (id_prop, id_servidor, valor) values (6,1,'/radiofyl.mp3');
insert into props_x_servidor (id_prop, id_servidor, valor) values (7,1,1);

insert into servidor (nombre,descripcion, id_tipo_servidor) values ('Radio CEFyL, canal #1','La radio del CEFyL - Universidad de Buenos Aires',3 );
insert into props_x_servidor (id_prop, id_servidor, valor) values (1,2,'http://giss.tv:8000/radiocefyl1.ogg');
insert into props_x_servidor (id_prop, id_servidor, valor) values (2,2,'source');
insert into props_x_servidor (id_prop, id_servidor, valor) values (3,2,'qzjsk');
insert into props_x_servidor (id_prop, id_servidor, valor) values (6,2,'/radiocefyl1.ogg');
insert into props_x_servidor (id_prop, id_servidor, valor) values (7,2,2);

/* Transmisiones estables por defecto */
insert into transmision(url, inicio, id_formato_stream, nombre, descripcion, estable) values ('http://annuna.dmsp.de:8888/annuna.ogg',now(),2, 'Annuna Tribe Radio','Psychedelic Trance Web Radio', 1);
insert into transmision(url, inicio, id_formato_stream, nombre, descripcion, estable) values ('http://128k.buzzoutroom.com:8034/;',now(),1, 'The Buzzoutroom', 'Chilled Downbeat Radio', 1);
insert into transmision(url, inicio, id_formato_stream, nombre, descripcion, estable) values ('http://stream.oslobass.no:8000/bass.mp3',now(),1, 'Oslo Bass Radio', 'Live Bass', 1);


drop table if exists radio;
create table radio(
	id int not null auto_increment primary key,
	nombre varchar(50) not null,
	web varchar(255) not null default '',
	mail varchar(255) not null default '',
	descripcion varchar(1000) not null default '',
	telefono varchar(255),
	tweeter varchar(255)
) default charset=utf8;

insert into radio (nombre, web, mail, descripcion, telefono, tweeter) values ('Independiente', 'http://www.radiocefyl.com.ar/', '', 'Transmisión independiente', NULL, '@RadioCEFyL');
insert into radio (nombre, web, mail, descripcion, telefono, tweeter) values ('Radio CEFyL', 'http://www.radiocefyl.com.ar/', 'radiocefyl@gmail.com', 'La radio del centro de estudiantes de la Universidad de Buenos Aires.', NULL, '@RadioCEFyL');

drop table if exists servidor_radio;
create table servidor_radio(
	id_servidor int not null,
	id_radio int not null,
	primary key (id_servidor, id_radio)
) default charset=utf8;

ALTER TABLE servidor_radio
ADD CONSTRAINT FK_servidor_radio_1
FOREIGN KEY (id_servidor) REFERENCES servidor(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

ALTER TABLE servidor_radio
ADD CONSTRAINT FK_servidor_radio_2
FOREIGN KEY (id_radio) REFERENCES radio(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

/*
insert into servidor_radio (id_servidor, id_radio) values (1,2);
insert into servidor_radio (id_servidor, id_radio) values (2,2);
insert into servidor_radio (id_servidor, id_radio) values (3,2);
*/

drop table if exists programa;
create table programa(
	id int not null auto_increment primary key,
	nombre varchar(255) not null,
	descripcion varchar(1000),
	mail varchar(255) not null
) DEFAULT CHARSET=utf8;

drop table if exists horario_programa;
create table horario_programa(
	id_programa int not null,
	dia_de_la_semana int not null,
	hora_inicio int not null,
	minutos_inicio int not null,
	primary key(id_programa, dia_de_la_semana, hora_inicio, minutos_inicio)
) default charset=utf8;

ALTER TABLE horario_programa
ADD CONSTRAINT FK_horario_programa
FOREIGN KEY (id_programa) REFERENCES programa(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

drop table if exists participante_programa;
create table participante_programa(
	id_programa int not null,
	nombre varchar(255) not null,
	detalles varchar(255),
	mail varchar(255)
) default charset=utf8;

ALTER TABLE participante_programa
ADD CONSTRAINT FK_participante_programa
FOREIGN KEY (id_programa) REFERENCES programa(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

drop table if exists usuario;
create table usuario(
	id int not null auto_increment primary key,
	username varchar(50) not null unique,
	password varchar(50) not null,
	nombre varchar(255) not null,
	mail varchar(255) not null unique
) default charset=utf8;

/* 1 siempre va a ser anon, y 2 siempre va a ser admin */
insert into usuario (username, password, nombre, mail) values ('anon', '', 'Anónimo','anon@internet.com');
insert into usuario (username, password, nombre, mail) values ('admin', '', 'Administrador','admin@radiocefyl.com.ar');

drop table if exists permiso;
create table permiso(
	id int not null auto_increment primary key,
	id_padre int,
	nombre varchar(50) not null,
	descripcion varchar(255) not null,
	codename varchar(50) not null
) default charset=utf8;

ALTER TABLE permiso
ADD CONSTRAINT FK_permiso_permiso
FOREIGN KEY (id_padre) REFERENCES permiso(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

insert into permiso(id_padre, codename, nombre, descripcion) values (NULL, 'ROOT_ADMIN', 'Administración', 'Opciones de administración. Determina si un usuario puede o no ver la interfase de administración.');
insert into permiso(id_padre, codename, nombre, descripcion) values (NULL, 'ROOT_UI', 'UI', 'Opciones de la interfase de usuario (UI).');
insert into permiso(id_padre, codename, nombre, descripcion) values (2, 'UI_VER_TRANSMISIONES', 'Ver Transmisiones', 'Determina si el usuario puede o no ver las transmisiones');
insert into permiso(id_padre, codename, nombre, descripcion) values (2, 'UI_VER_SERVIDORES', 'Ver Servidores', 'Determina si el usuario puede o no ver los servidores');
insert into permiso(id_padre, codename, nombre, descripcion) values (2, 'UI_VER_AGENDA', 'Ver Agenda', 'Determina si el usuario puede o no ver la agenda');
insert into permiso(id_padre, codename, nombre, descripcion) values (1, 'ADMIN_ADD_TRANSMISION', 'Agregar Transmision', 'Determina si el usuario puede o no agregar una transmision');
insert into permiso(id_padre, codename, nombre, descripcion) values (1, 'ADMIN_ADD_SERVIDOR', 'Agregar Servidor', 'Determina si el usuario puede o no agregar un servidor');
insert into permiso(id_padre, codename, nombre, descripcion) values (1, 'ADMIN_MODIFY_SERVIDOR', 'Modificar Servidor', 'Determina si el usuario puede o no modificar o borrar un servidor');
insert into permiso(id_padre, codename, nombre, descripcion) values (1, 'ADMIN_MODIFY_USERS', 'Modificar Usuario', 'Determina si el usuario puede o no modificar o borrar un usuario');
insert into permiso(id_padre, codename, nombre, descripcion) values (1, 'ADMIN_MODIFY_TRANSMISION','Modificar Transmision', 'Determina si el usuario puede o no modificar una transmision');


drop table if exists permiso_usuario;
create table permiso_usuario(
	id_permiso int not null,
	id_usuario int not null,
	primary key(id_permiso,id_usuario)
) default charset=utf8;

ALTER TABLE permiso_usuario
ADD CONSTRAINT FK_permiso_usuario1
FOREIGN KEY (id_permiso) REFERENCES permiso(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

ALTER TABLE permiso_usuario
ADD CONSTRAINT FK_permiso_usuario2
FOREIGN KEY (id_usuario) REFERENCES usuario(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE;  

/* Asigno todos los permisos al usuario Administrador */
insert into permiso_usuario(id_usuario, id_permiso) select 2,id from permiso;
/* ASIGNO POR DEFECTO PERMISO DE AGREGAR TRANSMISION AL USUARIO ANONIMO  */
insert into permiso_usuario(id_usuario, id_permiso) values (1, 6);
/* ASIGNO POR DEFECTO PERMISO DE MODIFICAR TRANSMISION AL USUARIO ANONIMO  */
insert into permiso_usuario(id_usuario, id_permiso) values (1, 10);

drop table if exists agenda;
create table agenda(
	id int not null auto_increment primary key,
	fecha int not null,
	hora int not null,
	nombre varchar(255) not null,
	descripcion varchar(1000)
) default charset=utf8;


drop table if exists config;
create table config(
	id int not null auto_increment primary key,
	field_name varchar(50) not null,
	field_value varchar(1000) not null default '') default charset utf8;

insert into config (field_name, field_value) values ('app_path', './');
insert into config (field_name, field_value) values ('anon_sees_all_transmisions', '1'); 
insert into config (field_name, field_value) values ('user_sees_all_servers', '1');
insert into config (field_name, field_value) values ('anon_sees_all_servers', '1');

drop table if exists servidor_usuario;
create table servidor_usuario(
	id_servidor int not null,
	id_usuario int not null,
	primary key(id_usuario, id_servidor)
) default charset = utf8;


ALTER TABLE servidor_usuario
ADD CONSTRAINT FK_servidor_usuario1
FOREIGN KEY (id_usuario) REFERENCES usuario(id)  
ON UPDATE CASCADE  
ON DELETE CASCADE; 

ALTER TABLE servidor_usuario
ADD CONSTRAINT FK_servidor_usuario2
FOREIGN KEY (id_servidor) REFERENCES servidor(id) 
ON UPDATE CASCADE  
ON DELETE CASCADE;




/*
	usuario admin default
*/
/*
grant ALL on radiofyl_radiofyl.* to radiofyl_admin@localhost;
set password for radiofyl_admin@localhost = password('ENTER PASSWORD HERE');
*/
