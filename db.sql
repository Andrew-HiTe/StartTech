CREATE DATABASE teste

USE teste;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL
);

INSERT INTO usuarios (email, senha) VALUES ('test@email.com', '123456');

SELECT * FROM usuarios;

TRUNCATE TABLE usuarios;

DELETE FROM usuarios;






DROP TABLE usuarios;