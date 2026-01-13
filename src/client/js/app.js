const ICONS = {
  heart: `<svg viewBox="0 0 20 20"><path d="M10 17s-6-3.7-6-8A3.5 3.5 0 0 1 7.5 5c1.05 0 1.95.45 2.5 1.2A3.2 3.2 0 0 1 12.5 5 3.5 3.5 0 0 1 16 9c0 4.3-6 8-6 8Z" fill="currentColor"></path></svg>`,
  checkCircle: `<svg viewBox="0 0 20 20"><path d="M10 18.25A8.25 8.25 0 1 1 18.25 10 8.26 8.26 0 0 1 10 18.25Zm3.64-9.86a.85.85 0 0 0-1.2-1.2L9.2 10.44 7.6 8.83a.85.85 0 0 0-1.2 1.2l2.2 2.2a.85.85 0 0 0 1.2 0Z" fill="currentColor"></path></svg>`,
  calendar: `<svg viewBox="0 0 20 20"><path d="M6 2v2m8-2v2M3.5 7h13m-12 9h11a1.5 1.5 0 0 0 1.5-1.5V5.5A1.5 1.5 0 0 0 16.5 4h-13A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>`,
  message: `<svg viewBox="0 0 20 20"><path d="M3.25 4.75h13.5c.55 0 1 .45 1 1v8.5c0 .55-.45 1-1 1h-4.5l-3.25 2.5V15.25H3.25c-.55 0-1-.45-1-1v-8.5c0-.55.45-1 1-1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path></svg>`,
  alert: `<svg viewBox="0 0 20 20"><path d="M10 2.5 2.75 16.25h14.5Zm0 5v4m0 3h.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  briefcase: `<svg viewBox="0 0 20 20"><path d="M6.5 5h7c.55 0 1 .45 1 1v1.25h2.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V8.25a1 1 0 0 1 1-1H5.5V6a1 1 0 0 1 1-1Zm0 0V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  clock: `<svg viewBox="0 0 20 20"><path d="M17 10a7 7 0 1 1-7-7 7 7 0 0 1 7 7Zm-7-3v3.25L12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  trash: `<svg viewBox="0 0 20 20"><path d="M4.5 6.5h11M12 6.5v8m-4 0v-8M7 6.5 7.5 4h5l.5 2.5m1.5 0V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  bookmark: `<svg viewBox="0 0 20 20"><path d="M6 3.5h8a1 1 0 0 1 1 1v12l-5-3-5 3v-12a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path></svg>`,
  bolt: `<svg viewBox="0 0 20 20"><path d="M11 2 4.5 11h4L9 18l6.5-9h-4Z" fill="currentColor"></path></svg>`,
  inbox: `<svg viewBox="0 0 20 20"><path d="M3.75 4.5h12.5L18 11.5v4a.5.5 0 0 1-.5.5H2.5a.5.5 0 0 1-.5-.5v-4ZM3.75 4.5 2 11.5m16 0h-4.5l-1.4 2.8a.5.5 0 0 1-.45.27H8.35a.5.5 0 0 1-.45-.27L6.5 11.5H2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
};

const TYPE_CONFIG = {
  match: {
    label: "Match gevonden",
    filterLabel: "Matches",
    icon: "heart",
    accentClass: "type-color-match",
  },
  application: {
    label: "Sollicitatie",
    filterLabel: "Sollicitaties",
    icon: "checkCircle",
    accentClass: "type-color-application",
  },
  interview: {
    label: "Interview",
    filterLabel: "Interviews",
    icon: "calendar",
    accentClass: "type-color-interview",
  },
  message: {
    label: "Bericht",
    filterLabel: "Berichten",
    icon: "message",
    accentClass: "type-color-message",
  },
  update: {
    label: "Update",
    filterLabel: "Updates",
    icon: "alert",
    accentClass: "type-color-update",
  },
};

const seedNotifications = [
  {
    id: "tc-match",
    type: "match",
    title: "Nieuwe match gevonden!",
    message:
      "Je bent gematcht met de functie Senior Frontend Developer bij TechCorp.",
    detailMessage:
      "Recruiter Maaike bekijkt nu je profiel. Verwacht binnen twee werkdagen aanvullende informatie over het traject en eventuele vervolgstappen.",
    company: "TechCorp",
    role: "Senior Frontend Developer",
    postedAt: "2024-10-14T08:05:00+02:00",
    timeAgo: "2 uur geleden",
    read: false,
    saved: true,
    badge: "Nieuw",
    badgeClass: "badge--info",
    status: "Actie nodig",
  },
  {
    id: "sx-application",
    type: "application",
    title: "Sollicitatie bevestigd",
    message:
      "Je sollicitatie voor UX Designer bij StartupXYZ is ontvangen. We laten je spoedig weten wat de vervolgstappen zijn.",
    detailMessage:
      "StartupXYZ heeft je motivatie ontvangen en beoordeelt je portfolio. Je krijgt binnen 48 uur een update.",
    company: "StartupXYZ",
    role: "UX Designer",
    postedAt: "2024-10-13T11:00:00+02:00",
    timeAgo: "1 dag geleden",
    read: false,
    saved: false,
    badge: "Nieuw",
    badgeClass: "badge--info",
    status: "In behandeling",
  },
  {
    id: "mc-interview",
    type: "interview",
    title: "Interview gepland",
    message: "Je hebt een interview op dinsdag 14:00 bij MegaCorp.",
    detailMessage:
      "Het gesprek vindt plaats via Google Meet. Bereid een korte case voor waarin je laat zien hoe je omgaat met schaalbare component libraries.",
    company: "MegaCorp",
    role: "Frontend Engineer",
    postedAt: "2024-10-11T09:00:00+02:00",
    timeAgo: "2 dagen geleden",
    read: true,
    saved: false,
    status: "Gepland",
  },
  {
    id: "ds-message",
    type: "message",
    title: "Nieuw bericht ontvangen",
    message:
      "DesignStudio heeft je een bericht gestuurd over je sollicitatie.",
    detailMessage:
      "Hoi Abraham, bedankt voor je uitgebreide portfolio! Kun je ook een lijst met je favoriete tooling delen? Groet, Lotte.",
    company: "DesignStudio",
    role: "Visual Designer",
    postedAt: "2024-10-10T15:15:00+02:00",
    timeAgo: "3 dagen geleden",
    read: true,
    saved: true,
    status: "Antwoord gevraagd",
  },
  {
    id: "ic-update",
    type: "update",
    title: "Update sollicitatie",
    message: "Helaas zijn we verder gegaan met een andere kandidaat.",
    detailMessage:
      "InnovateCorp bedankt je voor je sollicitatie. Ze houden je gegevens graag in portefeuille voor toekomstige rollen.",
    company: "InnovateCorp",
    role: "Product Designer",
    postedAt: "2024-10-07T10:00:00+02:00",
    timeAgo: "1 week geleden",
    read: true,
    saved: false,
    status: "Afgerond",
  },
];

const state = {
  notifications: seedNotifications.map((item) => ({ ...item })),
  filters: {
    search: "",
    type: "all",
    unreadOnly: false,
    savedOnly: false,
  },
  activeModalId: null,
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  unreadOnly: document.getElementById("unreadOnly"),
  savedOnly: document.getElementById("savedOnly"),
  resetFilters: document.getElementById("resetFilters"),
  moreFiltersToggle: document.getElementById("moreFiltersToggle"),
  extraFilters: document.getElementById("extraFilters"),
  notificationsSection: document.getElementById("notificationsSection"),
  markAllButton: document.getElementById("markAllButton"),
  counterBadge: document.getElementById("newCounter"),
  modal: document.getElementById("detailModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalAvatar: document.getElementById("modalAvatar"),
  modalCompany: document.getElementById("modalCompany"),
  modalTime: document.getElementById("modalTime"),
  modalTypeBadge: document.getElementById("modalTypeBadge"),
  modalStatusBadge: document.getElementById("modalStatusBadge"),
  modalMessage: document.getElementById("modalMessage"),
  modalMarkRead: document.getElementById("modalMarkRead"),
  modalDelete: document.getElementById("modalDelete"),
  modalClose: document.getElementById("modalClose"),
  modalSaveToggle: document.getElementById("modalSaveToggle"),
  modalSaveText: document.getElementById("modalSaveText"),
};

const iconElement = (name) => {
  const wrapper = document.createElement("i");
  wrapper.className = "icon";
  wrapper.innerHTML = ICONS[name] ?? "";
  wrapper.setAttribute("aria-hidden", "true");
  return wrapper;
};

const computeInitials = (source) =>
  source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0] ?? "")
    .join("")
    .toUpperCase();

const formatRoleLine = (notification) =>
  notification.role
    ? `${notification.role} · ${notification.company}`
    : notification.company;

const applyFilters = () => {
  const { search, type, unreadOnly, savedOnly } = state.filters;
  const text = search.trim().toLowerCase();

  return state.notifications
    .filter((note) => {
      if (type !== "all" && note.type !== type) {
        return false;
      }
      if (unreadOnly && note.read) {
        return false;
      }
      if (savedOnly && !note.saved) {
        return false;
      }
      if (!text) {
        return true;
      }
      const haystack = [
        note.title,
        note.message,
        note.company,
        note.role,
        TYPE_CONFIG[note.type]?.label,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());
      return haystack.some((value) => value.includes(text));
    })
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );
};

const updateCounterBadge = () => {
  if (!elements.counterBadge) {
    return;
  }
  const unread = state.notifications.filter((note) => !note.read).length;
  const displayValue = unread > 9 ? "9+" : String(unread);
  elements.counterBadge.textContent = displayValue;
  elements.counterBadge.dataset.count = String(unread);
  elements.counterBadge.classList.toggle("is-max", unread > 9);
  elements.counterBadge.classList.toggle("is-empty", unread === 0);
  elements.counterBadge.setAttribute(
    "aria-label",
    `${unread} ongelezen berichten`
  );
};

const updateMarkAllButton = () => {
  const hasUnread = state.notifications.some((note) => !note.read);
  elements.markAllButton.disabled = !hasUnread;
  elements.markAllButton.setAttribute(
    "aria-disabled",
    hasUnread ? "false" : "true"
  );
};

const renderEmptyState = () => {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  const icon = iconElement("inbox");
  wrapper.appendChild(icon);

  const title = document.createElement("p");
  title.className = "notification-title";
  title.textContent = "Geen meldingen gevonden";
  wrapper.appendChild(title);

  const message = document.createElement("p");
  message.textContent =
    "Pas je filters aan of verwijder de zoekopdracht om opnieuw te proberen.";
  wrapper.appendChild(message);

  const button = document.createElement("button");
  button.className = "outlined-button";
  button.type = "button";
  button.textContent = "Reset filters";
  button.addEventListener("click", () => {
    resetFilters();
  });
  wrapper.appendChild(button);

  return wrapper;
};

const renderNotifications = () => {
  const list = applyFilters();
  elements.notificationsSection.innerHTML = "";

  if (list.length === 0) {
    elements.notificationsSection.appendChild(renderEmptyState());
    updateCounterBadge();
    updateMarkAllButton();
    return;
  }

  list.forEach((note) => {
    const card = document.createElement("article");
    card.className = `notification-card${note.read ? "" : " unread"}`;
    card.dataset.id = note.id;
    card.tabIndex = 0;

    const avatar = document.createElement("div");
    avatar.className = "notification-avatar";
    avatar.textContent = computeInitials(note.company);
    avatar.setAttribute(
      "aria-label",
      `Bedrijf ${note.company.substring(0, 40)}`
    );
    card.appendChild(avatar);

    const content = document.createElement("div");
    content.className = "notification-content";
    card.appendChild(content);

    const top = document.createElement("div");
    top.className = "notification-top";
    content.appendChild(top);

    const meta = document.createElement("div");
    meta.className = `notification-meta ${TYPE_CONFIG[note.type]?.accentClass ?? ""
      }`;
    top.appendChild(meta);

    const typeRow = document.createElement("div");
    typeRow.className = `notification-type ${TYPE_CONFIG[note.type]?.accentClass ?? ""
      }`;
    meta.appendChild(typeRow);

    const typeIconWrapper = document.createElement("span");
    typeIconWrapper.className = "type-icon";
    const typeIcon = iconElement(TYPE_CONFIG[note.type]?.icon);
    typeIconWrapper.appendChild(typeIcon);
    typeRow.appendChild(typeIconWrapper);

    const typeLabel = document.createElement("span");
    typeLabel.textContent = TYPE_CONFIG[note.type]?.label ?? "Melding";
    typeRow.appendChild(typeLabel);

    const title = document.createElement("h2");
    title.className = "notification-title";
    title.textContent = note.title;
    meta.appendChild(title);

    const message = document.createElement("p");
    message.className = "notification-message";
    message.textContent = note.message;
    meta.appendChild(message);

    if (!note.read) {
      const badge = document.createElement("span");
      badge.className = `badge ${note.badgeClass ?? "badge--info"}`;
      badge.textContent = note.badge ?? "Nieuw";
      top.appendChild(badge);
    } else if (note.saved) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.appendChild(iconElement("bookmark"));
      badge.append(" Opgeslagen");
      top.appendChild(badge);
    }

    const footer = document.createElement("div");
    footer.className = "notification-footer";
    content.appendChild(footer);

    const companyLine = document.createElement("span");
    companyLine.appendChild(iconElement("briefcase"));
    companyLine.append(formatRoleLine(note));
    footer.appendChild(companyLine);

    const timeLine = document.createElement("span");
    timeLine.appendChild(iconElement("clock"));
    timeLine.append(note.timeAgo);
    footer.appendChild(timeLine);

    if (!note.read) {
      const dot = document.createElement("span");
      dot.className = "notification-dot";
      dot.setAttribute("aria-hidden", "true");
      card.appendChild(dot);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "notification-delete";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.title = "Verwijder melding";
    deleteButton.appendChild(iconElement("trash"));
    card.appendChild(deleteButton);

    elements.notificationsSection.appendChild(card);
  });

  updateCounterBadge();
  updateMarkAllButton();
};

const resetFilters = () => {
  state.filters = {
    search: "",
    type: "all",
    unreadOnly: false,
    savedOnly: false,
  };
  elements.searchInput.value = "";
  elements.typeFilter.value = "all";
  elements.unreadOnly.checked = false;
  elements.savedOnly.checked = false;
  renderNotifications();
};

const setFilter = (name, value) => {
  state.filters[name] = value;
  renderNotifications();
};

const markNotificationAsRead = (id, read = true) => {
  const note = state.notifications.find((item) => item.id === id);
  if (!note) {
    return;
  }
  note.read = read;
  renderNotifications();
};

const toggleSaved = (id) => {
  const note = state.notifications.find((item) => item.id === id);
  if (!note) {
    return;
  }
  note.saved = !note.saved;
  renderNotifications();
};

const removeNotification = (id) => {
  const index = state.notifications.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }
  state.notifications.splice(index, 1);
  if (state.activeModalId === id) {
    closeModal();
  }
  renderNotifications();
};

const populateTypeFilter = () => {
  elements.typeFilter.innerHTML = "";
  const baseOption = document.createElement("option");
  baseOption.value = "all";
  baseOption.textContent = "Alle meldingen";
  elements.typeFilter.appendChild(baseOption);

  Object.entries(TYPE_CONFIG).forEach(([value, config]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = config.filterLabel;
    elements.typeFilter.appendChild(option);
  });
};

const updateModal = (note) => {
  elements.modalTitle.textContent = note.title;
  elements.modalAvatar.textContent = computeInitials(note.company);
  elements.modalCompany.textContent = formatRoleLine(note);
  elements.modalTime.textContent = note.timeAgo;

  const typeClass = TYPE_CONFIG[note.type]?.accentClass ?? "";
  elements.modalTypeBadge.className = `badge ${typeClass}`;
  elements.modalTypeBadge.textContent = TYPE_CONFIG[note.type]?.label ?? "Melding";

  if (note.status) {
    elements.modalStatusBadge.className = `badge ${typeClass}`;
    elements.modalStatusBadge.textContent = note.status;
    elements.modalStatusBadge.classList.remove("hidden");
  } else {
    elements.modalStatusBadge.classList.add("hidden");
  }

  elements.modalMessage.textContent =
    note.detailMessage ?? note.message ?? "";

  elements.modalMarkRead.textContent = note.read
    ? "Markeer als ongelezen"
    : "Markeer als gelezen";

  elements.modalSaveText.textContent = note.saved
    ? "Verwijder uit favorieten"
    : "Opslaan als favoriet";
};

const openModal = (id) => {
  const note = state.notifications.find((item) => item.id === id);
  if (!note) {
    return;
  }
  state.activeModalId = id;
  updateModal(note);
  elements.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  state.activeModalId = null;
  elements.modal.classList.add("hidden");
  elements.modalStatusBadge.classList.add("hidden");
  document.body.style.overflow = "";
};

const handleCardInteraction = (event) => {
  const target = event.target;
  const card = target.closest(".notification-card");
  if (!card) {
    return;
  }
  const id = card.dataset.id;
  if (!id) {
    return;
  }

  if (
    target.closest("button") &&
    target.closest("button").dataset.action === "delete"
  ) {
    event.stopPropagation();
    removeNotification(id);
    return;
  }

  if (!state.notifications.find((item) => item.id === id)?.read) {
    markNotificationAsRead(id);
  }

  openModal(id);
};

const initEventListeners = () => {
  elements.searchInput.addEventListener("input", (event) => {
    setFilter("search", event.target.value);
  });

  elements.typeFilter.addEventListener("change", (event) => {
    setFilter("type", event.target.value);
  });

  elements.unreadOnly.addEventListener("change", (event) => {
    setFilter("unreadOnly", event.target.checked);
  });

  elements.savedOnly.addEventListener("change", (event) => {
    setFilter("savedOnly", event.target.checked);
  });

  elements.resetFilters.addEventListener("click", () => {
    resetFilters();
  });

  elements.moreFiltersToggle.addEventListener("click", () => {
    const expanded = elements.moreFiltersToggle.getAttribute("aria-expanded") === "true";
    elements.moreFiltersToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    elements.extraFilters.classList.toggle("hidden");
  });

  elements.notificationsSection.addEventListener("click", handleCardInteraction);
  elements.notificationsSection.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardInteraction(event);
    }
  });

  elements.markAllButton.addEventListener("click", () => {
    state.notifications.forEach((note) => {
      note.read = true;
    });
    renderNotifications();
  });

  elements.modalMarkRead.addEventListener("click", () => {
    if (!state.activeModalId) {
      return;
    }
    const note = state.notifications.find((item) => item.id === state.activeModalId);
    if (!note) {
      return;
    }
    markNotificationAsRead(state.activeModalId, !note.read);
    updateModal(state.notifications.find((item) => item.id === state.activeModalId));
  });

  elements.modalDelete.addEventListener("click", () => {
    if (!state.activeModalId) {
      return;
    }
    removeNotification(state.activeModalId);
  });

  elements.modalSaveToggle.addEventListener("click", () => {
    if (!state.activeModalId) {
      return;
    }
    toggleSaved(state.activeModalId);
    const note = state.notifications.find((item) => item.id === state.activeModalId);
    if (note) {
      updateModal(note);
    }
  });

  elements.modalClose.addEventListener("click", () => {
    closeModal();
  });

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.length > 1 ? window.history.back() : window.location.assign("/");
    });
  }
};

const init = () => {
  populateTypeFilter();
  initEventListeners();
  renderNotifications();
};

init();
