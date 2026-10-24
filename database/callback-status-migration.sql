-- Schedule incoming-call enquiries for a future call-back date.
ALTER TABLE contacts
  MODIFY COLUMN status ENUM('active', 'inactive', 'pending_callback') NOT NULL DEFAULT 'inactive',
  ADD COLUMN callback_date DATE DEFAULT NULL AFTER details,
  ADD KEY contacts_callback_date_index (callback_date);
