CREATE DATABASE IF NOT EXISTS covid_records;
ALTER DATABASE covid_records DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
USE covid_records;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`username`)
);

CREATE USER IF NOT EXISTS 'covid'@'%' identified BY 'Covid.123';
GRANT ALL ON covid_records.* TO 'covid'@'%';
FLUSH privileges;
FLUSH hosts;
COMMIT;
