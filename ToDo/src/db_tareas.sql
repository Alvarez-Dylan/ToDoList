CREATE DATABASE IF NOT EXISTS todolist_db;
USE todolist_db;

CREATE TABLE IF NOT EXISTS tareas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titulo      VARCHAR(255) NOT NULL,
    completada  TINYINT(1)   NOT NULL DEFAULT 0
);

-- Datos de ejemplo
INSERT INTO tareas (titulo, completada) VALUES
    ('Comprar leche', 0),
    ('Hacer la tarea de Ing. Web', 0),
    ('Tomar agua', 1);