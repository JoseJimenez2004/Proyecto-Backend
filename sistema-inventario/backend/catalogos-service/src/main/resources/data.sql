-- Datos de prueba tomados del script del Avance 1 (catálogos).
-- Los id se generan 1, 2, 3... en el orden de inserción; inventario-service los referencia.

INSERT INTO edificio_campus (clave, nombre, tipo_espacio, direccion, numero_niveles, activo) VALUES
('LAB-C1', 'Laboratorio de Computo 1', 'Laboratorio', 'Edificio C, planta baja', 1, TRUE),
('LAB-C2', 'Laboratorio de Computo 2', 'Laboratorio', 'Edificio C, primer piso', 1, TRUE),
('CUB-D3', 'Cubiculos Docentes Edificio D', 'Cubiculo', 'Edificio D, segundo piso', 1, TRUE);

INSERT INTO distribuidor (nombre, calle, ciudad, estado, codigo_postal, telefono, fecha_ultimo_pedido, monto_total_compra, numero_total_pedidos) VALUES
('Compuequipos del Centro SA de CV', 'Av. Instituto Politecnico Nacional 2508', 'Ciudad de Mexico', 'Ciudad de Mexico', '07738', '5551234567', '2024-02-10', 37300.00, 2),
('Distribuidora TecnoMex SA de CV', 'Blvd. Miguel de Cervantes Saavedra 301', 'Ciudad de Mexico', 'Ciudad de Mexico', '07300', '5559876543', '2023-06-01', 24900.00, 1),
('Importadora de Sistemas del Norte SA', 'Eje Central Lazaro Cardenas 100', 'Ciudad de Mexico', 'Ciudad de Mexico', '11000', '5555551234', NULL, 0.00, 0);

INSERT INTO categoria_software (nombre, descripcion) VALUES
('Ofimatica', 'Procesadores de texto, hojas de calculo y presentaciones'),
('Desarrollo', 'IDEs, compiladores y herramientas de programacion'),
('Diseno', 'Software de edicion grafica, CAD y multimedia'),
('Seguridad', 'Antivirus y herramientas de proteccion del equipo');

INSERT INTO departamento (nombre) VALUES
('Soporte Tecnico'),
('Redes y Telecomunicaciones'),
('Sistemas y Licenciamiento');

INSERT INTO experto_soporte (num_empleado, primer_nombre, apellido_paterno, telefono_oficina, direccion_email, id_departamento) VALUES
('EMP-0001', 'Ricardo', 'Alvarez', '4921110001', 'ricardo.alvarez@escom.ipn.mx', 2),
('EMP-0002', 'Paola', 'Martinez', '4921110002', 'paola.martinez@escom.ipn.mx', 3),
('EMP-0003', 'Ivan', 'Delgado', '4921110003', 'ivan.delgado@escom.ipn.mx', 1);

INSERT INTO sistema_operativo (nombre, version, arquitectura, fabricante, fecha_fin_soporte) VALUES
('Windows', '11 Pro 23H2', '64 bits', 'Microsoft Corporation', '2028-10-10'),
('Ubuntu', '22.04 LTS', '64 bits', 'Canonical Ltd.', '2027-04-01'),
('Windows', '10 Pro 22H2', '64 bits', 'Microsoft Corporation', '2026-10-14');
