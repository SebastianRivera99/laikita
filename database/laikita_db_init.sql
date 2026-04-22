-- ============================================
-- LAIKITA - Inicialización de Base de Datos
-- ============================================
-- Ejecutar este archivo una sola vez para crear
-- la base de datos y todas sus tablas.
--
-- Uso en phpMyAdmin: Importar este archivo
-- Uso en terminal:   mysql -u root -p < laikita_db_init.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS laikita
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE laikita;

-- ============================================
-- TABLA: users (Usuarios del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  email       VARCHAR(191)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,         -- hash bcrypt
  role        ENUM('admin','vet','receptionist') NOT NULL DEFAULT 'receptionist',
  avatar      VARCHAR(500)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: owners (Dueños de mascotas)
-- ============================================
CREATE TABLE IF NOT EXISTS owners (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100)  NOT NULL,
  last_name   VARCHAR(100)  NOT NULL,
  email       VARCHAR(191)  NULL UNIQUE,
  phone       VARCHAR(20)   NULL,
  address     VARCHAR(300)  NULL,
  document    VARCHAR(30)   NULL UNIQUE,      -- Cédula / ID
  avatar      VARCHAR(500)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pets (Mascotas)
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT UNSIGNED  NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  species     ENUM('dog','cat','bird','rabbit','hamster','other') NOT NULL,
  breed       VARCHAR(100)  NULL,
  gender      ENUM('male','female') NOT NULL,
  size        ENUM('small','medium','large') NOT NULL,
  birth_date  DATE          NULL,
  weight      DECIMAL(5,2)  NULL COMMENT 'Peso en kg',
  color       VARCHAR(100)  NULL,
  microchip   VARCHAR(50)   NULL UNIQUE,
  photo       VARCHAR(500)  NULL,
  is_neutered TINYINT(1)    NOT NULL DEFAULT 0,
  allergies   TEXT          NULL COMMENT 'JSON array de alergias',
  notes       TEXT          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pets_owner
    FOREIGN KEY (owner_id) REFERENCES owners(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: treatments (Tratamientos / Citas)
-- ============================================
CREATE TABLE IF NOT EXISTS treatments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id        INT UNSIGNED  NOT NULL,
  owner_id      INT UNSIGNED  NOT NULL,
  type          ENUM(
                  'consultation','vaccination','surgery','grooming',
                  'dental','laboratory','emergency','deworming','other'
                ) NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT          NULL,
  diagnosis     TEXT          NULL,
  prescription  TEXT          NULL,
  status        ENUM('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  date          DATE          NOT NULL,
  time          TIME          NOT NULL,
  veterinarian  VARCHAR(150)  NOT NULL,
  cost          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes         TEXT          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_treatments_pet
    FOREIGN KEY (pet_id)   REFERENCES pets(id)   ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_treatments_owner
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: products (Productos de la tienda)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  description TEXT          NULL,
  category    ENUM('food','medicine','accessories','hygiene','toys','clothing') NOT NULL,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock       INT UNSIGNED  NOT NULL DEFAULT 0,
  image       VARCHAR(500)  NULL,
  brand       VARCHAR(100)  NULL,
  pet_type    VARCHAR(200)  NULL COMMENT 'JSON array: ["dog","cat",...]',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: orders (Pedidos / Ventas)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NULL COMMENT 'Usuario que registró la venta',
  total       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: order_items (Detalle de pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  quantity    INT UNSIGNED  NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ÍNDICES adicionales para búsquedas frecuentes
-- ============================================
CREATE INDEX idx_pets_owner       ON pets(owner_id);
CREATE INDEX idx_pets_species     ON pets(species);
CREATE INDEX idx_treatments_pet   ON treatments(pet_id);
CREATE INDEX idx_treatments_owner ON treatments(owner_id);
CREATE INDEX idx_treatments_date  ON treatments(date);
CREATE INDEX idx_treatments_status ON treatments(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(is_active);

-- ============================================
-- DATOS INICIALES - Usuario administrador
-- ============================================
-- Contraseña: admin123  (hash bcrypt generado con cost=10)
INSERT IGNORE INTO users (name, email, password, role) VALUES
(
  'Dr. Sebastián López',
  'admin@laikita.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'admin'
);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Verifica que todo quedó bien:
-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE owners;
-- DESCRIBE pets;
-- DESCRIBE treatments;
-- DESCRIBE products;
-- DESCRIBE orders;
-- DESCRIBE order_items;
