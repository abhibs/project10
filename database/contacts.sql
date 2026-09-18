CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  city VARCHAR(255) DEFAULT NULL,
  weight DECIMAL(10,2) DEFAULT NULL,
  preffered_date DATE DEFAULT NULL,
  preffered_time VARCHAR(20) DEFAULT NULL COMMENT '24-hour time or time range',
  services VARCHAR(255) NOT NULL,
  business_type ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY contacts_created_at_index (created_at),
  KEY contacts_business_type_index (business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
