-- Maratha Vadhu Var Melava — Neon (PostgreSQL) schema
-- Fields follow your previous app's table (form_id, registration_*, candidate_*, father_*, ...)

CREATE TABLE IF NOT EXISTS candidates (
  id                    SERIAL PRIMARY KEY,                -- form_id
  registration_no       TEXT UNIQUE NOT NULL,              -- registration_id
  registration_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  registration_type     TEXT NOT NULL DEFAULT 'अविवाहित (प्रथम वर)',
  old_registration_no   TEXT NOT NULL DEFAULT '',
  gender                TEXT NOT NULL DEFAULT 'groom' CHECK (gender IN ('groom','bride')),

  candidate_name        TEXT NOT NULL,
  birth_date            DATE,
  birth_time            TEXT NOT NULL DEFAULT '',
  birth_vel             TEXT NOT NULL DEFAULT '',          -- दिवसा / रात्री
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

  show_contact_on_screen BOOLEAN NOT NULL DEFAULT FALSE,   -- privacy for the big screen
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Up to 3 photos per candidate (stored compressed, ~60-150 KB each)
CREATE TABLE IF NOT EXISTS candidate_photos (
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  slot         SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 3),
  mime         TEXT NOT NULL,
  data_b64     TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (candidate_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_candidates_active  ON candidates (is_deleted, is_active, gender);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_search  ON candidates (lower(candidate_name), lower(registration_no));
