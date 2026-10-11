import { z } from "zod";

const str = (max = 300) => z.string().trim().max(max).default("");
const int = z.coerce.number().int().min(0).max(99).default(0);
const dateStr = z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date").default("");
const photo = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,/, "Photo must be a JPG, PNG or WebP image")
  .max(1_600_000, "Photo is too large")
  .nullable()
  .optional();

export const candidateSchema = z.object({
  registration_no: str(40),
  registration_date: dateStr,
  registration_type: str(80),
  old_registration_no: str(40),
  gender: z.enum(["groom", "bride"]).default("groom"),
  candidate_name: z.string().trim().min(1, "Name is required").max(120),
  birth_date: dateStr,
  birth_time: str(20),
  birth_vel: str(20),
  kul: str(80),
  education: str(200),
  job_details: str(200),
  job_designation: str(120),
  job_place: str(120),
  job_salary: str(60),
  candidate_cell_no: str(20),
  candidate_email: str(120),
  candidate_address: str(400),
  height_feet: int,
  height_inch: int,
  blood_group: str(10),
  complexion: str(30),
  father_name: str(120),
  father_cell_no: str(20),
  father_place: str(80),
  father_taluka: str(80),
  father_district: str(80),
  father_job_details: str(160),
  mother_name: str(120),
  mother_cell_no: str(20),
  mother_job_details: str(160),
  uncle_name: str(120),
  uncle_cell_no: str(20),
  uncle_place: str(80),
  uncle_taluka: str(80),
  uncle_district: str(80),
  uncle_kul: str(80),
  brother_married: int,
  brother_unmarried: int,
  sister_married: int,
  sister_unmarried: int,
  relations_details: str(500),
  expectation_details: str(500),
  pavati_book_no: str(30),
  pavati_no: str(30),
  renew_date: dateStr,
  show_contact_on_screen: z.boolean().default(false),
  is_active: z.boolean().default(true),
  // string = new/replacement photo, null = remove, missing = keep
  photos: z.object({ "1": photo, "2": photo, "3": photo }).optional(),
});

export type CandidateInput = z.infer<typeof candidateSchema>;

export type Candidate = Omit<CandidateInput, "photos"> & {
  id: number;
  registration_no: string;
  photo_slots: number[];
  photo_v: number;
  created_at: string;
};

export const photoUrl = (c: Pick<Candidate, "id" | "photo_v">, slot: number) =>
  `/api/photos/${c.id}/${slot}?v=${c.photo_v}`;
