ALTER TABLE contacts
  MODIFY COLUMN business_type
    ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact', 'Contact Page', 'Banner Form', 'Sell Gold', 'Release Pledged Gold', 'Doorstep Valuation', 'googlelead-lp') NOT NULL,
  ADD COLUMN tracking_data LONGTEXT DEFAULT NULL AFTER adgroup_id,
  ADD COLUMN landing_page VARCHAR(2048) DEFAULT NULL AFTER tracking_data,
  ADD COLUMN referrer VARCHAR(2048) DEFAULT NULL AFTER landing_page;
