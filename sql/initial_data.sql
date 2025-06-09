INSERT INTO tb_user_status (
	user_status_id, created_on, created_by, user_status_desc, allow_login, is_in_use
) VALUES 
(1, current_timestamp, 'admin', 'Active', 1, 1),
(2, current_timestamp, 'admin', 'Suspend', 1, 1)

INSERT INTO tb_action (
	action_id, created_on, created_by, action_code, action_desc, group_code, is_in_use, is_default_func, allow_notif
) VALUES 
-- Comapny Profile Setup
(gen_random_uuid(), current_timestamp, 'admin', 'app-co-profile::l', 'Company Profile List', 'Settings - Company Profile', 1, 1, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-co-profile::s', 'Company Profile Create', 'Settings - Company Profile', 1, 0, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-co-profile::u', 'Company Profile Update', 'Settings - Company Profile', 1, 0, 0),

-- User Group
(gen_random_uuid(), current_timestamp, 'admin', 'app-user-group::l', 'User Group List', 'Settings - User Group', 1, 1, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-user-group::s', 'User Group Create', 'Settings - User Group', 1, 0, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-user-group::u', 'User Group Update', 'Settings - User Group', 1, 0, 0),

-- User 
(gen_random_uuid(), current_timestamp, 'admin', 'app-user::l', 'User List', 'Settings - User', 1, 1, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-user::s', 'User Create', 'Settings - User', 1, 0, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-user::u', 'User Update', 'Settings - User', 1, 0, 0),

-- System Setup
(gen_random_uuid(), current_timestamp, 'admin', 'app-sys-setup::l', 'System Setup List', 'Settings - System Setup', 1, 1, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-sys-setup::s', 'System Setup Create', 'Settings - System Setup', 1, 0, 0),
(gen_random_uuid(), current_timestamp, 'admin', 'app-sys-setup::u', 'System Setup Update', 'Settings - System Setup', 1, 0, 0),

-- Submit Document
(gen_random_uuid(), current_timestamp, 'admin', 'app-submit-doc::s', 'Document Submission', 'System - Document Submission', 1, 1, 0),
 