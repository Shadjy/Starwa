let currentPage = 1;
const totalPages = 10;

function showPage(page) {
  // Alle pagina's verbergen
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById("page" + page).classList.add('active');

  // Knoppenstatus bijwerken
  document.getElementById("prevBtn").disabled = (page === 1);
  document.getElementById("nextBtn").textContent = (page === totalPages) ? "Afronden" : "Volgende";

  // ✅ Controleer of er al een antwoord is ingevuld
  checkIfAnswered();

  // ✅ Voortgangsbalk updaten
  updateProgressBar();
}

function nextPage() {
  // Controleer of huidig antwoord is ingevuld
  if (!isAnswered()) {
    alert("Beantwoord eerst deze vraag voordat je doorgaat!");
    return;
  }

  if (currentPage < totalPages) {
    currentPage++;
    showPage(currentPage);
  } else {
    alert("Bedankt voor het invullen van de vragenlijst!");
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    showPage(currentPage);
  }
}

function updateProgressBar() {
  const progress = (currentPage / totalPages) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

// ✅ Controleert of er iets is ingevuld op de huidige pagina
function isAnswered() {
  const page = document.getElementById("page" + currentPage);
  const textInputs = page.querySelectorAll('input[type="text"], input[type="number"]');
  const radios = page.querySelectorAll('input[type="radio"]');

  // Controleer tekstvelden
  for (let input of textInputs) {
    if (input.value.trim() !== "") return true;
  }

  // Controleer radioknoppen
  const groups = {};
  radios.forEach(radio => {
    if (!groups[radio.name]) groups[radio.name] = [];
    groups[radio.name].push(radio);
  });

  for (let groupName in groups) {
    const group = groups[groupName];
    if (Array.from(group).some(r => r.checked)) return true;
  }

  return false;
}

// ✅ Schakelt "Volgende" knop automatisch in/uit
function checkIfAnswered() {
  const nextBtn = document.getElementById("nextBtn");
  if (isAnswered()) {
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }
}

// ✅ Zorg dat de knop meteen reageert op invullen/klikken
document.addEventListener("input", checkIfAnswered);
document.addEventListener("change", checkIfAnswered);

// Start op pagina 1
showPage(currentPage);

