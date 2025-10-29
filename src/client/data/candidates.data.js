// === Kandidaten data + scoring (uit jouw candidates.py) ===
const CANDIDATES = [
  {
    id:101, name:"Sanne Vermeer", currentTitle:"Data Analist", desiredRole:"Data Analist",
    locatie:"Utrecht", uren:"40", sector:"Zorg & Analytics", contractType:"Fulltime",
    beschikbaarheid:"Per direct", skills:["Python","SQL","Tableau","Pandas"],
    details:{ cvUrl:"https://example.com/cv/sanne.pdf", portfolio:"https://example.com/sanne",
      github:"https://github.com/sannev", salaryExpectation:"€3.000 – €3.500 p/m",
      languages:["Nederlands","Engels"], experience:["2 jaar BI/analytics in healthcare","Dashboards in Tableau & Power BI"],
      email:"sanne@example.com", phone:"+31 6 1234 5678", notes:"Sterk in datakwaliteit en stakeholdercommunicatie." }
  },
  {
    id:102, name:"Rashid El Amrani", currentTitle:"Backend Developer", desiredRole:"Developer",
    locatie:"Amsterdam", uren:"36", sector:"FinTech", contractType:"Fulltime",
    beschikbaarheid:"Binnen 2 weken", skills:["JavaScript","Node.js","Docker","AWS","SQL"],
    details:{ cvUrl:null, portfolio:null, github:"https://github.com/rashidcodes",
      salaryExpectation:"€3.800 – €4.400 p/m", languages:["Nederlands","Engels"],
      experience:["3 jaar Node/TypeScript","CI/CD op AWS, Docker Compose"],
      email:"rashid@example.com", phone:"+31 6 8765 4321", notes:"Security-first, clean code, code reviews gewend." }
  },
  {
    id:103, name:"Linde Vos", currentTitle:"Project Manager", desiredRole:"Project Manager",
    locatie:"Rotterdam", uren:"32", sector:"Logistiek", contractType:"Parttime",
    beschikbaarheid:"1 maand opzegtermijn", skills:["Scrum","Stakeholder mgmt","Jira","Risicobeheer"],
    details:{ cvUrl:"https://example.com/cv/linde.pdf", portfolio:null, github:null,
      salaryExpectation:"€4.000 – €4.800 p/m", languages:["Nederlands","Engels","Duits"],
      experience:["4 jaar PM in logistieke projecten","Prince2 & PSM I"],
      email:"linde@example.com", phone:"+31 6 9999 0000", notes:"Sterk in planning, budget en risico’s." }
  },
  {
    id:104, name:"Tygo Bakker", currentTitle:"Junior Developer / Data", desiredRole:"Developer",
    locatie:"Utrecht", uren:"40", sector:"Duurzaamheid", contractType:"Fulltime",
    beschikbaarheid:"Per direct", skills:["Python","React","SQL","Docker"],
    details:{ cvUrl:null, portfolio:"https://tygobakkerportfolio.com", github:"https://github.com/tygo",
      salaryExpectation:"€2.600 – €3.200 p/m", languages:["Nederlands","Engels"],
      experience:["Project matchingplatform HU","Telemetry side-projects"],
      email:"info@tygobakkerportfolio.com", phone:null, notes:"Sterk in data + web, leergierig." }
  },
];

const WEIGHTS_CAND = { functie:28, locatie:18, uren:16, sector:10, contract:8, beschikbaarheid:8, skill:12 };

const _eq = (a,b)=> (a||"").trim().toLowerCase()===(b||"").trim().toLowerCase();
const _any = v => v==null || String(v).trim()==="" || ["alle","geen voorkeur"].includes(String(v).trim().toLowerCase());

function scoreCandidate(c, keuze){
  let score=0, why=[];
  if(!_any(keuze.functie) && (_eq(keuze.functie,c.desiredRole)||_eq(keuze.functie,c.currentTitle))){
    score+=WEIGHTS_CAND.functie; why.push("✅ Rol komt overeen met gewenste/gevoerde functie.");
  }else if(!_any(keuze.functie)){ why.push(`◻︎ Rol anders: gezocht '${keuze.functie}', kandidaat '${c.currentTitle||c.desiredRole}'.`); }
  if(!_any(keuze.locatie) && _eq(keuze.locatie,c.locatie)){
    score+=WEIGHTS_CAND.locatie; why.push("✅ Locatie matcht.");
  }else if(!_any(keuze.locatie)){ why.push(`◻︎ Locatie anders: gezocht '${keuze.locatie}', kandidaat '${c.locatie}'.`); }
  if(!_any(keuze.uren)){
    const need=parseInt(String(keuze.uren)); const have=parseInt(String(c.uren||"0"));
    if(!isNaN(need)&&!isNaN(have)){
      if(have===need){ score+=WEIGHTS_CAND.uren; why.push("✅ Uren matchen exact."); }
      else if(Math.abs(have-need)<=8){ score+=Math.round(WEIGHTS_CAND.uren*0.5); why.push("◕ Uren liggen binnen ±8 uur."); }
      else{ why.push(`◻︎ Uren anders: gezocht ${need}, kandidaat ${have}.`); }
    }
  }
  if(!_any(keuze.sector)){
    if(_eq(keuze.sector,c.sector)){ score+=WEIGHTS_CAND.sector; why.push("✅ Sector/domein matcht."); }
    else{ why.push(`◻︎ Sector anders: gezocht '${keuze.sector}', kandidaat '${c.sector}'.`); }
  }
  if(!_any(keuze.contract)){
    if(_eq(keuze.contract,c.contractType)){ score+=WEIGHTS_CAND.contract; why.push("✅ Contracttype matcht."); }
    else{ why.push(`◻︎ Contract anders: gezocht '${keuze.contract}', kandidaat '${c.contractType}'.`); }
  }
  if(!_any(keuze.beschikbaarheid)){
    if(_eq(keuze.beschikbaarheid,c.beschikbaarheid)){ score+=WEIGHTS_CAND.beschikbaarheid; why.push("✅ Beschikbaarheid matcht."); }
    else{ why.push(`◻︎ Beschikbaarheid anders: gezocht '${keuze.beschikbaarheid}', kandidaat '${c.beschikbaarheid}'.`); }
  }
  if(!_any(keuze.skill)){
    const asked=(keuze.skill||"").trim().toLowerCase();
    const set=(c.skills||[]).map(s=>s.trim().toLowerCase());
    if(set.includes(asked)){ score+=WEIGHTS_CAND.skill; why.push(`✅ Skill ‘${keuze.skill}’ aanwezig.`); }
    else{ why.push(`◻︎ Skill ‘${keuze.skill}’ ontbreekt.`); }
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  return {score, why};
}

function computeMatchesForCandidates(input){
  const keuze = {
    functie:(input.functie||"").trim(), locatie:(input.locatie||"").trim(), uren:String(input.uren||"").trim(),
    sector:(input.sector||"").trim(), contract:(input.contract||"").trim(),
    beschikbaarheid:(input.beschikbaarheid||"").trim(), skill:(input.skill||"").trim()
  };
  return CANDIDATES.map(c=>{
    const {score,why}=scoreCandidate(c,keuze);
    return {...c, score, why};
  }).sort((a,b)=>b.score-a.score);
}
