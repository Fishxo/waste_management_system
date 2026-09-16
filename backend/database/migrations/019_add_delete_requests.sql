CREATE TABLE IF NOT EXISTS delete_requests (
    id SERIAL PRIMARY KEY,
    municipal_admin_id INTEGER NOT NULL REFERENCES municipal_admins(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('notifications', 'reports', 'all')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    kifle_ketema VARCHAR(100) NOT NULL,
    reason VARCHAR(500),
    notifications_count INTEGER NOT NULL DEFAULT 0,
    reports_count INTEGER NOT NULL DEFAULT 0,
    deleted_notifications INTEGER,
    deleted_reports INTEGER,
    reviewed_by INTEGER REFERENCES system_admins(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delete_requests_municipal_admin ON delete_requests(municipal_admin_id);
CREATE INDEX IF NOT EXISTS idx_delete_requests_status ON delete_requests(status);