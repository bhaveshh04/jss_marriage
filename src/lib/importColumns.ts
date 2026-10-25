// =====================================================================================
//  EXCEL IMPORT — COLUMN DEFINITIONS  (the ONLY file to edit to add / remove / rename
//  an Excel column).  The template download, the instructions sheet, the dropdowns and
//  the importer ALL read from this list.
//
//  key      -> database column name (must exist in src/lib/schema.ts)
//  header   -> heading shown in the Excel sheet (row 1)
//  kind     -> text | int | date | time | gender | bool
//  required -> true = row is rejected if this cell is empty
//  list     -> dropdown values shown in Excel
//  freeList -> true = dropdown is only a suggestion (other text still allowed)
//  aliases  -> other headings that are also accepted when importing
// =====================================================================================
import { BIRTH_VEL, BLOOD_GROUPS, COMPLEXIONS, REGISTRATION_TYPES } from "./fields";

export type ColKind = "text" | "int" | "date" | "time" | "gender" | "bool";
export type ImportCol = {
  key: string;
  header: string;
  kind: ColKind;
  hint: string;
  width?: number;
  required?: boolean;
  list?: string[];
  freeList?: boolean;
  aliases?: string[];
};

export const MAX_IMPORT_ROWS = 500; // maximum candidates per Excel file

const t = (key: string, header: string, hint: string, o: Partial<ImportCol> = {}): ImportCol => ({ key, header, kind: "text", hint, ...o });
const n = (key: string, header: string, hint: string, o: Partial<ImportCol> = {}): ImportCol => ({ key, header, kind: "int", hint, width: 12, ...o });

export const IMPORT_COLS: ImportCol[] = [
  // ---- Registration ----
  t("registration_no", "Registration No", "Leave EMPTY to auto-generate (M0001, M0002 ...). Must be unique.", { width: 16, aliases: ["Reg No"] }),
  { key: "registration_date", header: "Registration Date", kind: "date", hint: "DD-MM-YYYY. Empty = today.", width: 16 },
  t("registration_type", "Registration Type", "Pick from the dropdown. Empty = Pratham Var / Pratham Vadhu based on Gender.", { width: 28, list: REGISTRATION_TYPES }),
  t("old_registration_no", "Old Registration No", "Optional.", { width: 18 }),

  // ---- Personal ----
  { key: "gender", header: "Gender", kind: "gender", hint: "Groom or Bride (वर / वधू also accepted).", width: 12, required: true, list: ["Groom", "Bride"] },
  t("candidate_name", "Candidate Name", "Full name of the groom / bride.", { width: 28, required: true, aliases: ["Name", "Full Name"] }),
  { key: "birth_date", header: "Birth Date", kind: "date", hint: "DD-MM-YYYY, e.g. 14-03-1996.", width: 14, aliases: ["DOB", "Date of Birth"] },
  { key: "birth_time", header: "Birth Time", kind: "time", hint: "e.g. 10:30 AM or 22:15.", width: 12 },
  t("birth_vel", "Birth Vel (Day/Night)", "दिवसा or रात्री (Day / Night also accepted).", { width: 16, list: BIRTH_VEL, aliases: ["Birth Vel"] }),
  t("kul", "Kul", "Clan / kul, e.g. ९६ कुळी.", { width: 14 }),
  n("height_feet", "Height Feet", "Whole number, e.g. 5."),
  n("height_inch", "Height Inch", "Whole number 0-11, e.g. 8."),
  t("complexion", "Complexion", "Dropdown suggestion; other text allowed.", { width: 14, list: COMPLEXIONS, freeList: true }),
  t("blood_group", "Blood Group", "A+, A-, B+, B-, AB+, AB-, O+, O-.", { width: 12, list: BLOOD_GROUPS }),

  // ---- Education & job ----
  t("education", "Education", "e.g. B.E. (Computer).", { width: 26 }),
  t("job_details", "Job Details", "Company / business name.", { width: 26 }),
  t("job_designation", "Job Designation", "e.g. Software Engineer.", { width: 22 }),
  t("job_place", "Job Place", "Work location.", { width: 18 }),
  t("job_salary", "Annual Income", "Free text, e.g. ८ लाख.", { width: 16, aliases: ["Job Salary", "Salary"] }),

  // ---- Contact (not shown on the big screen unless 'Show Contact On Screen' = Yes) ----
  t("candidate_cell_no", "Candidate Mobile", "10 digit mobile number.", { width: 16, aliases: ["Candidate Cell No", "Mobile"] }),
  t("candidate_email", "Candidate Email", "Optional.", { width: 24 }),
  t("candidate_address", "Candidate Address", "Full address.", { width: 34 }),

  // ---- Family ----
  t("father_name", "Father Name", "", { width: 26 }),
  t("father_cell_no", "Father Mobile", "", { width: 16, aliases: ["Father Cell No"] }),
  t("father_place", "Native Village", "Village (मूळ गाव).", { width: 18, aliases: ["Father Place"] }),
  t("father_taluka", "Taluka", "", { width: 16, aliases: ["Father Taluka"] }),
  t("father_district", "District", "", { width: 16, aliases: ["Father District"] }),
  t("father_job_details", "Father Occupation", "", { width: 22, aliases: ["Father Job Details"] }),
  t("mother_name", "Mother Name", "", { width: 26 }),
  t("mother_cell_no", "Mother Mobile", "", { width: 16, aliases: ["Mother Cell No"] }),
  t("mother_job_details", "Mother Occupation", "", { width: 22, aliases: ["Mother Job Details"] }),
  t("uncle_name", "Mama Name", "Maternal uncle (मामा).", { width: 24, aliases: ["Uncle Name"] }),
  t("uncle_cell_no", "Mama Mobile", "", { width: 16, aliases: ["Uncle Cell No"] }),
  t("uncle_place", "Mama Village", "", { width: 18, aliases: ["Uncle Place"] }),
  t("uncle_taluka", "Mama Taluka", "", { width: 16, aliases: ["Uncle Taluka"] }),
  t("uncle_district", "Mama District", "", { width: 16, aliases: ["Uncle District"] }),
  t("uncle_kul", "Mama Kul", "", { width: 14, aliases: ["Uncle Kul"] }),
  n("brother_married", "Brother Married", "Number, empty = 0."),
  n("brother_unmarried", "Brother Unmarried", "Number, empty = 0."),
  n("sister_married", "Sister Married", "Number, empty = 0."),
  n("sister_unmarried", "Sister Unmarried", "Number, empty = 0."),
  t("relations_details", "Other Relations", "Other relatives / references.", { width: 34, aliases: ["Relations Details"] }),
  t("expectation_details", "Expectations", "What they expect from the partner.", { width: 40, aliases: ["Expectation Details", "Expectation"] }),

  // ---- Receipt / admin ----
  t("pavati_book_no", "Receipt Book No", "Optional.", { width: 16, aliases: ["Pavati Book No"] }),
  t("pavati_no", "Receipt No", "Optional.", { width: 14, aliases: ["Pavati No"] }),
  { key: "renew_date", header: "Renew Date", kind: "date", hint: "DD-MM-YYYY. Optional.", width: 14 },
  { key: "show_contact_on_screen", header: "Show Contact On Screen", kind: "bool", hint: "Yes / No. Empty = No (phone numbers hidden).", width: 20, list: ["Yes", "No"] },
  { key: "is_active", header: "Show On Big Screen", kind: "bool", hint: "Yes / No. Empty = Yes (profile appears on Live display).", width: 18, list: ["Yes", "No"], aliases: ["Is Active", "Active"] },
];

// Two sample rows shown on the "Example" sheet of the template (values keyed by column key)
const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const tm = (h: number, m: number) => new Date(Date.UTC(1899, 11, 30, h, m));

export const EXAMPLE_ROWS: Record<string, string | number | Date>[] = [
  {
    registration_date: d(2026, 10, 25), registration_type: REGISTRATION_TYPES[0], gender: "Groom", candidate_name: "राहुल सुरेश पाटील",
    birth_date: d(1996, 3, 14), birth_time: tm(10, 30), birth_vel: "दिवसा", kul: "९६ कुळी", height_feet: 5, height_inch: 8,
    complexion: "गोरा", blood_group: "B+", education: "B.E. (Computer)", job_details: "Infosys Ltd.", job_designation: "Software Engineer",
    job_place: "पुणे", job_salary: "८ लाख", candidate_cell_no: "9876543210", candidate_email: "rahul@example.com",
    candidate_address: "फ्लॅट नं. ४, गणेश नगर, हडपसर, पुणे", father_name: "सुरेश दत्तात्रय पाटील", father_cell_no: "9822012345",
    father_place: "वाघोली", father_taluka: "हवेली", father_district: "पुणे", father_job_details: "शेती", mother_name: "सुनिता सुरेश पाटील",
    mother_job_details: "गृहिणी", uncle_name: "अनिल शिंदे", uncle_place: "सातारा", uncle_taluka: "सातारा", uncle_district: "सातारा", uncle_kul: "शिंदे",
    brother_married: 1, brother_unmarried: 0, sister_married: 0, sister_unmarried: 1, expectation_details: "सुशिक्षित, नोकरी करणारी वधू हवी",
    show_contact_on_screen: "No", is_active: "Yes",
  },
  {
    registration_type: REGISTRATION_TYPES[1], gender: "Bride", candidate_name: "प्रिया संजय जाधव", birth_date: d(1998, 7, 2),
    birth_time: tm(22, 15), birth_vel: "रात्री", kul: "९६ कुळी", height_feet: 5, height_inch: 3, complexion: "सावळा", blood_group: "O+",
    education: "M.Com", job_details: "HDFC Bank", job_designation: "Assistant Manager", job_place: "पुणे", job_salary: "५ लाख",
    father_name: "संजय बाबुराव जाधव", father_place: "बारामती", father_taluka: "बारामती", father_district: "पुणे", father_job_details: "व्यवसाय",
    mother_name: "मंगल संजय जाधव", brother_married: 0, brother_unmarried: 1, expectation_details: "स्वतःचे घर व चांगली नोकरी असलेला वर",
  },
];
