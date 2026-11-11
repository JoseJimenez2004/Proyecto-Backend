-- Equipos de prueba del Avance 1.
-- id_edificio e id_distribuidor apuntan a los registros de catalogos-service (1, 2, 3...).

INSERT INTO computadora (num_inventario, numero_serie, marca, modelo, tipo_equipo, procesador, memoria_ram_gb,
    capacidad_disco_duro_gb, capacidad_segundo_disco_duro_gb, unidad_optica, fecha_compra, costo_adquisicion,
    costo_reemplazo, intervalo_actualizacion_meses, fecha_fin_garantia, estado, ubicacion_especifica,
    id_edificio, id_distribuidor) VALUES
('ESCOM-00123', 'SN-DL-7420-001', 'Dell', 'OptiPlex 7420', 'Escritorio', 'Intel Core i5-13500', 16, 512, NULL, 'DVD-RW',
    '2024-02-10', 15800.00, 16500.00, 48, '2027-02-10', 'Activo', 'Mesa 1, lugar 3', 1, 1),
('ESCOM-00124', 'SN-HP-EL800-002', 'HP', 'EliteDesk 800 G9', 'Escritorio', 'Intel Core i7-13700', 32, 512, 1024, NULL,
    '2024-02-10', 21500.00, 22500.00, 48, '2027-02-10', 'Activo', 'Mesa 2, lugar 1', 1, 1),
('ESCOM-00087', 'SN-LN-T14-003', 'Lenovo', 'ThinkPad T14', 'Portatil', 'AMD Ryzen 7 7840U', 16, 512, NULL, NULL,
    '2023-06-01', 24900.00, 26000.00, 36, '2025-06-01', 'Activo', 'Resguardo docente', 3, 2);
