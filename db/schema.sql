-- Khandesh Maratha Mandal — Vadhu Var Melava — Neon (PostgreSQL) schema
-- Sthaapanaa: 1 May 1986 | R. No. Maharashtra 2889/86 F 3978-Pune

CREATE TABLE IF NOT EXISTS candidates (
  id                    SERIAL PRIMARY KEY,
  registration_no       TEXT UNIQUE NOT NULL,
  registration_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  registration_type     TEXT NOT NULL DEFAULT 'अविवाहित (प्रथम वर)',
  old_registration_no   TEXT NOT NULL DEFAULT '',
  gender                TEXT NOT NULL DEFAULT 'groom' CHECK (gender IN ('groom','bride')),

  candidate_name        TEXT NOT NULL,
  birth_date            DATE,
  birth_time            TEXT NOT NULL DEFAULT '',
  birth_vel             TEXT NOT NULL DEFAULT '',
  kul                   TEXT NOT NULL DEFAULT '',
  education             TEXT NOT NULL DEFAULT '',
  job_details           TEXT NOT NULL DEFAULT '',
  job_designation       TEXT NOT NULL DEFAULT '',
  job_place             TEXT NOT NULL DEFAULT '',
  job_salary            TEXT NOT NULL DEFAULT '',
  candidate_cell_no     TEXT NOT NULL DEFAULT '',
  candidate_email       TEXT NOT NULL DEFAULT '',
  candidate_address     TEXT NOT NULL DEFAULT '',
  height_feet           INT  NOT NULL DEFAULT 0,
  height_inch           INT  NOT NULL DEFAULT 0,
  blood_group           TEXT NOT NULL DEFAULT '',
  complexion            TEXT NOT NULL DEFAULT '',

  father_name           TEXT NOT NULL DEFAULT '',
  father_cell_no        TEXT NOT NULL DEFAULT '',
  father_place          TEXT NOT NULL DEFAULT '',
  father_taluka         TEXT NOT NULL DEFAULT '',
  father_district       TEXT NOT NULL DEFAULT '',
  father_job_details    TEXT NOT NULL DEFAULT '',
  mother_name           TEXT NOT NULL DEFAULT '',
  mother_cell_no        TEXT NOT NULL DEFAULT '',
  mother_job_details    TEXT NOT NULL DEFAULT '',
  uncle_name            TEXT NOT NULL DEFAULT '',
  uncle_cell_no         TEXT NOT NULL DEFAULT '',
  uncle_place           TEXT NOT NULL DEFAULT '',
  uncle_taluka          TEXT NOT NULL DEFAULT '',
  uncle_district        TEXT NOT NULL DEFAULT '',
  uncle_kul             TEXT NOT NULL DEFAULT '',
  brother_married       INT  NOT NULL DEFAULT 0,
  brother_unmarried     INT  NOT NULL DEFAULT 0,
  sister_married        INT  NOT NULL DEFAULT 0,
  sister_unmarried      INT  NOT NULL DEFAULT 0,
  relations_details     TEXT NOT NULL DEFAULT '',
  expectation_details   TEXT NOT NULL DEFAULT '',

  pavati_book_no        TEXT NOT NULL DEFAULT '',
  pavati_no             TEXT NOT NULL DEFAULT '',
  renew_date            DATE,

  show_contact_on_screen BOOLEAN NOT NULL DEFAULT FALSE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_photos (
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  slot         SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 3),
  mime         TEXT NOT NULL,
  data_b64     TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (candidate_id, slot)
);

-- Multi-user system: admin can create sub-users with limited access
CREATE TABLE IF NOT EXISTS app_users (
  id           SERIAL PRIMARY KEY,
  username     TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- SHA-256 hex
  display_name TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin','operator')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dynamic display configuration (admin controls what fields show on big screen)
CREATE TABLE IF NOT EXISTS display_config (
  id           SERIAL PRIMARY KEY,
  field_key    TEXT NOT NULL UNIQUE,
  label_mr     TEXT NOT NULL,
  label_en     TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default display config
INSERT INTO display_config (field_key, label_mr, label_en, enabled, sort_order) VALUES
  ('birth_date',        'जन्म तारीख',         'Date of Birth',      true,  1),
  ('birth_time',        'जन्म वेळ',           'Birth Time',         true,  2),
  ('complexion',        'वर्ण',               'Complexion',         true,  3),
  ('blood_group',       'रक्तगट',             'Blood Group',        true,  4),
  ('father_name',       'वडिलांचे नाव',       'Father''s Name',     true,  5),
  ('father_job_details','वडिलांचा व्यवसाय',   'Father''s Occupation',true, 6),
  ('mother_name',       'आईचे नाव',           'Mother''s Name',     true,  7),
  ('mother_job_details','आईचा व्यवसाय',       'Mother''s Occupation',false,8),
  ('father_place',      'मूळ गाव',            'Native Place',       true,  9),
  ('uncle_name',        'मामा',               'Maternal Uncle',     true,  10),
  ('brother_info',      'भाऊ',                'Brothers',           true,  11),
  ('sister_info',       'बहीण',               'Sisters',            true,  12),
  ('expectation_details','अपेक्षा',           'Expectations',       true,  13)
ON CONFLICT (field_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_candidates_active  ON candidates (is_deleted, is_active, gender);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_search  ON candidates (lower(candidate_name), lower(registration_no));
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users (lower(username));
CREATE INDEX IF NOT EXISTS idx_display_config_order ON display_config (sort_order);
