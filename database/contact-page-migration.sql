-- Allow new contact-page enquiries while preserving existing contact types and records.
ALTER TABLE contacts
  MODIFY COLUMN business_type
    ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact', 'Contact Page') NOT NULL;
