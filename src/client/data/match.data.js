// === Vacature data + scoring (uit jouw app.py, 1-op-1 vertaald) ===
const VACATURES = [
  { id:1, title:"Junior Data Analist", company:"Insight BV",
    functie:"Data Analist", locatie:"Utrecht", uren:"40", sector:"Zorg & Analytics",
    philosophy:"Datagedreven beslissingen met maatschappelijke impact.",
    primaryBenefits:["MacBook/Windows naar keuze","Opleidingsbudget €1.500","Hybride werken"],
    secondaryBenefits:["Pensioen 70%","8% vakantiegeld","Teamuitjes per kwartaal"],
    salary:"€2.600 – €3.200 p/m", contractType:"Fulltime",
    travelAllowance:"NS Business Card of €0,23/km",
    contacts:[{name:"Eva Janssen", email:"eva@insightbv.nl"}], urgency:"Normaal" },
  { id:2, title:"Medior Developer", company:"BuildIT",
    functie:"Developer", locatie:"Amsterdam", uren:"36", sector:"FinTech",
    philosophy:"Clean code, snelle iteraties, security-first.",
    primaryBenefits:["Thuiswerkbudget €600","Hardware naar keuze","Trainingen"],
    secondaryBenefits:["13e maand","Stock appreciation plan"],
    salary:"€3.600 – €4.400 p/m", contractType:"Fulltime",
    travelAllowance:"OV 100% of €0,21/km",
    contacts:[{name:"Mark de Boer", email:"mark@buildit.io"}], urgency:"Hoog (binnen 4 weken)" },
  { id:3, title:"Project Manager", company:"OrgaPlus",
    functie:"Project Manager", locatie:"Rotterdam", uren:"32", sector:"Logistiek",
    philosophy:"Transparantie, planning en eigenaarschap.",
    primaryBenefits:["Leaseauto C-segment","PMI-certificering"],
    secondaryBenefits:["Bonus op projectresultaat","Telefoon + laptop"],
    salary:"€4.200 – €5.200 p/m", contractType:"Parttime",
    travelAllowance:"Lease of €0,21/km",
    contacts:[{name:"Saar Willems", email:"s.willems@orgaplus.nl"}], urgency:"Normaal" },
  { id:4, title:"Data Analist", company:"HealthTech",
    functie:"Data Analist", locatie:"Amsterdam", uren:"32", sector:"HealthTech",
    philosophy:"Betere zorg door slimme data en dashboards.",
    primaryBenefits:["E-Health opleiding","Hybride 3/2"],
    secondaryBenefits:["Sportabonnement korting","Lunchregeling"],
    salary:"€3.000 – €3.800 p/m", contractType:"Parttime",
    travelAllowance:"OV 100%",
    contacts:[{name:"Hugo van Dijk", email:"h.vandijk@healthtech.nl"}], urgency:"Laag" },
  { id:5, title:"Backend Developer", company:"FinCore",
    functie:"Developer", locatie:"Utrecht", uren:"40", sector:"Finance",
    philosophy:"Kwaliteit boven snelheid, domain-driven design.",
    primaryBenefits:["Kennisdagen 1x/maand","Certificeringen betaald"],
    secondaryBenefits:["Aandelenplan","Thuiswerkvergoeding"],
    salary:"€4.000 – €5.000 p/m", contractType:"Fulltime",
    travelAllowance:"€0,23/km",
    contacts:[{name:"Anouk Smit", email:"anouk@fincore.eu"}], urgency:"Normaal" },
  { id:6, title:"Project Manager", company:"TransLog",
    functie:"Project Manager", locatie:"Utrecht", uren:"24", sector:"Transport",
    philosophy:"Lean projecten met doorlooptijd-reductie.",
    primaryBenefits:["Auto of mobiliteitsbudget","Lean training"],
    secondaryBenefits:["Bonusregeling","Telefoon + laptop"],
    salary:"€4.000 – €4.800 p/m (pro rata)", contractType:"Parttime",
    travelAllowance:"€0,21/km",
    contacts:[{name:"Koen Peters", email:"koen@translog.nl"}], urgency:"Normaal" },
  { id:7, title:"Data Analist (parttime)", company:"GreenData",
    functie:"Data Analist", locatie:"Rotterdam", uren:"16", sector:"Duurzaamheid",
    philosophy:"Klimaatimpact meetbaar maken.",
    primaryBenefits:["Flexibele uren","Maatschappelijke projecten"],
    secondaryBenefits:["Reiskosten netto","Laptop naar keuze"],
    salary:"€2.400 – €2.900 p/m (pro rata)", contractType:"Parttime",
    travelAllowance:"€0,23/km",
    contacts:[{name:"Lotte Kemp", email:"lotte@greendata.org"}], urgency:"Laag" }
];

const WEIGHTS_JOB = {
  functie:30, locatie:20, uren:20, sector:10, contractType:10, urgency:5, travelAllowance:5
};

function explainJob(v, keuze){
  const regels = [];
  const regel = (label,key)=>{
    if (keuze[key] && keuze[key]!=="Alle" && v[key]===keuze[key]) regels.push(`✅ ${label} matcht: ${v[key]}`);
    else if (keuze[key] && keuze[key]!=="Alle") regels.push(`◻︎ ${label} anders: gezocht '${keuze[key]}', vacature '${v[key]??"-"}'`);
  };
  regel("Functie","functie");
  regel("Locatie","locatie");
  regel("Uren","uren");
  regel("Sector","sector");
  regel("Contracttype","contractType");
  regel("Urgentie","urgency");
  if (keuze.reiskosten && keuze.reiskosten!=="Alle"){
    if ((v.travelAllowance||"").includes(keuze.reiskosten)) regels.push(`✅ Reiskostenvergoeding matcht: ${v.travelAllowance}`);
    else regels.push(`◻︎ Reiskostenvergoeding anders: gezocht '${keuze.reiskosten}', vacature '${v.travelAllowance||"-"}'`);
  }
  return regels;
}

function computeMatchesForJobs(input){
  const keuze = {
    functie: (input.functie||"").trim(),
    locatie: (input.locatie||"").trim(),
    uren: String(input.uren||"").trim(),
    sector: (input.sector||"").trim(),
    contractType: (input.contract||"").trim(),
    urgency: (input.urgentie||"").trim(),
    reiskosten: (input.reiskosten||"").trim()
  };

  const results = VACATURES.map(v=>{
    let score = 0;
    if (keuze.functie && v.functie===keuze.functie) score+=WEIGHTS_JOB.functie;
    if (keuze.locatie && v.locatie===keuze.locatie) score+=WEIGHTS_JOB.locatie;
    if (keuze.uren && v.uren===keuze.uren) score+=WEIGHTS_JOB.uren;
    if (keuze.sector && keuze.sector!=="Alle" && v.sector===keuze.sector) score+=WEIGHTS_JOB.sector;
    if (keuze.contractType && keuze.contractType!=="Alle" && v.contractType===keuze.contractType) score+=WEIGHTS_JOB.contractType;
    if (keuze.urgency && keuze.urgency!=="Alle" && v.urgency===keuze.urgency) score+=WEIGHTS_JOB.urgency;
    if (keuze.reiskosten && keuze.reiskosten!=="Alle" && (v.travelAllowance||"").includes(keuze.reiskosten)) score+=WEIGHTS_JOB.travelAllowance;

    return {
      id:v.id, title:v.title, company:v.company, functie:v.functie, locatie:v.locatie, uren:v.uren,
      sector:v.sector, contractType:v.contractType, urgency:v.urgency, travelAllowance:v.travelAllowance,
      score,
      why: explainJob(v,keuze),
      details:{
        philosophy:v.philosophy, primaryBenefits:v.primaryBenefits, secondaryBenefits:v.secondaryBenefits,
        salary:v.salary, travelAllowance:v.travelAllowance, contacts:v.contacts,
        contractType:v.contractType, urgency:v.urgency
      }
    };
  }).sort((a,b)=>b.score-a.score);

  return results;
}
