const { v5: uuidv5 } = require("uuid");
const pool = require("./db");
const { ensureJournalSchema } = require("./journalSchema");

const JOURNAL_ARCHIVE = {
  "journalIssues": [
    {
      "volume": "11",
      "number": "2",
      "duration": "July - December 2022",
      "slug": "vol-11-no-2-jul-dec-2022"
    },
    {
      "volume": "10",
      "number": "2",
      "duration": "July - December 2021",
      "slug": "vol-10-no-2-jul-dec-2021"
    },
    {
      "volume": "10",
      "number": "1",
      "duration": "Jan - June 2021",
      "slug": "vol-10-no-1-jan-jun-2021"
    },
    {
      "volume": "9",
      "number": "2",
      "duration": "July - December 2020",
      "slug": "vol-9-no-2-jul-dec-2020"
    },
    {
      "volume": "9",
      "number": "1",
      "duration": "January - July 2020",
      "slug": "vol-9-no-1-jan-jul-2020"
    },
    {
      "volume": "8",
      "number": "2",
      "duration": "July - December 2019",
      "slug": "vol-8-no-2-jul-dec-2019"
    },
    {
      "volume": "7",
      "number": "2",
      "duration": "July - December 2018",
      "slug": "vol-7-no-2-jul-dec-2018"
    },
    {
      "volume": "7",
      "number": "1",
      "duration": "January - June 2018",
      "slug": "vol-7-no-1-jan-jun-2018"
    },
    {
      "volume": "6",
      "number": "2",
      "duration": "July - December 2017",
      "slug": "vol-6-no-2-jul-dec-2017"
    },
    {
      "volume": "6",
      "number": "1",
      "duration": "January - June 2017",
      "slug": "vol-6-no-1-jan-jun-2017"
    },
    {
      "volume": "5",
      "number": "2",
      "duration": "July - December 2016",
      "slug": "vol-5-no-2-jul-dec-2016"
    },
    {
      "volume": "5",
      "number": "1",
      "duration": "January - June 2016",
      "slug": "vol-5-no-1-jan-jun-2016"
    },
    {
      "volume": "4",
      "number": "2",
      "duration": "July - December 2015",
      "slug": "vol-4-no-2-jul-dec-2015"
    },
    {
      "volume": "4",
      "number": "1",
      "duration": "January - June 2015",
      "slug": "vol-4-no-1-jan-jun-2015"
    },
    {
      "volume": "3",
      "number": "2",
      "duration": "July - December 2014",
      "slug": "vol-3-no-2-jul-dec-2014"
    },
    {
      "volume": "3",
      "number": "1",
      "duration": "January - June 2014",
      "slug": "vol-3-no-1-jan-jun-2014"
    },
    {
      "volume": "2",
      "number": "2",
      "duration": "July - December 2013",
      "slug": "vol-2-no-2-jul-dec-2013"
    },
    {
      "volume": "2",
      "number": "1",
      "duration": "January - June 2013",
      "slug": "vol-2-no-1-jan-jun-2013",
      "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/vol2num1jan2013201810061105002617400.pdf"
    },
    {
      "volume": "1",
      "number": "2",
      "duration": "July - December 2012",
      "slug": "vol-1-no-2-jul-dec-2012",
      "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/vol1julydec2012201810061103164088000.pdf"
    },
    {
      "volume": "1",
      "number": "1",
      "duration": "January - June 2012",
      "slug": "vol-1-no-1-jan-jun-2012",
      "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/vol1janjune2012201810061101080704590.pdf"
    }
  ],
  "journalArticles": {
    "vol-11-no-2-jul-dec-2022": [
      {
        "section": "Editorial",
        "title": "Current Advancement in Management of Osteoarthritis",
        "authors": "H. P. Bhalodia",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/editorial.pdf"
      },
      {
        "section": "Original Article",
        "title": "Comparing the Prognosticative Value of APACHE II and mSOFA Scores in Critically Ill Patients: A Prospective Study",
        "authors": "Sonal K Ginoya, Anjali Bala Bhabhor, Samira Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/1.pdf"
      },
      {
        "section": "Original Article",
        "title": "Malignant Transformation in Mature Cystic Dermoid: A Case Series of 8 Cases",
        "authors": "Bhavana Sontakke (Ingle), Chetana Parekh, Shilpa M Patel, Ruchi Arora",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/2.pdf"
      },
      {
        "section": "Original Article",
        "title": "Secondary Bacterial Infection in Patients with COVID 19 Infections Attending a Tertiary Care Hospital in Ahmedabad",
        "authors": "Urvesh V. Shah, Ayushi K. Patel, Urvashi S. Rana",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/3.pdf"
      },
      {
        "section": "Original Article",
        "title": "Efficacy of ERCP in Case of Choledocholithiasis and Incidence of Pancreatitis",
        "authors": "Zoncy Darji, Nina M Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/4.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study of Clinical Features and Presentation of Patients with Grade I & II Haemorrhoids and Injection Sclerotherapy as a Treatment Modality",
        "authors": "Prashant N Mukadam, Krupali V Kothari, Ashit V Patel, Utsav V Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/5.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on Clinical Profile and Complications of Acute Pancreatitis at a Tertiary Care Centre, Ahmedabad: A Case-Series",
        "authors": "Darshan Parmar, Rakesh A. Makwana",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/6.pdf"
      },
      {
        "section": "Original Article",
        "title": "Dengue and Chikungunya viruses Co infection: A serological based study from tertiary care center, Ahmadabad, India",
        "authors": "Unnati Vaghela, Parul C. Patel, Nidhi G. Sathwra, Palak D. Rao, Dhara J. Modi",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/7.pdf"
      },
      {
        "section": "Original Article",
        "title": "The Study of Rapid Ultrasound in Shock in Patients of Undifferentiated Hypotension Presenting to Emergency Department",
        "authors": "Sonal K Ginoya, Ami Parmar, Samira Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/original-article/8.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Case of Paediatric Non-union of Tibia Treated With Tibialization of Fibula",
        "authors": "Vaibhav Vyas, Mukesh Shah, Nishant Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/case-report/1.pdf"
      },
      {
        "section": "Case Report",
        "title": "Isolated Extramedullary Relapse in the Gastrointestinal Mucosa of a Patient with T cell Lymphoblastic Lymphoma",
        "authors": "Rajan Yadav, Sonia Parikh, Harsha Panchal, Apurva Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/case-report/2.pdf"
      },
      {
        "section": "Case Report",
        "title": "Recurrence Developing 21 Years after Treatment of Breast Cancer",
        "authors": "Vidhi Vagashiya, Maitrik Mehta, Ankita Parikh, Sonal Patel Shah, U. Suryanarayan",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/case-report/3.pdf"
      },
      {
        "section": "Case Report",
        "title": "Anaesthetic Management of Patient with Nephropathy and Multiple Co-Morbid Conditions",
        "authors": "Aayushi Singh, Heena Chhanwal, Nikhil Kacha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/case-report/4.pdf"
      },
      {
        "section": "Case Report",
        "title": "Anesthetic Management in A Patient with Myasthenia Gravis Posted for Thymectomy",
        "authors": "Meet Bhadresh Shah, Heena Chhanwal, Divya Kheskani",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2218/case-report/5.pdf"
      }
    ],
    "vol-10-no-2-jul-dec-2021": [
      {
        "section": "Editorial",
        "title": "Percutaneous Coronary Intervention (PCI)",
        "authors": "Sanjay Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/editorial.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Comparison between Objective Structured Practical Examination and Traditional Practical Examination as an Assessment Tool in Biochemistry",
        "authors": "Ramesh Pradhan, Shubhangi Rathod, Meet Kharsadiya, Dhruvin Tamboli",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/original-article/2202203281231453478240.pdf"
      },
      {
        "section": "Original Article",
        "title": "Severity of acute pancreatitis in COVID pandemic",
        "authors": "Rahul Dhabalia, Vineet Chauhan, Hardik Kakadiya",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/original-article/3202204301135495514420.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical Correlation of Lactate Dehydrogenase Activity with JAK2V617F and FLT3 Mutations in Myeloproliferative Disorders and Acute Myeloid Leukemia: Indian Population",
        "authors": "Helly H. Khatri, Kinjal R. Patel, Jayendra B. Patel, Prabhudas S. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/original-article/4202203281235331447340.pdf"
      },
      {
        "section": "Original Article",
        "title": "Comparison of Efficacy of Dexmeditomidine and Midazolam For Bloodless Surgical Field During Functional Endoscopic Sinus Surgery (FESS) under General Anaesthesia",
        "authors": "Dipti Patel, Heena Chhanwal, Divya Kheskani, Nikhil Kacha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/original-article/5202203281236036554100.pdf"
      },
      {
        "section": "Original Article",
        "title": "An Interventional Study on Knowledge and Practice of Injection Safety and Appropriate Biomedical Waste Disposal among Students of One of the Nursing Colleges, Ahmedabad",
        "authors": "Disha R Geriya, Viral R Dave, Venu R Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/original-article/6202203281238239696980.pdf"
      },
      {
        "section": "Case Report",
        "title": "Wellen's Syndrome (ST-T variant-clinician's dilemma)",
        "authors": "Parth Rana, Dhruv Patel, Rushi Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/case-report/7202203281239479630990.pdf"
      },
      {
        "section": "Case Report",
        "title": "Anaesthetic Management of a Complicated Bilateral Tubo-Ovarian Abscess Posted for Diagnostic Laparoscopy followed by Laparotomy",
        "authors": "Nikhil Kacha, Heena Chhanwal, Divya Kheskani",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/case-report/8202203281241078386700.pdf"
      },
      {
        "section": "Case Report",
        "title": "Spinal Anaesthesia for Caesarean Section in a Morbidly Obese Parturient: A Case Report",
        "authors": "Vaibhav Vyas, Mukesh Shah, Nishant Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/case-report/9202203281242270010770.pdf"
      },
      {
        "section": "Case Report",
        "title": "Anaesthetic Management of a Patient Presented As Acute on Chronic Ruptured Ectopic Pregnancy Posted for Emergency Laparotomy",
        "authors": "Shashank Desai, Prashant Mukadam",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/case-report/10202204301137233999270.pdf"
      },
      {
        "section": "Case Report",
        "title": "Anaesthetic Management of Turner's Syndrome posted for Modified Radical Mastoidectomy",
        "authors": "Ami Patel, Rekha Bhavsar, Pinakin Trivedi",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2818/case-report/11202204301137371188340.pdf"
      }
    ],
    "vol-10-no-1-jan-jun-2021": [
      {
        "section": "Editorial",
        "title": "Patient Safety: A Call for Action in Our Hospitals",
        "authors": "Col Dr. Sunilkumar M Rao",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/editorial.pdf"
      },
      {
        "section": "Original Article",
        "title": "Management Modalities of Choledocholithiasis: Endoscopic Retrograde Cholangiopancreatography Versus Open Common Bile Duct Exploration and Laparoscopic Cholecystectomy",
        "authors": "Zoncy Darji, Nina M Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/2202108240934398516140.pdf"
      },
      {
        "section": "Original Article",
        "title": "Liver Injury in Abdominal Trauma: Management and Association with Other Solid Abdominal Organ Injury",
        "authors": "Prashant Mukadam, Shashank Desai, Mahendra Goswami",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/3202108240938506455860.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Comparison of Glasgow Coma Scale Score with \"Full Outline of Unresponsiveness Scale\" to Predict Outcome of the Patients with Traumatic Brain Injury",
        "authors": "Nikhil Kacha, Heena Chhanwal, Divya Kheskani",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/4202108240943072733260.pdf"
      },
      {
        "section": "Original Article",
        "title": "Incisional Hernia: A Comprehensive Study on the Incidence and Management of Abdominal Incisional Hernia",
        "authors": "Naimish Patel, Shaila Shah, Pravina Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/5202108240947340376250.pdf"
      },
      {
        "section": "Original Article",
        "title": "Ventral and Inguinal Hernia Repair – Polyglactin-910 better than Polypropylene?",
        "authors": "Nikunj Desai, Swati Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/6202108240948456127560.pdf"
      },
      {
        "section": "Original Article",
        "title": "Severity of Deep Vein Thrombosis in COVID Pandemic",
        "authors": "Urvesh V. Shah, Neha Patel, Afroz Bloch",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2106/original-article/7202108240949445333400.pdf"
      }
    ],
    "vol-9-no-2-jul-dec-2020": [
      {
        "section": "Review Article",
        "title": "SARS CoV-2 & COVID-19 Pandemic",
        "authors": "Asha N. Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/review-article.pdf"
      },
      {
        "section": "Original Article",
        "title": "Prevalence of Helicobacter Pylori in Perforated Peptic Ulcer Cases",
        "authors": "Neeraja Barve, Hansa Goswami, Urvi Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/2202103091344095926940.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study of Cases of Gall Bladder Perforation during COVID-19 Pandemic",
        "authors": "Prashant Mukadam, Shashank Desai",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/3202103091344282238130.pdf"
      },
      {
        "section": "Original Article",
        "title": "Evaluation of Thyroid Lesions by Fine Needle Aspiration Cytology",
        "authors": "Darshan Parmar, Rakesh Makwana, Naimish Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/4202103091344450003350.pdf"
      },
      {
        "section": "Original Article",
        "title": "Helicobactor Pylori Prevalence in Population & Rationale of Empirical Hp-Kit Therapy",
        "authors": "Asha Purohit, S. M. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/5202103091345072218630.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study of Metastatic Lymph Node Ratio and Staging of Tumor",
        "authors": "Neeraja Barve, Hansa Goswami",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/6202103091345230595140.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Clinical Profile of Patients Treated with Hydrocolloid Based Dressing Materials",
        "authors": "Viral Dave, Venu Shah, Arpit Prajapati",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/7202103091345447827200.pdf"
      },
      {
        "section": "Original Article",
        "title": "Haematological and Vascular Abnormalities in Hyperhomocysteinemia",
        "authors": "Nikunj Desai, Swati Shah, Zalak Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/original-article/8202103091346105840350.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Rare Case of Leiomyosarcoma of Lung",
        "authors": "Vaibhav Vyas, Mukesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/case-report/9202103091346266681980.pdf"
      },
      {
        "section": "Case Report",
        "title": "Case Report on Adrenocortical Carcinoma",
        "authors": "Vibha Patel, Anjali Goyal, Nailesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/case-report/10202103091346464061040.pdf"
      },
      {
        "section": "Case Report",
        "title": "Billiary Intraductal Papillary Neoplasm with Adenocarcinoma",
        "authors": "Neeraja Barve, Hansa Goswami, Biren Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/case-report/11202103091347068475940.pdf"
      },
      {
        "section": "Case Report",
        "title": "Primary Neuroendocrine Carcinoma at an Unusual site",
        "authors": "Heena Chhanwal, Divya Kheskani, Nikhil Kacha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/case-report/12202103091347191578200.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Rare case of Boerhaave Syndrome with Bilateral Empyema",
        "authors": "Shashank Desai, Prashant Mukadam",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-2036/case-report/13202103091347326239140.pdf"
      }
    ],
    "vol-9-no-1-jan-jul-2020": [
      {
        "section": "Editorial",
        "title": "Quality in Medical Practice (As I View It)",
        "authors": "Baldev S. Prajapati",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/1202010170959365232670.pdf"
      },
      {
        "section": "Review Article",
        "title": "Role of Procalcitonin as a Diagnostic Biomarker of Bacterial Sepsis and a Guide to Decide Antibiotic Therapy",
        "authors": "Ramesh Pradhan, Yagnya Dalal, Yash Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/review-article/2202010171001328845080.pdf"
      },
      {
        "section": "Original Article",
        "title": "Myeloid Sarcoma: Case series and Literature Review",
        "authors": "Asha Purohit, Kinjal Patel, S. M. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/original-article/3202010171003052266710.pdf"
      },
      {
        "section": "Original Article",
        "title": "A study on Prevalence and Determinants of Depression amongst Indian Population during Covid-19 Pandemic lockdown",
        "authors": "Viral Dave, Venu Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/original-article/4202010171005008585000.pdf"
      },
      {
        "section": "Original Article",
        "title": "Impact of CRP Test in Management of COVID-19",
        "authors": "Ami Patel, Rekha Bhavsar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/original-article/5202010171005377491600.pdf"
      },
      {
        "section": "Original Article",
        "title": "An Observational Study of Hyponatremia in ICU Patients in a Tertiary Care Hospital of Ahmedabad",
        "authors": "Naimish Patel, Shaila Shah, Pravina Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1990/original-article/6202010171006239939510.pdf"
      },
      {
        "section": "Case Report",
        "title": "Management of Chronic pain, in a Patient of Malignant Peripheral Nerve Sheath Tumor",
        "authors": "Heena Chhanwal, Divya Kheskani"
      },
      {
        "section": "Case Report",
        "title": "Hairy Cell Leukemia – A Case Report",
        "authors": "Manisha Dhamecha, Urvesh Shah"
      },
      {
        "section": "Case Report",
        "title": "Primary Myelofibrosis – A Case Report",
        "authors": "Kinjal Patel, Asha Purohit, Jayendra Patel"
      },
      {
        "section": "Case Report",
        "title": "Diffuse Large B-Cell Lymphoma – A Case Report",
        "authors": "Neeraja Barve, Hansa Goswami, Biren Parikh"
      }
    ],
    "vol-8-no-2-jul-dec-2019": [
      {
        "section": "Review Article",
        "title": "Prescribing in Elderly: A Science and an Art",
        "authors": "Mahadev Desai, Urman Dhruv",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/1202002180957586795230.pdf"
      },
      {
        "section": "Original Article",
        "title": "An observational study of Dengue Induced Hepatic Dysfunction in a tertiary care hospital of Ahmedabad",
        "authors": "Urvesh Shah, Neha Patel, Afroz Bloch",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/2202002181216599928000.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Functional and Radiological Outcome of Intertrochanteric Fractures of Femur Treated with Ender's Nails and Cannulated Cancellous Screws",
        "authors": "Janak Mistry, Rajesh Solanki",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/3202002181208070591920.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Safety and Efficacy of Ultrasound Guided Transthoracic Tru-Cut Biopsy of Lung Mass",
        "authors": "Nikunj Desai, Swati Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/4202002181208352575930.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of outcome of Shoelace Meshplasty in large midline Incisional Hernias",
        "authors": "Prashant Mukadam, Shashank Desai, Mahendra Goswami",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/5202002181209177132830.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Role of Nodovenous shunt in Lower limb Lymphedema",
        "authors": "Himanshu Soni, Tapan Varlekar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/6202002181210052055060.pdf"
      },
      {
        "section": "Original Article",
        "title": "Rives Stoppa Repair: Are Subcutaneous Drains Really Necessary?",
        "authors": "Nailesh Shah, Anjali Goyal",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/7202002181210272429990.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Different Presentation and Varied Diagnostic Modalities of Parathyroid Adenoma and an Emerging Role of 4D-CT Scan",
        "authors": "Rushi Patel, Viral Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/8202002181210529889860.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Various Drugs in Aberrations of Normal Development and Involution and Fibroadenosis",
        "authors": "Hemaxi Desai, Surohi Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/9202002181008080633190.pdf"
      },
      {
        "section": "Original Article",
        "title": "Chronic Obstructive Pulmonary Diseases and Co-morbidities: A Cross-sectional Study",
        "authors": "Neeraja Barve, Hansa Goswami, Urvi Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/original-article/10202002181211145462660.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Case Study of Physiotherapy following Re-operative distal Tibial-fibular Extra-articular Fracture",
        "authors": "Kinjal Shah, Bhavesh Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1628/case-report/11202002181211365182690.pdf"
      }
    ],
    "vol-7-no-2-jul-dec-2018": [
      {
        "section": "Original Article",
        "title": "Sonographic Measurement of Inferior Vena Cava Diameters and Its Usefulness during Resuscitation of Patients with Trauma",
        "authors": "Sonal Ginoya, Samira Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1547/original-article/1201905280947082774350.pdf"
      },
      {
        "section": "Original Article",
        "title": "Evaluation of \"rapid urease test performed on broth of blood culture bottles indicated positive by automated blood culture system\" – as a tool for early diagnosis of brucellosis",
        "authors": "Urvesh Shah, Neha Patel, Afroz Bloch, Manisha Dhamecha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1547/original-article/2201905280949508359480.pdf"
      },
      {
        "section": "Original Article",
        "title": "Role of NT-Pro BNP Estimation In Patients with Acute Dyspnoea presenting to Emergency Department",
        "authors": "Naimish Patel, Shaila Shah, Pravina Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1547/original-article/3201905280952283492190.pdf"
      },
      {
        "section": "Original Article",
        "title": "Knowledge, Attitude and Practices of adult immunization among resident doctors in Ahmedabad city, Gujarat",
        "authors": "Viral Dave, Venu Shah, Arpit Prajapati",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1547/original-article/4201905280953123116340.pdf"
      },
      {
        "section": "Case Report",
        "title": "Primary Non Hodgkin Lymphoma Cervix – A Rare Case Report",
        "authors": "Ruchi Arora, Shilpa Patel, Vandana Sinha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1547/case-report/5201905281011434010940.pdf"
      }
    ],
    "vol-7-no-1-jan-jun-2018": [
      {
        "section": "Editorial",
        "title": "Diabetes Management in India – From Ivory Towers to Ground Reality",
        "authors": "Asha N. Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/1201810051445305476960.pdf"
      },
      {
        "section": "Original Article",
        "title": "Evaluation of Sensitivity and Specificity of Napsin A and P40 in Non Small Cell Lung Cancer Patients",
        "authors": "Devisha Mavan, Priti Trivedi, Kruti Rajvik, Nupur Patel, Hemangini Vora",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/evaluationofsensitivity201810051629391533470.pdf"
      },
      {
        "section": "Original Article",
        "title": "A study on Assessment of Knowledge and Attitude towards First Aid in Road Traffic Accidents among College Students of Ahmedabad city, India",
        "authors": "Utkarsh Chandra, Urvi Patel, Vidit Gadoya, Vincy Gandhi, Vidhi Modh, Vaidehee Chaudhary",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/astudyonassessmentofknowledge201810051629152579800.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on the Myths and Misconceptions of Diabetes Mellitus among Diabetic Patients Attending Tertiary Care Institute of Ahmedabad City, Gujarat",
        "authors": "Akshadha Easwar, Aditya Gaudani, Aarohi Gandhi, Milav Patel, Donald S. Christian",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/astudyonthemythsandmisconceptions201810051628546408010.pdf"
      },
      {
        "section": "Original Article",
        "title": "Expression of Multidrug Resistance (MDR) genes in Lung Cancer",
        "authors": "Disha Jethva, Urja Desai, Jigna Joshi, Apexa Raval, Franky Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/expressionofmultidrugresistance201810051628349346740.pdf"
      },
      {
        "section": "Original Article",
        "title": "Impact of Early Palliative Care on Quality of Life of Patients with Advanced Stage of Carcinoma Cervix: A Prospective Observational Study",
        "authors": "Priti R Sanghavi, Bhavna C Patel, Shrenik P Ostwal, Richa Singh, Himanshu Patel, Queenjal Anandi",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/impactofearlypalliativecare201810051626404731270.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on Knowledge and Practice about Cervical Cancer among nursing staff of one of the tertiary care Hospital in Ahmedabad, India",
        "authors": "Visharg V Thakar, Yash D Patel, Vishva K Rajpuria, Yash R Patel, Yash K Patel, Yashvi S Patwa",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/original-article/astudyonknowledgeandpractice201810051625599538090.pdf"
      },
      {
        "section": "Case Report",
        "title": "Multiple Osseous Metastases in Malignant Phyllodes Tumor",
        "authors": "Muhammed Ali Azher BM, Shikha Dhal, Maitrik Mehta, Ankita Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/case-report/multipleosseousmetastasesinmalignant201810051630567147830.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Worm in Gall bladder – Victorious or Vanquished? : Diagnostic Dilemma Prevails",
        "authors": "Afroz Y Bloch, Neha Patel, Jaimish Gajjar, Urvesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/case-report/awormingallbladder201810051630348695340.pdf"
      },
      {
        "section": "Case Report",
        "title": "Malposition of Central Venous Catheter in Paediatric Patient: A Case Report",
        "authors": "Saumil Desai, Vibhal Parmar, Kushal Makwana, Jitendra Rathva",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1231/case-report/malpositionofcentralvenous201810051630192756420.pdf"
      }
    ],
    "vol-6-no-2-jul-dec-2017": [
      {
        "section": "Editorial",
        "title": "Nosocomial Infections (NIs) or Hospital Acquired Infections (HAIs)",
        "authors": "Urvesh V Shah, Neha Patel, Viral Dave",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/1201810051717143140360.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical and Electrophysiological Abnormalities amongst the Patients of Diabetic Truncal Polyneuropathy",
        "authors": "Chilvana Patel, Surya Murthy Vishnubhakat",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/original-article/2201810051718074450750.pdf"
      },
      {
        "section": "Original Article",
        "title": "Outcome of only posterior approach in acetabular fractures involving both columns",
        "authors": "Piyush Mittal, Sandip Rathod, Amit Kumar, Parth Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/original-article/3201810051717542563210.pdf"
      },
      {
        "section": "Original Article",
        "title": "Knowledge of Emergency Medical Management among Medical Students",
        "authors": "Krutarth Pandya, Khushali Parikh, Krishna Khamar, Krupali Kothari, Khushbu Sagparia",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/original-article/4201810051717407225470.pdf"
      },
      {
        "section": "Original Article",
        "title": "Electrodiagnostic Variations in Guillain-Barre Syndrome – Retrospective Analysis of 95 Patients",
        "authors": "Chilvana Patel, Surya Murthy Vishnubhakat",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/original-article/5201810051717294199000.pdf"
      },
      {
        "section": "Case Report",
        "title": "Acral Metastasis from Carcinoma Lung Presenting As Pathological Fracture of Index Finger",
        "authors": "Saheli Saha, Shikha Dhal, Maitrik Mehta, Ankita Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/6201810051719020682000.pdf"
      },
      {
        "section": "Case Report",
        "title": "Acral Primary Malignant Melanoma of Breast",
        "authors": "Jayesh Singh, Shikha Dhal, Maitrik Mehta, Ankita Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/7201810051719127758120.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Case of Bilateral Ovarian Dermoid Cysts",
        "authors": "Urvi Prajapati, Jalashree Rana, Rajul Shah, Cherry Shah, Nailesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/8201810051719209832810.pdf"
      },
      {
        "section": "Case Report",
        "title": "Adrenocortical Carcinoma",
        "authors": "Vibha Patel, Anjali Goyal, Nailesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/9201810051719340770300.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Case of Glioblastoma Multiforme in a Known Case of Breast Carcinoma",
        "authors": "Seva Makwana, Drashti Thakkar, Rajul Shah, Preeti Jhaveri, Cherry Shah, Nailesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/10201810051718422180640.pdf"
      },
      {
        "section": "Case Report",
        "title": "Sweet's Syndrome – An Interesting Skin Lesion",
        "authors": "Devang Patel, Yukti Shah, Hinal Gajjar, Nailesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1230/case-report/11201810051718264681630.pdf"
      }
    ],
    "vol-6-no-1-jan-jun-2017": [
      {
        "section": "Editorial",
        "title": "Management Tips of Epilepsy: A Clinician's Guide",
        "authors": "Sudhir V Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/1201810051318046053770.pdf"
      },
      {
        "section": "Original Article",
        "title": "Results of Proximal Femoral Nail in Intertrochanteric Fracture of Femur",
        "authors": "Janak H. Mistry, Rajesh A. Solanki",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/results-of-proximal-femoral-nail-in-intertrochanteric-fracture-of-femur201810051328271341340.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinico - Laboratory Profile of Enteric fever in Children",
        "authors": "Aditya M Patel, Nisargi S Patel, Vishwang M Patel, Sachin M Darji",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/clinico-gco-laboratory-profile-of-enteric-fever-in-children201810051327433746540.pdf"
      },
      {
        "section": "Original Article",
        "title": "Recurrent Pyrexia, Brucellosis, Underdiagnosis: The Puzzle Triad Untangled By Blood Cultures",
        "authors": "Urvesh V. Shah, Manisha N. Dhamecha, Neha Patel, Afroz Bloch, Shivani Mehta, Shruti Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/recurrent-pyrexia-brucellosis-underdiagnosis-the-puzzle-triad201810051326044850330.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Cross Sectional Study to Assess the Non-Adherence to Anti-Tuberculosis Treatment and Determinant Factors",
        "authors": "Harshul Gohel, Gopika Patel, Esha Shah, Harvy Shah, Harmony Dholakia, Harsh Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/a-cross-sectional-study-to-assess-the-non-adherence-to-anti-tuberculosis201810051325310695330.pdf"
      },
      {
        "section": "Original Article",
        "title": "Role of CO2 laser and Diode laser in ENT diseases",
        "authors": "Nipa Dalal, Urvish Shah, Ajay Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/role-of-co-laser-and-diode-laser-in-ent-diseases201810051324378031210.pdf"
      },
      {
        "section": "Original Article",
        "title": "Skin Adnexal Tumors – A Histopathological Spectrum at a Tertiary Care Hospital",
        "authors": "Neeraja Barve, Hansa Goswami, Urvi Parikh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/skin-adnexal-tumors-a-histopathological-spectrum-at-a-tertiary-care-hospital201810051323429518030.pdf"
      },
      {
        "section": "Original Article",
        "title": "XRCC2 and XRCC3 Polymorphisms and Breast Cancer – A Case-Control Study from West India",
        "authors": "Kinjal D. Patel, Shruti R. Patel, Kinjal R. Patel, Bhoomi V. Tarapara, Jayendra B. Patel, Franky D. Shah, Prabhudas S. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/xrcc2-and-xrcc3-polymorphisms-and-breast-cancer-gco201810051322508808770.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical Significance of FLT-3 Internal Tandem Duplication and D835 Mutations in Acute Myeloid Leukemia Patients",
        "authors": "Sabrina N. Pathan, Kinjal R. Patel, Asha Anand, Prabhudas S. Patel, Jayendra B. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/clinicalsignificance201810061134441657730.pdf"
      },
      {
        "section": "Original Article",
        "title": "Protein Expression of p53 and CD44 in Patients with Cancer of Buccal Mucosa",
        "authors": "Trupti Trivedi, Suresh Prajapati, Toral Kobawala, Nandita Ghosh, Prabhudas Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/original-article/protein-expression-of-p53-and-cd44-in-patients-with-cancer-of201810051320255620420.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Sole t(10;19)(p11.2;p12) in AML-ETO negative AML-M2 paediatric patient: First novel case from India",
        "authors": "Pina J. Trivedi, Dharmesh M. Patel, Manisha M. Brahmbhatt, Ankita S. Sugandhi, Hiral S. Patel, Prabhudas S. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1229/case-report/a-sole-t1019p112p12-in-aml-eto-negative-aml-m2-paediatric201810051329433077780.pdf"
      }
    ],
    "vol-5-no-2-jul-dec-2016": [
      {
        "section": "Editorial",
        "title": "Role of Medical Education in Cancer Control",
        "authors": "Pankaj M. Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/role-of-medical-education-in-cancer-control201810051638462316380.pdf"
      },
      {
        "section": "Original Article",
        "title": "Quality Control of Antimicrobial Susceptibility Tests",
        "authors": "Falguni V. Patel, Mahendra Vegad, P.K Shah, Kruti Tanna",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/quality-control-of-antimicrobial-susceptibility-tests201810051640561770700.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinico-Laboratory Profile of Vitamin B12 Deficiency in Children",
        "authors": "Anuya Chauhan, Gargi Pathak, Mausam Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/clinico-laboratory-profile-of-vitamin-b-deficiency-in-children201810051640401431530.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Results of Unreamed Tibia Interlocking Nail in Open Tibia Fractures",
        "authors": "Pratik Vinchhi, Hiren Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/study-of-results-of-unreamed-tibia-interlocking-nail-in-open201810051640235122020.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Pattern of Donor Deferral in Tertiary Hospital Blood Bank of India",
        "authors": "Asha Purohit, Arpit Gohel, S. M. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/denorpatt201810061129129278280.pdf"
      },
      {
        "section": "Original Article",
        "title": "Incidence of Internal Mammary Nodes in Locally Advanced Breast Cancer and its Prognostic Significance",
        "authors": "Himanshu C. Soni, Tapan P. Varlekar, Mehul Pateliya, Rahil Agrawal, Ankit Sukhadeve",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/incidence201810061130490923280.pdf"
      },
      {
        "section": "Original Article",
        "title": "The Prevalence of Double Cystic Artery: A Cadaveric Study",
        "authors": "Kiran Sidana, H. R. Jadav, Bharat G. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/the-prevalence-of-double-cystic-artery-a-cadaveric-study201810051639338203600.pdf"
      },
      {
        "section": "Original Article",
        "title": "Preemptive Use of Ketamine in Postoperative Pain in Breast Cancer Surgery",
        "authors": "Rekha Solanki, Bhavna Shah, Bipin Patel, Nilesh Goswami, Milan Vaza",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/preemptive-use-of-ketamine-in-postoperative-pain-in-breast201810051639173944200.pdf"
      },
      {
        "section": "Original Article",
        "title": "Short Term Results of Sternal Sparing (Minimal Invasive) Approach in Cardiac Surgery",
        "authors": "Nirav H. Panchal, Prashant Mukadam, Vinod G. Agrawal",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1228/original-article/shorttermresults201810061109266629770.pdf"
      }
    ],
    "vol-5-no-1-jan-jun-2016": [
      {
        "section": "Review Article",
        "title": "The Use of Imaging Modalities in Diagnosing Parkinson's Disease",
        "authors": "Zain Badar, AhsanUddin, Zaid Iqbal, Saad Jamal, Harpreet Singh",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/review-article/the-use-of-imaging-modalities-in-diagnosing-parkinsons-disease201810051235598888480.pdf"
      },
      {
        "section": "Review Article",
        "title": "Retinoblastoma: The Past, Present and the Future of the Disease",
        "authors": "Himanshu C Soni, Rasesh R Vyas, Rahil D Agrawal, Tapan P Varlekar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/review-article/retinoblastoma-the-past-present-and-the-future-of-the-disease201810051235113167830.pdf"
      },
      {
        "section": "Review Article",
        "title": "Influenza Vaccination – When and Why – An Analysis of Current Practice and Recommendation",
        "authors": "Neha A Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/review-article/influenza-vaccination-gcs-when-and-why-gcs201810051234401378460.pdf"
      },
      {
        "section": "Original Article",
        "title": "Comparison of Non-Contact Forehead Infrared Thermometry with Axillary Digital Thermometry in Neonates",
        "authors": "Ami H Patel, Mansi M Patel, Rekha H Bhavsar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/comparison-of-non-contact-forehead-infrared-thermometry-with201810051246138925140.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study of Sensitivity and the Predictive value of Adenosine Deaminase enzyme for Diagnosis of Tuberculosis",
        "authors": "Harshit Acharya, Chirag Chovatia",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/a-study-of-sensitivity-and-the-predictive-value-of-adenosine-deaminase201810051245305529840.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Clinical Profile of Hospitalized Patients Diagnosed With Malaria",
        "authors": "Shaila Jay Shah, Vipul Prajapati, P. P. Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/study-of-clinical-profile-of-hospitalized-patients-diagnosed-with-malaria201810051244438093020.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Profile of Adverse Effects of Anti-Tubercular Drugs",
        "authors": "Amit Dedun, Dharmeshkumar Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/a-profile-of-adverse-effects-of-anti-tubercular-drugs201810051243293676790.pdf"
      },
      {
        "section": "Original Article",
        "title": "Correlation between Vitamin D and HbA1c in Type 2 Diabetic Patients",
        "authors": "Niyati Mehta, Shaila Shah, P. P. Shah, Vipul Prajapati",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/correlation-between-vitamin-d-and-hba1c-in-type-2-diabetic-patients201810051242459072350.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study of 50 Cases in Different Modalities of Treatment of Chronic Pancreatitis",
        "authors": "Apurva G. Shah, Jayesh B. Gohel, Dinesh Sharma, Nainesh B. Patel, Avadh Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/a-study-of-50-cases-in-different-modalities-of-treatment-of201810051241536360540.pdf"
      },
      {
        "section": "Original Article",
        "title": "Role of Computed Tomography Scan in Buccal mucosa Cancer",
        "authors": "Nikunj C Desai, Swati S Shah, Zalak Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/role-of-computed-tomography-scan-in-buccal-mucosa-cancer201810051649591211250.pdf"
      },
      {
        "section": "Original Article",
        "title": "A study of Clinico-Haematological and Therapeutic Profile of Dengue Fever",
        "authors": "Naimish Patel, Niyati Mehta, Pravina Shah, Krupali Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/a-study-of-clinico-haematological-and-therapeutic-profile-of-dengue-fever201810051240188410300.pdf"
      },
      {
        "section": "Original Article",
        "title": "Short Term Clinical Outcome of Arthroscopic Meniscectomy in Post Traumatic Meniscal Tear in Stable Knee in Middle Aged (15-45 Years) Patients",
        "authors": "Hiren Shah, Pratik J Vinchhi, Safal Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/short-term-clinical-outcome-of-arthroscopic-meniscectomy-in-post201810051238449078100.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Clinical Presentation of Amoebic Liver Abscess",
        "authors": "Shashank Desai, Vidhyasagar Sharma",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/study-of-clinical-presentation-of-amoebic-liver-abscess201810051237406559210.pdf"
      },
      {
        "section": "Original Article",
        "title": "Pectoralis Major Myocutaneous Flap in Head and Neck Reconstruction: An Experience in 100 Consecutive Cases",
        "authors": "Gunjan H Shah, Mitul Mistry, Jolly Pandit",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/original-article/pectoralis-major-myocutaneous-flap-in-head-and-neck-reconstruction201810051236514142270.pdf"
      },
      {
        "section": "Case Report",
        "title": "Synchronous Double Malignancy in Previously Kidney Transplant Patient: A Rare Case Report",
        "authors": "Goutam Koushal, Tankshali Rajen, Tripathi Umank",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/case-report/synchronous-double-malignancy-in-previously-kidney-transplant-patient201810051251506940010.pdf"
      },
      {
        "section": "Case Report",
        "title": "Transient Hemiepiphysiodesis by Using a Combination of Guided-Growth Plates and Staples for Correction of Idiopathic Bilateral Genu Valgum",
        "authors": "Ripple Shah, Jyotish Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/case-report/transient-hemiepiphysiodesis-by-using-a-combination-of-guided-growth-plates-and201810051248590884210.pdf"
      },
      {
        "section": "Case Report",
        "title": "Pulmonary Arteriovenous Malformation in Childhood: A Case Report",
        "authors": "Rajdeep Rathod, Arif Vohra, Bela Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/case-report/pulmonary-arteriovenous-malformation-in-childhood-a-case-report201810051247538670580.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Case of Bilateral Medial Medullary Infarction Presented As Quadriplegia",
        "authors": "Mukundkumar V Patel, Dhruvkumar M Patel, D B Chauhan",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1227/case-report/a-case-of-bilateral-medial-medullary-infarction-presented-as-quadriplegia201810051247014946410.pdf"
      }
    ],
    "vol-4-no-2-jul-dec-2015": [
      {
        "section": "Original Article",
        "title": "Urinary Tract Infections in Children: Clinical Profile, Bacteriology and Antibiotic Sensitivity Pattern",
        "authors": "Ami H Patel, Rekha H Bhavsar, Pinakin Trivedi, Shivani R Mehta",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/urinary-tract-infections-in-children-clinical-profile-bacteriology-and201810051228304839040.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical Evaluation of an Outbreak of Epidemic Keratoconjunctivitis",
        "authors": "Hemaxi Desai, Surohi Shah, Aparna Singhal, Sanjeev Prasad",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/clinical-evaluation-of-an-outbreak-of-epidemic-keratoconjunctivitis201810051651424860370.pdf"
      },
      {
        "section": "Original Article",
        "title": "Comparison of Biochemical Markers (Glutathione S Transferase and Glutathione Reductase) in Patients With Habit of Tobacco Consumption and Cancer of Oral Cavity",
        "authors": "Vishal Dave, Suktara Sharma, Mohit Ruparel, Smit Doshi",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/comparison-of-biochemical-markers-glutathione-s-transferase-and201810051227135048360.pdf"
      },
      {
        "section": "Original Article",
        "title": "Holotranscobalamin (HoloTC) – Role of Holotranscobalamin In Early Diagnosis of Vitamin B12 Deficiency State",
        "authors": "Asha Purohit, Kalpen Patel, Prashant Jadav, Sneha Babaria, S.M. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/holotranscobalamin-role-of-holotranscobalamin-in-early201810051226383538360.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on Clinical Profile of Patients with Acute Poisoning",
        "authors": "Mukul Joshi, Divyeshkumar V. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/a-study-on-clinical-profile-of-patients-with-acute-poisoning201810051225463868800.pdf"
      },
      {
        "section": "Original Article",
        "title": "Nongenital Cancers Metastatic to the Ovary: Our Experience",
        "authors": "Ruchi S. Arora, Shilpa M. Patel, Vandana Sinha",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/nongenital-cancers-metastatic-to-the-ovary-our-experience201810051225055229370.pdf"
      },
      {
        "section": "Original Article",
        "title": "Gender Differences in Stress at Work Place among Doctors and Nurses",
        "authors": "Keyur Parmar, Chintan Solanki, Minakshi Parikh, G K Vankar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/gender-differences-in-stress-at-work-place-among-doctors-and-nurses201810051223595081340.pdf"
      },
      {
        "section": "Original Article",
        "title": "Obstructive Uropathy in Gynecologic Malignancy and Value of Percutaneous Nephrostomy",
        "authors": "Pariseema S. Dave, Bijal M. Patel, Himanshu Patel, Meeta H. Mankad",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/original-article/obstructive-uropathy-in-gynecologic-malignancy-and-value-of201810051223177888620.pdf"
      },
      {
        "section": "Case Report",
        "title": "Dural AV Fistula Presenting as Enhancing Tumor like Lesion",
        "authors": "Harpreet Singh, Rajiv Mangla, Evan Babin, Sanjay Mahatma",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/case-report/dural-av-fistula-presenting-as-enhancing-tumor-like-lesion201810051231000807680.pdf"
      },
      {
        "section": "Case Report",
        "title": "Thoracic Actinomycosis in a Paediatric Patient: A Case Report",
        "authors": "Jitesh Raval, Mansi U. Shah, Afroz Bloch",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/case-report/thoracic-actinomycosis-in-a-paediatric-patient-a-case-report201810051230111371340.pdf"
      },
      {
        "section": "Case Report",
        "title": "Ovarian Fibroma Presented As Meigs Syndrome: A Case Report",
        "authors": "Biren Parikh, Pragna Sharma, Swati Parikh, Hrushikesh Surti",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1226/case-report/ovarian-fibroma-presented-as-meigs-syndrome-a-case-report201810051229151357090.pdf"
      }
    ],
    "vol-4-no-1-jan-jun-2015": [
      {
        "section": "Editorial",
        "title": "Pros and Cons of Statin Therapy",
        "authors": "R. K. Dikshit, Sumit Patel, Vipul Chaudhary",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/pros-and-cons-of-statin-therapy201810051158587445900.pdf"
      },
      {
        "section": "Review Article",
        "title": "Recent Modalities in Management of Diabetes mellitus",
        "authors": "Minaxi Shah, Vidhi Thaker, R. K. Dikshit",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/review-article/recent-modalities-in-management-of-diabetes-mellitus201810051200084736520.pdf"
      },
      {
        "section": "Original Article",
        "title": "The Effect of Topical Bupivacaine in Post Tonsillectomy Pain Relief",
        "authors": "Suktara Sharma, Vishal Dave, Bhumi Zalawadia, Sneh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/the-effect-of-topical-bupivacaine-in-post-tonsillectomy-pain-relief201810051214030099690.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical Review: Cerebral Metastases – Variable Appearance on MRI",
        "authors": "Swati Shah, Nikunj Desai, Ajay Upadhyay",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/clinical-review-cerebral-metastases-variable-appearance-on-mri201810051213175486240.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Causality, Preventability and Severity of Cutaneous Adverse Drug Reactions in a Tertiary Care Institute",
        "authors": "Nayan H. Patel, Jigna Padhiyar, Yogesh B. Shah, R. K. Dixit",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/study-of-causality-preventability-and-severity-of-cutaneous-adverse-drug201810051212238552060.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on Success of TOLAC in Previous Ante Partum Vs. Intra Partum Caesarean Delivery",
        "authors": "Pooja Singh, Divyesh Panchal, Jaishree Bamaniya, H.U. Doshi",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/a-study-on-success-of-tolac-in-previous-ante-partum-vs-intra-partum201810051211205888270.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Study on Assessment of Metabolic Syndrome Prevalence among Medical Students, Hospital Staff and Patients",
        "authors": "Naimish Patel, Shaila Shah, Pravina P Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/a-study-on-assessment-of-metabolic-syndrome-prevalence-among201810051210374600700.pdf"
      },
      {
        "section": "Original Article",
        "title": "Study of Diaphyseal Nutrient Foramen in Human Tibia in People of Gujarat",
        "authors": "Shital T. Shah, Kanan P. Shah, Kiran Arora",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/study-of-diaphyseal-nutrient-foramen-in-human-tibia-in-people-of-gujarat201810051206422550800.pdf"
      },
      {
        "section": "Original Article",
        "title": "Enteric Fever in Children – Clinical Profile, Sensitivity Patterns and Response to Antimicrobials",
        "authors": "Hetal N. Jeeyani, Baldev S. Prajapati, Afroz Bloch",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/entericfever-201810061138061823280.pdf"
      },
      {
        "section": "Original Article",
        "title": "Comparative Study of Intrathecal Hyperbaric Bupivacaine and Hyperbaric Bupivacaine with Fentanyl for Quality of Anaesthesia and Duration of Post Operative Pain Relief",
        "authors": "Upasna Bhatia, Sejal Parmar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/comparative-study-of-intrathecal-hyperbaric-bupivacaine-and-hyperbaric201810051204373487710.pdf"
      },
      {
        "section": "Original Article",
        "title": "Revised National Tuberculosis Control Programme: Current Status and Challenges",
        "authors": "Deepali J. Kamdar, Viral D. Shah, Rushi R. Patel, Janak H. Mistry, Dipti J. Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/revised-national-tuberculosis-control-programme-current-status-and-challenges201810051203497391620.pdf"
      },
      {
        "section": "Original Article",
        "title": "A Comparative Study of Venous and Capillary Blood Glucose Levels by Different Methods",
        "authors": "Naimish Patel, Krupali Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/a-comparative-study-of-venous-and-capillary-blood-glucose-levels-by-different-methods201810051202302838340.pdf"
      },
      {
        "section": "Original Article",
        "title": "Diagnostic Approach to Pleural Effusion",
        "authors": "Rushi Patel, Viral Shah, Deepali Kamdar",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/original-article/diagnostic-approach-to-pleural-effusion201810051200521623270.pdf"
      },
      {
        "section": "Case Report",
        "title": "Primary Aneurysmal Bone Cyst of Talus – A Case Report",
        "authors": "Ripple Shah, Jyotish Patel, Mukesh Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/case-report/primary-aneurysmal-bone-cyst-of-talus-a-case-report201810051216539251140.pdf"
      },
      {
        "section": "Case Report",
        "title": "Primary Angiosarcoma of Retroperitoneum: A Case Report",
        "authors": "Krupali Patel, Shantibhai M. Patel, Anupama Dayal",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/case-report/primary-angiosarcoma-of-retroperitoneum-a-case-report201810051216151911670.pdf"
      },
      {
        "section": "Case Report",
        "title": "A Rare Case: Enterococcal Septicaemia Complicating Severe Falciparum Malaria",
        "authors": "Naimish Patel, Shaila Shah, Pravina P Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1225/case-report/a-rare-case-enterococcal-septicaemia-complicating-severe201810051215284364730.pdf"
      }
    ],
    "vol-3-no-2-jul-dec-2014": [
      {
        "section": "Editorial",
        "title": "Medical Audit in Tertiary Care Teaching Hospital – Bane or Boon?",
        "authors": "C B Jani",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1224/medical-audit-in-tertiary-care-teaching-hospital-bane-or-boon201810051137275298620.pdf"
      },
      {
        "section": "Review Article",
        "title": "Correlation of Cytomorphology and Molecular Findings in EGFR+, KRAS+ and ALK+ Lung Carcinomas",
        "authors": "Nilam B Patel, Deepak Joshi, Biren Parikh, Alpa Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1224/review-article/correlation-of-cytomorphology-and-molecular-findings-in-egfr-kras201810051142241122020.pdf"
      },
      {
        "section": "Original Article",
        "title": "Assessment of Breastfeeding Practices: Findings from Urban Slum Area at Ahmedabad City, India",
        "authors": "Viral R Dave, Venu R Shah, K N Sonaliya, Asha K Solanki",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1224/original-article/assessment-of-breastfeeding-practices-findings-from-urban-slum-area-at201810051152299761710.pdf"
      },
      {
        "section": "Original Article",
        "title": "Epidemiological study of Paediatric Seizures and Its Management in Paediatric Emergency Department",
        "authors": "Shruti Sangani, Nilima Shah, Samira Parikh, Mithun Muralikrishna, Viral Patel"
      },
      {
        "section": "Original Article",
        "title": "Study of Accessory Foramen Transversarium in Cervical Vertebrae",
        "authors": "Shital T. Shah, Kiran Arora, Kanan P. Shah"
      },
      {
        "section": "Original Article",
        "title": "Incidence & Predictors of Surgical Site Infections: A study at a Tertiary Care Hospital",
        "authors": "Manisha Dhamecha, Nilesh Chauhan, Ghanshyam Kavathia, Yogesh Goswami, Ketan Gosai"
      },
      {
        "section": "Original Article",
        "title": "Laparoscopic Appendicectomy: Study of 60 Cases done at GCS Medical College, Ahmedabad",
        "authors": "Mahendra Goswami, Shashank Desai, Ajay P. Munshi"
      },
      {
        "section": "Original Article",
        "title": "Comparative study between inj. Ketamine hcl-Midazolam hcl & inj. Fentanyl citrate-Midazolam hcl in Paediatric Patient for Procedural Sedation",
        "authors": "Deepa Jadav, Nita D Gosai, Dipika Patel, Priyadarshini, Rajdip Kubavat, Bipin M Patel"
      },
      {
        "section": "Case Report",
        "title": "A case of Difficult Tracheal Extubation of an Armoured Endotracheal Tube",
        "authors": "Priti M Patel, Bharat Prajapati, Piyush Zankat, Anupama Tomar, Geeta Joshi, Bipin Patel"
      },
      {
        "section": "Case Report",
        "title": "Anaesthetic Management of A Patient for Carotid Endarterectomy",
        "authors": "Rekha Solanki, Nita Gosai, Dipika Patel, Amita Jansari, Bipin Patel, Ravi Umarania, Sameer Parmar"
      }
    ],
    "vol-3-no-1-jan-jun-2014": [
      {
        "section": "Review Article",
        "title": "Clinical trial: A Review",
        "authors": "Apurva Patel, Kirti M Patel",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1223/review-article/clinical-trial-a-review201810051529437832190.pdf"
      },
      {
        "section": "Review Article",
        "title": "Tobacco Control in India: A Dentist's Perspective",
        "authors": "Sandip Ladani, Shilpi Shah, Tejal Sheth, Mihir Shah",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1223/review-article/tobacco-control-in-india-a-dentists-perspective201810051658155635200.pdf"
      },
      {
        "section": "Original Article",
        "title": "Clinical Profile of Children with Celiac Disease in Gujarat",
        "authors": "Baldev S Prajapati, Hetal D Vora, Rajal B. Prajapati"
      },
      {
        "section": "Original Article",
        "title": "A Comparison of EtCO2 and PaCO2 in Laparoscopic Surgery during General Anaesthesia",
        "authors": "Damini S Makwana, Priyanka N Patil, Carolin Smita Kerketta, Dinesh V Ghoghari, B M Patel"
      },
      {
        "section": "Original Article",
        "title": "A Study of Oxidative Stress in Alcoholic Liver Disease",
        "authors": "Ramesh Pradhan, Rosy Lekharu, Rajesh Srivastava, Deependra Sharma"
      },
      {
        "section": "Original Article",
        "title": "Clinical Profile of Postoperative Enterocutaneous Fistulas",
        "authors": "Prashant Mukadam, Shakib Masu, Atisha M. Patel"
      },
      {
        "section": "Original Article",
        "title": "Comparative Study of Pulmonary Function Tests in Smokers and Non-Smokers",
        "authors": "Anand Mistry, Rajula Tyagi, Jaydeep Kagathara, Lopa Vaidya, Urja Dholakiya, Chirag Shah"
      },
      {
        "section": "Original Article",
        "title": "A Study of Interparietal Bone in 105 Human Skulls of Gujarat Population",
        "authors": "Mayuri P. Shah, Sarzoo G. Desai, Sunita Gupta"
      },
      {
        "section": "Original Article",
        "title": "Percutaneous fixation of Calcaneum fractures",
        "authors": "Nimish B. Patel, Neel M. Bhavsar, Nadeem A. Lil"
      },
      {
        "section": "Original Article",
        "title": "Role of laparoscopy in Hydatid cyst disease",
        "authors": "Viral G. Sangani, Dimple A. Mehta, Priyanka Garg, Kishor Jain"
      },
      {
        "section": "Original Article",
        "title": "FNAC of Head and Neck Swellings",
        "authors": "Garima Gupta, D.S. Joshi, Alpa Shah, Minesh Gandhi, N.R. Shah"
      },
      {
        "section": "Original Article",
        "title": "Clinico-Radiological Manifestations of Invasive and Non-Invasive Fungal Infections in Sinuses and Respiratory Tract",
        "authors": "Roopkamal Sidhu, Nirali Mehta, Bhavesh Dharaviya, Harshad Shah, Asutosh Dave, Nirmala Chudasama"
      },
      {
        "section": "Original Article",
        "title": "A Comparative Study of Crystalloid and Colloids as Preloading in Spinal Anaesthesia for Prevention of Hypotension",
        "authors": "Bharti Jalandhara, J.C. Makwana"
      },
      {
        "section": "Original Article",
        "title": "Clinico-Haematological Study of Dengue Cases",
        "authors": "Ashka Kodnani, D.S. Joshi, Alpa Shah, J.M. Shah, N.R. Shah"
      },
      {
        "section": "Original Article",
        "title": "A Study of Lipid Peroxidation and Antioxidant Enzymes in Normal Pregnancy",
        "authors": "Rosy Lekharu, Ramesh Pradhan, Rina Sharma, Deependra Sharma"
      },
      {
        "section": "Original Article",
        "title": "Role of Serum Cardiac Markers in Myocardial Infarction",
        "authors": "Dimple A. Mehta, Vani S. Joshi, Hetal R. Patel"
      },
      {
        "section": "Original Article",
        "title": "Efficacy of Thoracic Epidural Infusion of Ropivacaine Vs Ropivacaine with Fentanyl for Post Thoracotomy Analgesia",
        "authors": "Bindi B Palkhiwala, Pauravi T Bhatt"
      },
      {
        "section": "Original Article",
        "title": "Study of Meconium Aspiration Syndrome in Neonates",
        "authors": "Hetal Vora, Smita Nair"
      },
      {
        "section": "Case Report",
        "title": "Bilateral Facial Lipoatrophy – As Sole Manifestation of Lupus Panniculitis",
        "authors": "Nayan Patel, Jigna Padhiyar, Sadhana Kothari, Yogesh Shah"
      },
      {
        "section": "Case Report",
        "title": "A Rare Case of Polymyositis with Autoimmune Subclinical Hypothyroidism",
        "authors": "Naimish Patel, Shaila Shah, Niyati Mehta, Pravina Shah"
      },
      {
        "section": "Case Report",
        "title": "An Unusual Cause of Breathlessness in a 70 Years Old Man",
        "authors": "Vijaykumar Ingle"
      },
      {
        "section": "Case Report",
        "title": "The Use of Buccal Fat Pad (BFP) As a Pedicled Graft for Cleft Palate Repair",
        "authors": "Gunjan Shah, Mitul Mistry, Jolly Pandit"
      }
    ],
    "vol-2-no-2-jul-dec-2013": [
      {
        "section": "Editorial",
        "title": "The Art of Clinical Medicine... Getting Rusted!!!",
        "authors": "Baldev S. Prajapati",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1222/the-art-of-cliniacl-medicine-getting-rusted201810051722393666280.pdf"
      },
      {
        "section": "Review Article",
        "title": "Chronic Myeloid Leukemia in Childhood",
        "authors": "Apurva A Patel, Kirti M Patel, Akhil Jain",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1222/review-article/chronic-myeloid-leukemia-in-childhood201810051723075952430.pdf"
      },
      {
        "section": "Review Article",
        "title": "Paraneoplastic Syndromes",
        "authors": "Apurva A Patel, Kirti M Patel, Akhil Jain",
        "pdfUrl": "https://www.gcsmc.org/assets/pdf/journal/journal-1222/review-article/paraneoplastic-syndromes201810051722566456170.pdf"
      },
      {
        "section": "Original Article",
        "title": "Fine Needle Aspiration Cytology in A Palpable Breast Lump",
        "authors": "Puja B. Jarwani, Daxita C. Patel, Shantibhai M. Patel, Anupama Dayal"
      },
      {
        "section": "Original Article",
        "title": "Clinical Study of Efficacy of Topical Tacrolimus in Various Dermatoses",
        "authors": "Jigna Padhiyar, Krina B. Patel, Nayan Patel, Kishan Ninama, Yogesh B. Shah"
      },
      {
        "section": "Original Article",
        "title": "A cadaveric study of origin of inferior phrenic artery from celiac trunk",
        "authors": "Bharat G Patel, Prakash Gosai, Ritesh K Shah, Sanjay D Kanani"
      },
      {
        "section": "Original Article",
        "title": "Study of Intestinal Parasitic Infection in HIV Infected Patients",
        "authors": "S.M. Darji, J.D. Pethani, P.D. Shah, M.T. Kadam"
      },
      {
        "section": "Original Article",
        "title": "A Comparative Study of Semi Quantitative Latex Agglutination Test and Quantitative Turbidimetric Immunoassay Method for the Detection of C-Reactive Protein from Human Sera",
        "authors": "Manisha N. Dhamecha, Mayurika K. Patel, Urvesh V. Shah"
      },
      {
        "section": "Original Article",
        "title": "Estimating Stature From Arm Span Measurement in Gujarat Region",
        "authors": "Ritesh K Shah, Ashok B Nirvan, Jitendra P Patel, Bharat Patel, Sanjay Kanani"
      },
      {
        "section": "Original Article",
        "title": "Epidemiological Study of Pediatric Respiratory Distress and Its Management in Pediatric Emergency Department",
        "authors": "Anusha Lekshminarayanan, Shruti Sangani, Nilima Shah, Samira Parikh, Dhara Gosai"
      },
      {
        "section": "Original Article",
        "title": "Study of Significance of Total Pelvic Height and Pelvic Width in Sex Determination of Human Innominate Bone in Gujarat Region",
        "authors": "Sudarshan Gupta, Kiran Arora"
      },
      {
        "section": "Original Article",
        "title": "Ocular Surface Foreign Body: Its Incidence and Correlation with Specific Occupations",
        "authors": "Radha I Dass, Devdatta J Gohel"
      },
      {
        "section": "Case Report",
        "title": "A Case of Invasive Pneumococcal Disease: CSF & Blood Culture Guiding Correct Diagnosis",
        "authors": "Afroz Bloch, Anjana Shah, B S Prajapati, Neha Patel"
      },
      {
        "section": "Case Report",
        "title": "Infectious Mononucleosis: A Case Report",
        "authors": "Sneha S. Babaria, Pooja K. Taneja, Bharati Dalal, Rupal Shah"
      },
      {
        "section": "Case Report",
        "title": "An Uncommon Case of Pregnancy with Psoriasis",
        "authors": "Purvi Shah, Jalpa Bhatt, Nimish Pandya, Atul Munshi"
      },
      {
        "section": "Case Report",
        "title": "Retrograde Intubation Using Epidural Catheter – A Novel Technique",
        "authors": "Nayna Solanki, Heena Parikh, Gunjan Shah"
      },
      {
        "section": "Case Report",
        "title": "Paget's disease of Breast Masquerading As Chronic Eczema – Report of Two Cases with Review of Literature",
        "authors": "Anupama Dayal, Puja Jarwani, S M Patel"
      }
    ],
    "vol-2-no-1-jan-jun-2013": [],
    "vol-1-no-2-jul-dec-2012": [],
    "vol-1-no-1-jan-jun-2012": []
  }
};
const { journalIssues, journalArticles } = JOURNAL_ARCHIVE;

const SECTION_KEYS = {
  Editorial: "editorial",
  "Review Article": "review_article",
  "Original Article": "original_article",
  "Case Report": "case_report",
};

const seedJournalsData = async () => {
  let connection;

  try {
    console.log("Preparing journal schema...");
    await ensureJournalSchema();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let entryCount = 0;
    for (let issueIndex = 0; issueIndex < journalIssues.length; issueIndex += 1) {
      const issue = journalIssues[issueIndex];
      const seedId = uuidv5(issue.slug, uuidv5.URL);

      await connection.query(
        `INSERT INTO gcs_journals
          (id, volume, number, duration, slug, issue_pdf_url, issue_pdf_key, display_order, created_by)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL)
         ON DUPLICATE KEY UPDATE
          volume = VALUES(volume),
          number = VALUES(number),
          duration = VALUES(duration),
          issue_pdf_url = VALUES(issue_pdf_url),
          issue_pdf_key = VALUES(issue_pdf_key),
          display_order = VALUES(display_order)`,
        [
          seedId,
          issue.volume,
          issue.number,
          issue.duration,
          issue.slug,
          issue.pdfUrl || null,
          issueIndex + 1,
        ],
      );

      const [journalRows] = await connection.query(
        "SELECT id FROM gcs_journals WHERE slug = ? LIMIT 1",
        [issue.slug],
      );
      const journalId = journalRows[0].id;
      await connection.query("DELETE FROM gcs_journal_entries WHERE journal_id = ?", [journalId]);

      const sectionOrder = {};
      for (const article of journalArticles[issue.slug] || []) {
        const section = SECTION_KEYS[article.section];
        if (!section) {
          throw new Error(`Unsupported section '${article.section}' in ${issue.slug}`);
        }

        sectionOrder[section] = (sectionOrder[section] || 0) + 1;
        const entryId = uuidv5(
          `${issue.slug}:${section}:${sectionOrder[section]}:${article.title}`,
          uuidv5.URL,
        );
        await connection.query(
          `INSERT INTO gcs_journal_entries
            (id, journal_id, section, title, author, pdf_url, pdf_key, display_order)
           VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
          [
            entryId,
            journalId,
            section,
            article.title,
            article.authors,
            article.pdfUrl || null,
            sectionOrder[section],
          ],
        );
        entryCount += 1;
      }
    }

    await connection.commit();
    console.log(`Seeded ${journalIssues.length} journal issues and ${entryCount} journal entries.`);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error seeding journal data:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
};

seedJournalsData();

