ALTER TABLE contacts
  MODIFY COLUMN status ENUM('active', 'inactive', 'pending_callback', 'visiting_branch') NOT NULL DEFAULT 'inactive',
  ADD COLUMN visit_branch_id VARCHAR(64) DEFAULT NULL AFTER callback_date,
  ADD COLUMN visit_date DATE DEFAULT NULL AFTER visit_branch_id,
  ADD COLUMN visit_time TIME DEFAULT NULL AFTER visit_date,
  ADD KEY contacts_visit_date_index (visit_date),
  ADD CONSTRAINT contacts_visit_branch_fk FOREIGN KEY (visit_branch_id)
    REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE SET NULL;
