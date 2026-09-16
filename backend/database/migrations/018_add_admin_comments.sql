CREATE TABLE IF NOT EXISTS admin_comments (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES admin_comments(id) ON DELETE CASCADE,
    sender_role VARCHAR(30) NOT NULL CHECK (sender_role IN ('municipal_admin', 'system_admin')),
    municipal_admin_id INTEGER NOT NULL REFERENCES municipal_admins(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_comments_parent ON admin_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_municipal_admin ON admin_comments(municipal_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_sender ON admin_comments(sender_role);
