drop database if exists jch;

CREATE database if not exists jch;

use jch;

CREATE TABLE
    devices (
        id VARCHAR(255) not null,
        deviceName VARCHAR(50),
        PRIMARY KEY (id)
    ) ENGINE = InnoDB;

create table
    waterlevel (
        id integer not null auto_increment,
        waterlevel integer,
        insert_date datetime default CURRENT_TIMESTAMP,
        device varchar(25),
        primary key (id),
        foreign key (device) references devices (id)
    ) ENGINE = InnoDB;

create table
    settings (
        id integer not null auto_increment,
        device varchar(25),
        jsonData JSON not null,
        primary key (id),
        foreign key (device) references devices (id)
    ) ENGINE = InnoDB;