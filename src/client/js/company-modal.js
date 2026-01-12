(() => {
  const API_BASE = (typeof window !== "undefined" && window.STARWA_API_BASE)
    ? window.STARWA_API_BASE
    : (location.port === "3000" ? "" : `${location.protocol}//${location.hostname}:3000`);

  const modal = document.getElementById("companyModal");
  const backdrop = document.getElementById("companyModalBackdrop");
  const form = document.getElementById("companyForm");
  if (!modal || !backdrop || !form) return;

  const bodyEl = modal.querySelector(".panel-body");
  const footerEl = modal.querySelector(".panel-footer");
  const closeBtn = document.getElementById("closeCompanyModal");
  const cancelBtn = document.getElementById("cancelCompany");
  const toastContainer = document.getElementById("companyToasts");
  const setField = (id, val = "") => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };
  const showToast = (text, type = "") => {
    if (!toastContainer) {
      console[type === "error" ? "error" : "log"](text);
      return;
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`.trim();
    el.textContent = text;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  };

  let lastFocus = null;
  const updateFooterShadow = () => {
    if (footerEl && bodyEl) footerEl.classList.toggle("elevated", bodyEl.scrollTop > 0);
  };
  const focusFirst = () => {
    const first = document.getElementById("cp_bedrijfsnaam") || modal.querySelector("input,select,textarea,button");
    first?.focus?.();
  };
  const handleEsc = (e) => { if (e.key === "Escape") closeCompany(); };
  const openCompany = () => {
    lastFocus = document.activeElement;
    document.body.classList.add("modal-open");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    backdrop.classList.add("active");
    setTimeout(focusFirst, 10);
    updateFooterShadow();
    bodyEl?.addEventListener("scroll", updateFooterShadow);
    document.addEventListener("keydown", handleEsc);
  };
  const closeCompany = () => {
    document.body.classList.remove("modal-open");
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("active");
    bodyEl?.removeEventListener("scroll", updateFooterShadow);
    footerEl?.classList.remove("elevated");
    document.removeEventListener("keydown", handleEsc);
    lastFocus?.focus?.();
  };

  const fillCompanyForm = (p = {}) => {
    setField("cp_bedrijfsnaam", p.bedrijfsnaam);
    setField("cp_kvk", p.kvk_nummer);
    setField("cp_sector", p.sector);
    setField("cp_grootte", p.bedrijfs_grootte);
    setField("cp_locatie", p.locatie_adres);
    setField("cp_website", p.website);
    setField("cp_slogan", p.slogan);
    setField("cp_beschrijving", p.beschrijving);
    setField("cp_cultuur", p.cultuur);
    setField("cp_contact_naam", p.contactpersoon_naam);
    setField("cp_contact_email", p.contact_email);
  };

  const loadCompany = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/company/me`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const p = data.profile || {};
      fillCompanyForm(p);
      if (p.bedrijfsnaam) {
        const profileNameEl = document.getElementById("profileName");
        if (profileNameEl) profileNameEl.textContent = p.bedrijfsnaam;
      }
    } catch (err) {
      console.warn("Company-profiel laden mislukt:", err);
    }
  };

  const triggers = [
    ...document.querySelectorAll("#headerProfileBtn"),
    ...document.querySelectorAll("#openCompanyModal"),
    ...document.querySelectorAll("[data-company-modal-trigger]"),
  ];
  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loadCompany().finally(() => openCompany());
    });
  });

  closeBtn?.addEventListener("click", closeCompany);
  cancelBtn?.addEventListener("click", (e) => { e.preventDefault(); closeCompany(); });
  backdrop?.addEventListener("click", closeCompany);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
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
    if (!payload.bedrijfsnaam) { showToast("Bedrijfsnaam is verplicht", "error"); return; }
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
      showToast("Profiel opgeslagen", "success");
      if (payload.bedrijfsnaam) {
        const profileNameEl = document.getElementById("profileName");
        if (profileNameEl) profileNameEl.textContent = payload.bedrijfsnaam;
      }
      closeCompany();
    } catch (err) {
      showToast(err?.message || "Kon profiel niet opslaan", "error");
    }
  });
})();
