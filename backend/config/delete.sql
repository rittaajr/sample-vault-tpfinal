-- Eliminar la base de datos completa
DROP DATABASE IF EXISTS samplevault;

-- Opcional: Eliminar un usuario específico si se creó uno para este proyecto
DROP USER IF EXISTS 'samplevault'@'localhost';

-- Confirmación de limpieza
SELECT 'Database deleted successfully' AS Status;
