CREATE DATABASE IF NOT EXISTS covid_records;
ALTER DATABASE covid_records DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
USE covid_records;

DROP TABLE IF EXISTS `pacients`;
DROP TABLE IF EXISTS `report_symptom`;
DROP TABLE IF EXISTS `symptoms`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `pacient_report`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`username`)
);

CREATE TABLE `addresses` (
    `address_ID` INT NOT NULL AUTO_INCREMENT,
    `street` varchar(255),
    `number` int,
    `complement` varchar(255),
    `neighborhood` varchar(255),
    `reference_unit` varchar(255),
    PRIMARY KEY (`address_ID`)
);


CREATE TABLE `reports` (
    `report_ID` bigint(20) NOT NULL AUTO_INCREMENT,
    `data_origin` varchar(255),
    `comorbidity` varchar(255),
    `covid_exam` boolean,
    `covid_result` varchar(255),
    `situation` varchar(255),
    `notification_date` date,
    `symptoms_start_date` date,
    PRIMARY KEY (`report_ID`)
);

CREATE TABLE symptoms (
    symptom_ID INT NOT NULL AUTO_INCREMENT,
    `name` varchar(255),
    PRIMARY KEY (`symptom_ID`)
);

CREATE TABLE report_symptom (
    rs_ID INT NOT NULL AUTO_INCREMENT,
    report_ID bigint(20) NOT NULL,
    symptom_ID INT NOT NULL,
    PRIMARY KEY (rs_ID)
);

CREATE TABLE pacients (
    cpf varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    mother_name varchar(255),
    sex varchar(255),
    sex_orientation varchar(255),
    phone_number varchar(255),
    birth_date date,
    address_ID int,
    report_ID bigint(20),
    user varchar(255),
    PRIMARY KEY (cpf)
);

CREATE TABLE pacient_report (
    `pacient_report_ID` bigint(20),
    `pacient_ID` varchar(255),
    `report_ID` bigint(20),
    PRIMARY KEY (pacient_report_ID)

);

CREATE USER IF NOT EXISTS 'covid'@'%' identified BY 'Covid.123';
GRANT ALL ON covid_records.* TO 'covid'@'%';
FLUSH privileges;
FLUSH hosts;
COMMIT;