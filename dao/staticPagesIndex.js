// Static page index for content that lives in Next.js JSX and is not stored in the database.
// Each entry has: title, keywords (array of searchable terms), snippet, url.
// Add new entries here whenever a static page is added to the public website.

const STATIC_PAGES = [
  // ─── Nursing School & College ──────────────────────────────────────────────
  {
    title: 'Nursing School & College — Overview',
    keywords: [
      'nursing', 'nursing college', 'nursing school', 'nsc', 'gcs nursing',
      'clinical excellence', 'nursing institute', 'hospital based training',
      'jayesh jain', 'gujarat nursing council', 'indian nursing council',
      'gujarat university', 'nursing education', '25 acre campus',
    ],
    snippet: 'A future-ready nursing institute rooted in clinical excellence. GCS Nursing combines academic learning, hospital exposure, modern pedagogy, and professional formation inside the sprawling GCS campus.',
    url: '/nsc-overview',
  },
  {
    title: 'Nursing Courses — GCS School / College of Nursing',
    keywords: [
      'nursing courses', 'nursing programs', 'nursing education',
      'b.sc nursing', 'bsc nursing', 'gnm', 'diploma nursing',
      'critical care nursing', 'operation room nursing', 'nursing pathways',
    ],
    snippet: 'Comprehensive nursing programs including Basic B.Sc. Nursing (4 years), G.N.M. (3 years), Post Basic Diploma in Critical Care Nursing, and Post Basic Diploma in Operation Room Nursing.',
    url: '/nursing-courses',
  },
  {
    title: 'Basic B.Sc. Nursing — GCS School / College of Nursing',
    keywords: [
      'bsc nursing', 'b.sc nursing', 'basic bsc nursing', 'bachelor of science nursing',
      'nursing degree', '4 year nursing', '60 seats nursing', 'gujarat university nursing',
    ],
    snippet: 'Basic B.Sc. Nursing: 4-year undergraduate program with 60 seats, affiliated to Gujarat University Ahmedabad. Full-time English medium nursing degree with hospital-based clinical training.',
    url: '/basic-b-sc-nursing',
  },
  {
    title: 'G.N.M. — General Nursing and Midwifery',
    keywords: [
      'gnm', 'general nursing', 'midwifery', 'general nursing and midwifery',
      'gnm course', '3 year nursing', '40 seats nursing', 'gujarat nursing council gnm',
    ],
    snippet: 'G.N.M. (General Nursing and Midwifery): 3-year diploma with 40 seats, examined by Gujarat Nursing Council. Available in English and Gujarati medium.',
    url: '/gnm',
  },
  {
    title: 'Post Basic Diploma in Critical Care Nursing',
    keywords: [
      'critical care nursing', 'post basic diploma nursing', 'icu nursing',
      'critical care diploma', 'nursing diploma',
    ],
    snippet: 'Post Basic Diploma in Critical Care Nursing: 1-year advanced nursing diploma preparing registered nurses for intensive care and critical care settings.',
    url: '/post-basic-diploma-in-critical-care-nursing',
  },
  {
    title: 'Post Basic Diploma in Operation Room Nursing',
    keywords: [
      'operation room nursing', 'ot nursing', 'operation theatre nursing',
      'post basic diploma nursing', 'surgical nursing',
    ],
    snippet: 'Post Basic Diploma in Operation Room Nursing: 1-year advanced diploma training registered nurses in surgical and operation theatre nursing practice.',
    url: '/post-basic-diploma-in-operation-room-nursing',
  },
  {
    title: 'Nursing Facilities — Labs & Learning Spaces',
    keywords: [
      'nursing facilities', 'nursing lab', 'anatomy lab', 'computer lab nursing',
      'nutrition lab', 'community lab', 'fundamental lab', 'nursing library',
      'simulation lab nursing',
    ],
    snippet: 'Practical learning spaces for clinical confidence including Computer Lab, Library, Nutrition Lab, Anatomy Lab, Community Lab and Fundamental Lab for nursing students.',
    url: '/nsc-facilities',
  },
  {
    title: 'Nursing Admissions — Eligibility & Documents',
    keywords: [
      'nursing admission', 'nursing eligibility', 'nursing application',
      'nursing documents required', 'nursing merit based', 'nursing gujarat',
    ],
    snippet: 'Annual merit-based nursing admissions following Government of Gujarat rules. Required documents include mark sheets, migration certificate, caste certificate, character certificate and transfer certificate.',
    url: '/nsc-admissions',
  },

  // ─── GCS Physiotherapy College ──────────────────────────────────────────────
  {
    title: 'GCS Physiotherapy College — Overview',
    keywords: [
      'physiotherapy college', 'physiotherapy', 'gcs physiotherapy', 'bpt',
      'bachelor of physiotherapy', 'physiotherapy program', 'gujarat university physiotherapy',
      '50 seats physiotherapy', 'physiotherapy ahmedabad',
    ],
    snippet: 'GCS Physiotherapy College offers Bachelor of Physiotherapy (BPT) with 50 seats, affiliated to Gujarat University, with clinical exposure at the 750+ bed GCS Hospital.',
    url: '/gcs-physiotherapy-college',
  },
  {
    title: 'BPT Program — Bachelor of Physiotherapy',
    keywords: [
      'bpt program', 'bpt course', 'bachelor of physiotherapy', 'physiotherapy degree',
      '4.5 year physiotherapy', 'physiotherapy admission', 'physiotherapy fee',
      'physiotherapy eligibility', 'physiotherapy internship',
      'anatomy physiology biomechanics', 'orthopedics neurology physiotherapy',
      'musculoskeletal cardio respiratory',
    ],
    snippet: 'BPT Program: 4.5-year course (4 years + 6-month internship), 50 seats, eligibility 10+2 with Physics Chemistry Biology. Fee Rs. 98,000 as per FRC. Subjects include Anatomy, Physiology, Biomechanics, Orthopedics, Neurology and more.',
    url: '/gcs-physiotherapy-college/bpt-program',
  },
  {
    title: 'Physiotherapy Teaching & Training',
    keywords: [
      'physiotherapy teaching', 'physiotherapy training', 'physiotherapy faculty',
      'physiotherapy clinical training',
    ],
    snippet: 'Teaching and training program at GCS Physiotherapy College providing structured clinical mentoring, faculty-led learning and hands-on hospital exposure.',
    url: '/gcs-physiotherapy-college/teaching-training',
  },

  // ─── GCS Healthcare Academy ──────────────────────────────────────────────
  {
    title: 'GCS Healthcare Academy — Overview',
    keywords: [
      'healthcare academy', 'gcs academy', 'paramedical courses', 'healthcare courses',
      'paramedical training', 'fellowship programmes', 'professional courses',
      'healthcare professional', 'paramedical certificate', 'paramedical diploma',
    ],
    snippet: 'GCS Healthcare Academy offers Fellowship Programmes, Paramedical Courses and Professional Courses across departments to prepare skilled healthcare professionals with live hospital campus training.',
    url: '/healthcare-academy',
  },
  {
    title: 'Fellowship Programmes — Clinical Training',
    keywords: [
      'fellowship programme', 'fellowship training', 'clinical fellowship',
      'biostatistics', 'maternal nutrition', 'childhood nutrition',
      'electrocardiogram ecg fellowship', 'trauma patient fellowship',
      'airway management fellowship', 'laparoscopy fellowship',
      'mbbs fellowship', 'pg resident fellowship',
    ],
    snippet: 'Fellowship programmes for MBBS graduates and PG residents: Biostatistics (3 months), Maternal & Childhood Nutrition, ECG Interpretation, Trauma Management, Airway Management (6 months), Laparoscopy.',
    url: '/fellowship-programme',
  },
  {
    title: 'Paramedical Courses — Diploma & Certificate Programs',
    keywords: [
      'paramedical course', 'paramedical diploma', 'paramedical certificate',
      'ecg echo tmt technology', 'medical lab technology', 'mlt',
      'x-ray ct mri technology', 'radiology technology', 'operation theatre technology',
      'ot technology', 'cssd technician', 'endoscopy technology',
      'infection control nurse',
    ],
    snippet: 'One-year paramedical diploma and certificate programmes including ECG/ECHO/TMT Technology, Medical Lab Technology, X-ray/CT/MRI Technology, Operation Theatre Technology, CSSD, Endoscopy and Infection Control Nurse.',
    url: '/paramedical-course',
  },
  {
    title: 'Professional Courses — Specialised Healthcare Training',
    keywords: [
      'professional courses', 'dialysis technology', 'critical care technology',
      'cardiac care technology', 'physiotherapy assistant', 'dental assistant',
      'healthcare professional courses', 'dialysis technician',
    ],
    snippet: 'Specialised professional courses including Dialysis Technology, Critical Care Technology, Cardiac Care Technology, Physiotherapy Assistant and Dental Assistant diploma and certificates.',
    url: '/professional-courses',
  },

  // ─── Medical College ──────────────────────────────────────────────────────
  {
    title: 'GCS Medical College — About',
    keywords: [
      'medical college', 'gcsmc', 'gcs medical college', 'nmc recognized',
      'national medical commission', 'gujarat university medical',
      'mbbs', 'medical education', 'medical students',
    ],
    snippet: 'GCS Medical College is recognized by the National Medical Commission (NMC) and affiliated with Gujarat University, offering excellence in health education and producing competent healthcare professionals.',
    url: '/medical-college-overview',
  },

  // ─── Hospital Services ──────────────────────────────────────────────────────
  {
    title: 'About GCS Hospital',
    keywords: [
      'gcs hospital', 'nabh accredited', 'nabh hospital', '750 bed hospital',
      'multi specialty hospital', 'teaching hospital', 'pmjay', 'ma empanelled',
      'ahmedabad hospital', 'multispeciality hospital',
    ],
    snippet: 'NABH Accredited (5th Edition) 750-bed Multi-Specialty Teaching Hospital. First private teaching hospital in Ahmedabad to receive NABH accreditation. PMJAY-MA empanelled.',
    url: '/hospital-about',
  },
  {
    title: 'Laboratory Services — Pathology, Biochemistry & Microbiology',
    keywords: [
      'laboratory services', 'lab services', 'pathology', 'hematology',
      'histopathology', 'clinical pathology', 'biochemistry', 'microbiology',
      'blood test', 'lipid profile', 'liver function', 'renal function',
      'tb testing', 'automated lab', '2000 investigations',
    ],
    snippet: 'In-house state-of-the-art laboratory handling 2000+ investigations per day. Departments include Pathology (Hematology, Histopathology), Biochemistry (Lipid profile, Liver/Renal function) and Microbiology (TB testing, Serology).',
    url: '/laboratory-services',
  },
  {
    title: 'Radiodiagnosis Services — Radiology, CT, MRI, X-Ray',
    keywords: [
      'radiodiagnosis', 'radiology', 'ct scan', 'mri', 'x-ray', 'xray',
      'ultrasonography', 'usg', 'doppler', 'mammography', 'breast cancer detection',
      'radiologist', '24x7 radiology', 'angiography', 'mrcp',
    ],
    snippet: '24x7 radiology services including CT Scan (angiography, guided procedures), MRI (brain, spine, pelvis, joints, MRCP), X-Ray, Ultrasonography, Doppler and Mammography.',
    url: '/radiodiagnosis-services',
  },
  {
    title: 'Clinical Services — Emergency, ICU, OT & Specialist Care',
    keywords: [
      'clinical services', 'emergency services', 'icu', 'intensive care unit',
      'operation theatre', 'operation theaters', 'ot', 'physiotherapy rehabilitation',
      'endoscopy', 'cathlab', 'dialysis', 'dietetics', 'audiometry', 'speech therapy',
      '24x7 emergency', '14 operation theatres',
    ],
    snippet: '10 integrated clinical services including 24x7 Emergency, ICU, 14 fully equipped Operation Theatres, Physiotherapy & Rehabilitation, Endoscopy, Cathlab, Dialysis, Dietetics, Audiometry and Speech Therapy.',
    url: '/clinical-services',
  },
  {
    title: 'Support Services — Pharmacy, Blood Bank & Ambulance',
    keywords: [
      'support services', 'pharmacy', '24x7 pharmacy', 'blood bank', 'blood centre',
      'ambulance', 'icu ambulance', 'fda approved blood bank', 'blood component',
      'emergency ambulance',
    ],
    snippet: 'Essential support services: 24x7 in-house pharmacy, FDA-approved blood bank with 100% component separation, and 4 ambulances including 1 ICU-on-wheels with ventilator and defibrillator.',
    url: '/support-services',
  },
  {
    title: 'Hospital Facilities',
    keywords: [
      'hospital facilities', 'facilities', 'hospital infrastructure',
    ],
    snippet: 'Comprehensive hospital facilities supporting patient care, clinical services and academic training at GCS Hospital.',
    url: '/hospital-facilities',
  },

  // ─── Patient Information ──────────────────────────────────────────────────
  {
    title: 'Admission & Discharge Process',
    keywords: [
      'admission process', 'discharge process', 'hospital admission',
      'hospital discharge', 'uhid', 'room selection', 'insurance admission',
      'tpa', 'discharge summary', 'hospital registration',
    ],
    snippet: '6-step admission process: Registration/UHID, Cost Estimate & Room Selection, Advance Payment, Insurance/TPA, Escort to Room, Care Begins. Discharge includes summary, billing and document handover.',
    url: '/admission-discharge-process',
  },
  {
    title: 'Patient Rights & Responsibilities',
    keywords: [
      'patient rights', 'patient responsibilities', 'patient privacy',
      'patient dignity', 'informed consent', 'patient complaints',
      'patient safety', 'financial transparency', 'patient confidentiality',
    ],
    snippet: 'Patient rights at GCS Hospital cover Accessibility, Information & Communication, Decision-Making, Respect & Dignity, Privacy & Confidentiality, Financial Transparency, Complaints & Feedback, and Safety & Security.',
    url: '/patients-rights-responsibility',
  },
  {
    title: 'General Speciality OPD Timings',
    keywords: [
      'opd', 'opd timings', 'outpatient', 'opd schedule', 'doctor timings',
      'general opd', 'specialist opd',
    ],
    snippet: 'GCS Hospital general speciality OPD timings and schedule for outpatient consultations across all speciality departments.',
    url: '/general-speciality-opd',
  },
  {
    title: 'Hospital Directory',
    keywords: [
      'hospital directory', 'hospital contact', 'department contact',
      'hospital phone', 'hospital location',
    ],
    snippet: 'GCS Hospital department directory with contact numbers and locations for all departments and services.',
    url: '/hospital-directory',
  },
  {
    title: 'Unsure of Your Speciality?',
    keywords: [
      'unsure speciality', 'which doctor', 'which speciality', 'find speciality',
      'symptoms checker', 'which department',
    ],
    snippet: 'Not sure which speciality or doctor to visit? Use this guide to find the right department at GCS Hospital based on your symptoms.',
    url: '/unsure-of-the-speciality',
  },

  // ─── Research ─────────────────────────────────────────────────────────────
  {
    title: 'Institution Ethical Committee',
    keywords: [
      'ethics committee', 'ethical committee', 'institution ethical committee',
      'clinical trials ethics', 'ba be studies', 'bioavailability bioequivalence',
      'biomedical research ethics', 'health research ethics', 'irb',
      'research approval', 'research compliance', 'ethics documents',
    ],
    snippet: 'Official ethics committee documents and guidelines for clinical trials, BA/BE studies, biomedical research, and health research at GCS Medical College.',
    url: '/institution-ethical-committee',
  },
  {
    title: 'Clinical Trials & BA/BE Studies — Ethics Committee',
    keywords: [
      'clinical trials', 'ba be studies', 'bioavailability', 'bioequivalence',
      'trial standards', 'drug testing', 'pharmaceutical research',
      'ethics approval clinical trials', 'clinical research guidelines',
    ],
    snippet: 'Ethics committee PDF guidelines for conducting clinical trials and bioavailability/bioequivalence (BA/BE) studies at the institution.',
    url: '/institution-ethical-committee/clinical-trials-ba-be',
  },
  {
    title: 'Biomedical & Health Research — Ethics Committee',
    keywords: [
      'biomedical research', 'health research', 'research protocols',
      'research ethics biomedical', 'institutional guidelines research',
      'research compliance', 'scientific research approval', 'research standards',
    ],
    snippet: 'Ethics committee guidelines and documentation for biomedical and health research projects including protocols, approvals, and research compliance standards.',
    url: '/institution-ethical-committee/biomedical-health-research',
  },
  {
    title: 'Scientific Research Committee',
    keywords: [
      'scientific research committee', 'research committee', 'research committee members',
      'committee designations', 'research leadership', 'research governance',
      'research oversight', 'faculty research committee', 'src',
    ],
    snippet: 'Directory of Scientific Research Committee members and their designations at GCS Medical College, Hospital & Research Centre.',
    url: '/scientific-research-committee',
  },
  {
    title: 'Research Projects',
    keywords: [
      'research projects', 'principal investigator', 'co investigator',
      'research topics', 'faculty research', 'institutional research',
      'research archive', 'research activities', 'medical research projects',
      '2022 research', '2021 research', '2020 research',
    ],
    snippet: 'Year-wise archive of research projects with principal investigator and co-investigator details from GCS Medical College covering 2020, 2021 and 2022.',
    url: '/research-projects',
  },
  {
    title: 'GCSMC Journal of Medical Sciences',
    keywords: [
      'journal', 'gcsmc journal', 'medical sciences journal', 'peer reviewed journal',
      'open access journal', 'biannual journal', 'medical journal', 'research publication',
      'author guidelines', 'editorial board', 'journal indexing', 'contributor form',
    ],
    snippet: 'Biannually published peer-reviewed open access GCSMC Journal of Medical Sciences. Archive of volumes from 2012 to 2022 with editorial board, author guidelines and contributor information.',
    url: '/gcsmc-journal-of-medical-sciences',
  },

  // ─── Committees & Governance ──────────────────────────────────────────────
  {
    title: 'All Committees — GCS Medical College & Hospital',
    keywords: [
      'committees', 'all committees', 'committee directory', 'governance',
      'hospital committee', 'research committee', 'medical college committee',
      'nursing committee', 'clinical governance', 'committee members',
    ],
    snippet: 'Unified directory of all governance, quality, safety, research, and ethics committees across GCS Hospital, Medical College, Research, and Nursing departments.',
    url: '/committees',
  },
  {
    title: 'Hospital Committees',
    keywords: [
      'hospital committee', 'hospital committees', 'clinical governance',
      'quality committee', 'patient safety committee', 'hospital governance',
      'committee members', 'committee directory', 'hospital management committee',
    ],
    snippet: 'Directory of hospital governance committees including members and designations across clinical, quality, safety and patient support functions at GCS Hospital.',
    url: '/hospital-committee',
  },
  {
    title: 'Medical College Committees — GCS Medical College',
    keywords: [
      'medical college committee', 'anti ragging committee', 'anti ragging squad',
      'college council', 'gender harassment committee', 'institutional ethics committee',
      'medical education unit', 'curriculum committee', 'pharmacovigilance committee',
      'animal ethical committee', 'scientific research committee', 'medical college governance',
    ],
    snippet: 'All governance and welfare committees of GCS Medical College including Anti-Ragging, Ethics, Curriculum, Pharmacovigilance, and Scientific Research committees.',
    url: '/medical-college-committee',
  },
  {
    title: 'Nursing Committees — GCS School of Nursing',
    keywords: [
      'nursing committee', 'nursing school committee', 'nursing college committee',
      'admission committee', 'disciplinary committee', 'curriculum committee nursing',
      'sna committee', 'women empowerment cell', 'student counseling committee',
      'health welfare committee', 'sport committee nursing',
    ],
    snippet: 'All committees of GCS School of Nursing covering admissions, curriculum, anti-ragging, student welfare, health, sports, and women empowerment.',
    url: '/nursing-committees',
  },

  // ─── Patient Experience ────────────────────────────────────────────────────
  {
    title: 'Patient Testimonials — GCS Hospital',
    keywords: [
      'patient testimonials', 'patient stories', 'doctor testimonials',
      'patient reviews', 'hospital experience', 'patient feedback',
      'success stories', 'patient care stories', 'recovery stories',
      'patient satisfaction',
    ],
    snippet: 'Real stories of patient care and recovery at GCS Hospital. Video testimonials from patients and doctors across 25+ medical specialities.',
    url: '/hospital-testimonial',
  },
  {
    title: 'Health Checkup Packages',
    keywords: [
      'health checkup', 'checkup package', 'preventive care', 'health screening',
      'wellness program', 'annual checkup', 'health package', 'medical tests',
      'diagnostic package', 'preventive medicine', 'health plan',
    ],
    snippet: 'Preventive health checkup packages and wellness screening programs available at GCS Hospital with comprehensive diagnostic tests and health plans.',
    url: '/health-checkup',
  },

  // ─── Careers & Donation ───────────────────────────────────────────────────
  {
    title: 'Careers at GCS — Job Opportunities',
    keywords: [
      'careers', 'jobs', 'job opportunities', 'hospital careers', 'employment',
      'gcs womaniya', 'work at gcs', 'employee benefits', 'hiring',
      'recruitment', 'job openings', 'career growth', 'working at gcs hospital',
    ],
    snippet: 'Explore career opportunities, employee benefits, workplace culture, GCS Womaniya initiative, and current job openings at GCS Medical College, Hospital & Research Centre.',
    url: '/career',
  },
  {
    title: 'Donate — Support Needy Patients',
    keywords: [
      'donation', 'donate', 'charitable giving', 'tax benefit donation',
      'tax exemption', 'csr', 'corporate social responsibility',
      'charitable trust donation', 'fundraising', 'support patients',
      'ngo donation', 'income tax exemption', 'charitable', 'charitable endeavors',
      'nominal cost', 'walks of life', 'charitable focus',
    ],
    snippet: 'Support needy patients at GCS Hospital through donations with income tax exemption benefits. GCS serves all walks of life at nominal cost through charitable endeavors.',
    url: '/donation',
  },

  // ─── Contact ──────────────────────────────────────────────────────────────
  {
    title: 'Contact Us — GCS Hospital & Medical College',
    keywords: [
      'contact', 'contact us', 'phone number', 'email', 'hospital address',
      'location', 'campus address', 'contact form', 'inquiry',
      'emergency helpline', 'get in touch', 'hospital contact',
    ],
    snippet: 'Contact information, inquiry form, hospital location, campus address, emergency helplines and directories for GCS Hospital and Medical College.',
    url: '/contact-us',
  },

  // ─── Events & Awards ──────────────────────────────────────────────────────
  {
    title: 'Events & Activities',
    keywords: [
      'events', 'activities', 'hospital events', 'college events',
      'seminars', 'conferences', 'workshops', 'academic events',
      'campus activities', 'institutional events', 'event calendar',
    ],
    snippet: 'Year-wise calendar of events and activities at GCS Medical College, Hospital & Research Centre including institutional events, seminars, conferences and campus activities.',
    url: '/events-activities',
  },
  {
    title: 'Awards & Accolades',
    keywords: [
      'awards', 'accolades', 'recognition', 'hospital awards', 'academic awards',
      'excellence award', 'achievements', 'honors', 'national excellence award',
      'safe secure hospital award', 'quality brand award',
    ],
    snippet: 'Awards and recognition received by GCS Medical College, Hospital & Research Centre for clinical excellence, education quality and institutional achievements.',
    url: '/awards-accolades',
  },

  // ─── Home Page ────────────────────────────────────────────────────────────
  {
    title: 'GCS Hospital — Home',
    keywords: [
      'charitable', 'charitable endeavors', 'charitable focus', 'charitable hospital',
      'nominal cost', 'walks of life', 'spectrum of services', 'diagnostic therapeutic',
      'prevention rehabilitation', 'medical surgical care', 'one roof',
      'gujarat cancer society hospital', 'multi specialty hospital',
      'nabh accredited hospital', 'best expertise', 'patient first',
      'service excellence', 'healthcare trust', '1 million patients',
      '750 beds', '300 specialists', 'state of the art facilities',
    ],
    snippet: 'Managed by Gujarat Cancer Society, GCS Hospital serves patients from all walks of life at nominal cost with state-of-the-art facilities, best medical expertise, research, education, and charitable endeavors.',
    url: '/',
  },

  // ─── Institution & About ──────────────────────────────────────────────────
  {
    title: 'Overview — GCS Medical College, Hospital & Research Centre',
    keywords: [
      'overview', 'gcs overview', 'about gcs', 'gcs hospital overview',
      'healthcare education research', 'vision mission',
      'charitable', 'charitable endeavors', 'nominal cost', 'walks of life',
      'ayushman bharat', 'pmjay', 'free treatment', 'spectrum of services',
    ],
    snippet: 'GCS Hospital today serves patients from all walks of life at nominal cost with the highest standard of services. Charitable endeavors, excellence in healthcare, medical education and research.',
    url: '/overview',
  },
  {
    title: 'History — Gujarat Cancer Society',
    keywords: [
      'history', 'gcs history', 'gujarat cancer society', 'founded 1961',
      'cancer society history', 'legacy', 'heritage', 'established 2011',
    ],
    snippet: 'Gujarat Cancer Society was founded in 1961 as a 50-year-old pioneer charitable trust fighting cancer and transforming healthcare in the region. GCS Medical College established in 2011.',
    url: '/history',
  },
  {
    title: 'Accreditation — NABH & NBE',
    keywords: [
      'accreditation', 'nabh', 'nabh accreditation', 'nbe',
      'national board of examinations', 'drnb', 'urology drnb',
      'medical gastroenterology drnb', 'quality accreditation',
    ],
    snippet: 'NABH Full Accreditation (5th Edition) — first private teaching hospital in Ahmedabad. NBE accreditation for DrNB courses in Urology and Medical Gastroenterology.',
    url: '/accreditation',
  },
  {
    title: 'Gujarat Cancer Society — GCS Foundation',
    keywords: [
      'gujarat cancer society', 'gcs foundation', 'cancer society',
      'charitable trust', 'cancer awareness', 'cancer treatment',
    ],
    snippet: 'Gujarat Cancer Society is a 50-year-old pioneer charitable trust dedicated to fighting cancer and promoting healthcare in Gujarat.',
    url: '/gujarat-cancer-society',
  },
];

module.exports = STATIC_PAGES;
