CREATE database if not exists jch;

use jch;

create table
    devices (
        name varchar(255),
        id varchar(25),
        primary key (id)
    );

create table
    waterlevel (
        id integer not null,
        level integer not null,
        date datetime not null,
        device varchar(25),
        foreign key (device) references devices (id)
    );

create table
    batterylevel (
        id integer not null,
        level integer not null,
        date datetime not null,
        device varchar(255),
        usingSolar boolean,
        foreign key (device) references devices (id)
    );

create table
    settings (
        id integer not null,
        device varchar(255),
        foreign key (device) references devices (id)
    );