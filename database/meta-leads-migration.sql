ALTER TABLE contacts
  ADD COLUMN language ENUM('kannada', 'english') DEFAULT NULL AFTER area,
  ADD COLUMN meta_lead_id VARCHAR(128) DEFAULT NULL AFTER language,
  ADD UNIQUE KEY contacts_meta_lead_id_unique (meta_lead_id);
