document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("editButton");
  const saveButton = document.getElementById("saveButton");
  const profileInputs = document.querySelectorAll(".profile-info input, .profile-info textarea");
  const profilePage = document.querySelector(".profile-page");
  const headerProfileBtn = document.getElementById("headerProfileBtn");

  let isEditing = false;

 
  editButton.addEventListener("click", () => {
    isEditing = !isEditing;

    profileInputs.forEach(input => {
      input.disabled = !isEditing;
    });

    saveButton.disabled = !isEditing;
    editButton.textContent = isEditing ? "Annuleren" : "Bewerken";
    profilePage.classList.toggle("editing", isEditing);
  });

 
  saveButton.addEventListener("click", () => {
    const updatedProfile = {};

    profileInputs.forEach(input => {
      updatedProfile[input.id] = input.value;
    });

   
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

   
    document.getElementById("fullName").value = updatedProfile.fullName || "Leo";
    document.getElementById("email").value = updatedProfile.email || "leo@outlook.com";
    document.getElementById("phone").value = updatedProfile.phone || "Niet ingevuld";
    document.getElementById("address").value = updatedProfile.address || "Niet ingevuld";
    document.getElementById("city").value = updatedProfile.city || "Niet ingevuld";
    document.getElementById("degree").value = updatedProfile.degree || "Niet ingevuld";
    document.getElementById("workExperience").value = updatedProfile.workExperience || "Niet ingevuld";
    document.getElementById("workWishes").value = updatedProfile.workWishes || "Niet ingevuld";
    document.getElementById("workLocation").value = updatedProfile.workLocation || "Niet ingevuld";
    document.getElementById("workHours").value = updatedProfile.workHours || "Niet ingevuld";

    alert("Profiel opgeslagen!");
  });


  const savedProfile = JSON.parse(localStorage.getItem("userProfile"));

  if (savedProfile) {
    document.getElementById("fullName").value = savedProfile.fullName || "";
    document.getElementById("email").value = savedProfile.email || "";
    document.getElementById("phone").value = savedProfile.phone || "";
    document.getElementById("address").value = savedProfile.address || "Niet ingevuld";
    document.getElementById("city").value = savedProfile.city || "Niet ingevuld";
    document.getElementById("degree").value = savedProfile.degree || "Niet ingevuld";
    document.getElementById("workExperience").value = savedProfile.workExperience || "Niet ingevuld";
    document.getElementById("workWishes").value = savedProfile.workWishes || "Niet ingevuld";
    document.getElementById("workLocation").value = savedProfile.workLocation || "Niet ingevuld";
    document.getElementById("workHours").value = savedProfile.workHours || "Niet ingevuld";
  }

  headerProfileBtn?.addEventListener("click", () => {
    // Scroll naar de edit sectie en activeer editmodus
    editButton?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!isEditing) {
      editButton?.click();
    }
  });
});
