// Usage:  npm run db:init        -> creates tables
//         npm run db:seed        -> creates tables + inserts sample profiles
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// tiny .env loader (so no extra dependency is needed)
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing. Copy .env.example to .env.local and paste your Neon connection string.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean);
for (const s of statements) await sql.query(s);
console.log(`✔ Schema ready (${statements.length} statements)`);

if (process.argv.includes("--seed")) {
  const rows = [
    { reg: "B123", d: "2026-03-21", type: "अविवाहित (प्रथम वर)", name: "यज्ञेश निंबा पाटील", dob: "1998-06-10", time: "12:00", vel: "दिवसा", kul: "शंकपाळ", edu: "Diploma in Mech. Engineering", job: "JCB India Pvt. Ltd.", desig: "Quality Dept.", place: "तळेगाव, पुणे", sal: "३.५० लाख", addr: "मु.पो. अजंग ता.जि. धुळे", ft: 5, inch: 10, color: "गोरा", father: "श्री निंबा पोपट पाटील", fcell: "9921161941", fplace: "अजंग", fjob: "शेती", mother: "सौ.मीनाबाई निंबा पाटील", mjob: "गृहिणी", uncle: "श्री अशोक दामू पाटील", uplace: "नंदुरबार", ukul: "सोनवणे", exp: "मनमिळाऊ" },
    { reg: "M0002", d: "2026-03-18", type: "अविवाहित (प्रथम वर)", name: "प्रितेश शरद पंडित", dob: "1996-07-27", time: "12:11", vel: "दिवसा", kul: "पंडित", edu: "Mech. Eng. & L.L.B.", job: "Advocate", desig: "Advocate", place: "", sal: "", addr: "मु.पो. निभोरा ता. जामनेर जि. जळगाव", ft: 5, inch: 9, color: "गोरा", father: "श्री शरद शिवराम पंडित", fcell: "7841822546", fplace: "निभोरा", fjob: "वकिली", mother: "सौ. संजया शरद पंडित", mjob: "गृहिणी", uncle: "श्री विकासराव किसनराव पाटील", uplace: "मोताळा", ukul: "गोघटे", exp: "अनुरूप आणि सुसंस्कृत" },
    { reg: "B1233", d: "2026-03-18", type: "घटस्फोटीत (पुनर्विवाह)", name: "जयेश संतोष पाटील", dob: "1996-08-27", time: "11:17", vel: "दिवसा", kul: "मंडळे", edu: "B.E. Civil class II MPSC", job: "Jalsampada Vibhag Maharashtra Govt.", desig: "Asst. Engineer", place: "नाशिक", sal: "", addr: "१७, आदर्श कॉलनी, देवपूर धुळे", ft: 5, inch: 7, color: "गोरा", father: "श्री संतोष दीपचंद पाटील", fcell: "8888706292", fplace: "कोठली", fjob: "कृषी पर्यवेक्षक", mother: "सौ सुनिता संतोष पाटील", mjob: "", uncle: "श्री पोपटराव शंकर साळुंखे", uplace: "शेवाळी", ukul: "साळुंखे", exp: "B.E., B.Sc., M.Sc., अविवाहित प्राधान्य" },
    { reg: "B1232", d: "2026-03-17", type: "अविवाहित (प्रथम वर)", name: "धिरज रत्नाकर शिंदे", dob: "1995-11-25", time: "11:00", vel: "दिवसा", kul: "शिंदे", edu: "B.A. CNC Operator", job: "Titan Pvt. Ltd.", desig: "Sales Associate", place: "पुणे", sal: "४.२० लाख", addr: "भागीरथी काल्सिक, ८०३, मोशी, पोलीस चौकी समोर, पुणे", ft: 5, inch: 7, color: "गोरा", father: "कै. रत्नाकर कैलासराव शिंदे", fcell: "7058192003", fplace: "कुसुंबा", fjob: "", mother: "सौ उषा बाई रत्नाकर शिंदे", mjob: "", uncle: "श्री. बालुदास भीमराव पाटील", uplace: "कापडणे", ukul: "भामरे", exp: "अनुरूप आणि सुसंस्कृत" },
    { reg: "B1231", d: "2026-03-17", type: "अविवाहित (प्रथम वर)", name: "हितेंद्र महेंद्र पाटील", dob: "1999-02-28", time: "04:54", vel: "रात्री", kul: "देवरे", edu: "B.E. Civil", job: "Building Contractor", desig: "Building Contractor", place: "धुळे", sal: "८.०० लाख", addr: "१३, सर्वेश्वर नगर वाडीभोकर रोड, देवपूर धुळे", ft: 5, inch: 7, color: "गोरा", father: "श्री महेंद्र त्र्यंबक देवरे", fcell: "9860274750", fplace: "वडजाई", fjob: "", mother: "सौ मनिषा महेंद्र देवरे", mjob: "", uncle: "श्री राजेंद्र धर्मराज पाटील", uplace: "मांडळ", ukul: "शिरसाठ", exp: "अनुरूप आणि सुसंस्कृत" },
    { reg: "B1230", d: "2026-03-16", type: "अविवाहित (प्रथम वर)", name: "रोहित रमेश पाटील", dob: "1998-01-21", time: "10:10", vel: "दिवसा", kul: "पवार", edu: "B.Com.", job: "Distinct Digital Media Pvt. Ltd.", desig: "M.I.S. Supervisor", place: "पुणे", sal: "४.८० लाख", addr: "३१२/२००२ संत तुकाराम नगर, पिंपरी, पुणे", ft: 5, inch: 10, color: "गोरा", father: "श्री रमेश नंदराम पाटील", fcell: "9960839402", fplace: "काजीपुरा", fjob: "नोकरी", mother: "सौ वर्षा रमेश पाटील", mjob: "गृहिणी", uncle: "श्री मनोहर पंडित पाटील", uplace: "वेले", ukul: "देसले", exp: "समकक्ष पुणे नोकरी" },
    // fictional bride so the Bride layout can be previewed
    { reg: "V0001", d: "2026-03-22", type: "अविवाहित (प्रथम वर)", gender: "bride", name: "प्रिया सुनील देशमुख", dob: "1999-09-12", time: "07:30", vel: "दिवसा", kul: "देशमुख", edu: "M.Sc. Computer Science", job: "Infosys Ltd.", desig: "Software Engineer", place: "पुणे", sal: "६.०० लाख", addr: "सहकार नगर, पुणे", ft: 5, inch: 4, color: "गोरा", father: "श्री सुनील विठ्ठलराव देशमुख", fcell: "9000000000", fplace: "सातारा", fjob: "शेती", mother: "सौ. वैशाली सुनील देशमुख", mjob: "गृहिणी", uncle: "श्री अनिल विठ्ठलराव देशमुख", uplace: "कराड", ukul: "देशमुख", exp: "सुशिक्षित, नोकरी करणारा, पुणे येथे स्थायिक" },
  ];
  let n = 0;
  for (const r of rows) {
    const exists = await sql.query("SELECT 1 FROM candidates WHERE registration_no=$1", [r.reg]);
    if (exists.length) continue;
    await sql.query(
      `INSERT INTO candidates (registration_no, registration_date, registration_type, gender, candidate_name, birth_date, birth_time, birth_vel,
        kul, education, job_details, job_designation, job_place, job_salary, candidate_address, height_feet, height_inch, complexion,
        father_name, father_cell_no, father_place, father_job_details, mother_name, mother_job_details,
        uncle_name, uncle_place, uncle_kul, expectation_details, pavati_book_no, pavati_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
      [r.reg, r.d, r.type, r.gender ?? "groom", r.name, r.dob, r.time, r.vel, r.kul, r.edu, r.job, r.desig, r.place, r.sal, r.addr, r.ft, r.inch, r.color,
       r.father, r.fcell, r.fplace, r.fjob, r.mother, r.mjob, r.uncle, r.uplace, r.ukul, r.exp, "169", String(9800 + n)]
    );
    n++;
  }
  console.log(`✔ Seeded ${n} sample profiles (delete them from the dashboard whenever you like)`);
}
