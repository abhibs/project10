-- Existing installations: run once after creating the branches table.
-- Alternatively use the repeatable scripts/migrate-contact-branches.mjs runner.
ALTER TABLE contacts MODIFY COLUMN business_type
  ENUM('Branch Visit', 'Doorstep Service', 'Quick Contact', 'Contact Page', 'Banner Form', 'Sell Gold', 'Release Pledged Gold', 'Doorstep Valuation', 'googlelead-lp', 'Incoming Calls', 'Branch Form') NOT NULL;
ALTER TABLE contacts
  ADD COLUMN branch_id VARCHAR(64) DEFAULT NULL,
  ADD CONSTRAINT contacts_branch_fk FOREIGN KEY (branch_id)
    REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE SET NULL;
UPDATE contacts SET business_type = 'Branch Form'
  WHERE branch_id IS NOT NULL AND business_type = 'Sell Gold';
