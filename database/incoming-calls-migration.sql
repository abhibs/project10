-- Store enquiries entered manually by an authenticated administrator.
ALTER TABLE contacts
  MODIFY COLUMN business_type
    ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact', 'Contact Page', 'Banner Form', 'Sell Gold', 'Release Pledged Gold', 'Doorstep Valuation', 'googlelead-lp', 'Incoming Calls') NOT NULL,
  ADD COLUMN details TEXT DEFAULT NULL AFTER release_place;
