const API_BASE = (typeof window !== "undefined" && window.STARWA_API_BASE)
  ? window.STARWA_API_BASE
  : (location.port === "3000" ? "" : `${location.protocol}//${location.hostname}:3000`);

const modal = document.getElementById("companyModal");
const backdrop = document.getElementById("companyModalBackdrop");
const closeBtn = document.getElementById("closeCompanyModal");
const cancelBtn = document.getElementById("cancelCompany");
const form = document.getElementById("companyForm");
const statusEl = document.getElementById("companyStatus");
const openTriggers = document.querySelectorAll("[data-open-company]");

if (modal && form && openTriggers.length) {
  const normalizeRole = (role = "") => {
    const value = String(role || "").toLowerCase();
    if (value === "werkgever") return "employer";
    if (value === "werkzoeker" || value === "worker") return "seeker";
    return value;
  };
  const isEmployer = () => normalizeRole(document.body.dataset.role) === "employer";
  const setValue = (id, value = "") => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  const setStatus = (text = "", state = "") => {
    if (!statusEl) return;
    statusEl.textContent = text;
    if (state) statusEl.dataset.state = state;
    else delete statusEl.dataset.state;
  };

  const fillCompanyForm = (p = {}) => {
    setValue("cp_bedrijfsnaam", p.bedrijfsnaam);
    setValue("cp_kvk", p.kvk_nummer);
    setValue("cp_sector", p.sector);
    setValue("cp_grootte", p.bedrijfs_grootte);
    setValue("cp_locatie", p.locatie_adres);
    setValue("cp_website", p.website);
    setValue("cp_slogan", p.slogan);
    setValue("cp_beschrijving", p.beschrijving);
    setValue("cp_cultuur", p.cultuur);
    setValue("cp_contact_naam", p.contactpersoon_naam);
    setValue("cp_contact_email", p.contact_email);
  };

  const loadCompany = async () => {
    setStatus("Bedrijfsprofiel laden...");
    try {
      const res = await fetch(`${API_BASE}/api/company/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Kon profiel niet laden");
      const data = await res.json();
      if (data.profile) fillCompanyForm(data.profile);
      setStatus("");
    } catch (err) {
      setStatus(err?.message || "Kon profiel niet laden", "error");
    }
  };

  const openModal = async () => {
    await loadCompany();
    modal.classList.add("is-active");
    backdrop?.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("company-modal-open");
    const first = modal.querySelector("input,select,textarea,button");
    first?.focus?.();
  };

  const closeModal = () => {
    modal.classList.remove("is-active");
    backdrop?.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("company-modal-open");
    setStatus("");
  };

  openTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!isEmployer()) return;
      event.preventDefault();
      openModal();
    });
  });

  closeBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    closeModal();
  });
  cancelBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    closeModal();
  });
  backdrop?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-active")) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      bedrijfsnaam: document.getElementById("cp_bedrijfsnaam")?.value?.trim(),
      kvk_nummer: document.getElementById("cp_kvk")?.value?.trim(),
      sector: document.getElementById("cp_sector")?.value?.trim(),
      bedrijfs_grootte: document.getElementById("cp_grootte")?.value?.trim(),
      locatie_adres: document.getElementById("cp_locatie")?.value?.trim(),
      website: document.getElementById("cp_website")?.value?.trim(),
      slogan: document.getElementById("cp_slogan")?.value?.trim(),
      beschrijving: document.getElementById("cp_beschrijving")?.value?.trim(),
      cultuur: document.getElementById("cp_cultuur")?.value?.trim(),
      contactpersoon_naam: document.getElementById("cp_contact_naam")?.value?.trim(),
      contact_email: document.getElementById("cp_contact_email")?.value?.trim(),
    };
    if (!payload.bedrijfsnaam) {
      setStatus("Bedrijfsnaam is verplicht.", "error");
      return;
    }
    setStatus("Opslaan...");
    try {
      const res = await fetch(`${API_BASE}/api/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Fout (${res.status})`);
      }
      setStatus("Profiel opgeslagen.", "success");
      setTimeout(closeModal, 450);
    } catch (err) {
      setStatus(err?.message || "Kon profiel niet opslaan.", "error");
    }
  });

  const shouldOpen = new URLSearchParams(window.location.search).get("openCompany") === "1";
  if (shouldOpen && isEmployer()) {
    openModal();
  }
}
