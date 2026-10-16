-- Add banner enquiries without changing existing contact records.
ALTER TABLE contacts
  MODIFY COLUMN business_type
    ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact', 'Contact Page', 'Banner Form') NOT NULL;
