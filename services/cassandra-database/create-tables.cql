CREATE KEYSPACE IF NOT EXISTS samples WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
CREATE TABLE IF NOT EXISTS samples.message_tracker (id ascii, status ascii, tags list<ascii>, owners list<text>, object text, reference_id ascii, created_at timestamp, delivered_at timestamp, PRIMARY KEY (id, reference_id));
CREATE INDEX IF NOT EXISTS idx_status ON samples.message_tracker (status);
CREATE INDEX IF NOT EXISTS idx_tags ON samples.message_tracker (tags);
CREATE INDEX IF NOT EXISTS idx_links ON samples.message_tracker (owners);