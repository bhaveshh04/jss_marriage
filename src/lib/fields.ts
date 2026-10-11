// Single source of truth for DB columns (used by the API, the form and the SQL builders)
export const TEXT_COLS = [
  "registration_type", "old_registration_no", "gender", "candidate_name", "birth_time", "birth_vel", "kul", "education",
  "job_details", "job_designation", "job_place", "job_salary", "candidate_cell_no", "candidate_email", "candidate_address",
  "blood_group", "complexion", "father_name", "father_cell_no", "father_place", "father_taluka", "father_district",
  "father_job_details", "mother_name", "mother_cell_no", "mother_job_details", "uncle_name", "uncle_cell_no", "uncle_place",
  "uncle_taluka", "uncle_district", "uncle_kul", "relations_details", "expectation_details", "pavati_book_no", "pavati_no",
] as const;

export const INT_COLS = [
  "height_feet", "height_inch", "brother_married", "brother_unmarried", "sister_married", "sister_unmarried",
] as const;

export const DATE_COLS = ["registration_date", "birth_date", "renew_date"] as const;
export const BOOL_COLS = ["show_contact_on_screen", "is_active"] as const;

export const REGISTRATION_TYPES = [
  "अविवाहित (प्रथम वर)",
  "अविवाहित (प्रथम वधू)",
  "घटस्फोटीत (पुनर्विवाह)",
  "विधुर (पुनर्विवाह)",
  "विधवा (पुनर्विवाह)",
];
export const BIRTH_VEL = ["दिवसा", "रात्री"];
export const COMPLEXIONS = ["गोरा", "सावळा", "निमगोरा", "गव्हाळ"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
