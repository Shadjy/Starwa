document.addEventListener("DOMContentLoaded", () => {
    const progressValue = document.getElementById("progress-value");
    let progress = 0;
    const target = 77; // percentage

    const interval = setInterval(() => {
        if (progress < target) {
            progress++;
            progressValue.textContent = `${progress}%`;
        } else {
            clearInterval(interval);
        }
    }, 25);

    const editBtn = document.querySelector(".edit-btn");
    const editForm = document.getElementById("edit-form");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    // Toon het formulier bij klikken op "Bewerken"
    editBtn.addEventListener("click", () => {
        editForm.style.display = "block";
    });

    // Verberg het formulier bij klikken op "Annuleren"
    cancelBtn.addEventListener("click", () => {
        editForm.style.display = "none";
    });

    // Sla de gegevens op bij klikken op "Opslaan"
    saveBtn.addEventListener("click", () => {
        // Persoonlijke Informatie
        const fullName = document.getElementById("full-name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;
        const birthdate = document.getElementById("birthdate").value;

        document.querySelector(".user-info h2").textContent = fullName;
        document.querySelector(".user-info p").textContent = email;

        const personalInfoCard = document.querySelector(".profile-content .card:nth-child(1)");
        personalInfoCard.innerHTML = `
            <h3>Persoonlijke Informatie</h3>
            <p><strong>Volledige naam:</strong> ${fullName}</p>
            <p><strong>E-mailadres:</strong> ${email}</p>
            <p><strong>Telefoonnummer:</strong> ${phone || "Niet ingevuld"}</p>
            <p><strong>Adres:</strong> ${address || "Niet ingevuld"}</p>
            <p><strong>Woonplaats:</strong> ${city || "Niet ingevuld"}</p>
            <p><strong>Geboortedatum:</strong> ${birthdate || "Niet ingevuld"}</p>
        `;

        // Ervaring & Opleiding
        const education = document.getElementById("education").value;
        const experience = document.getElementById("experience").value;
        const aboutMe = document.getElementById("about-me").value;

        const experienceCard = document.querySelector(".profile-content .card:nth-child(2)");
        experienceCard.innerHTML = `
            <h3>Ervaring & Opleiding</h3>
            <p><strong>Hoogste opleidingsniveau:</strong> ${education}</p>
            <p><strong>Jaren werkervaring:</strong> ${experience}</p>
            <p><strong>Over mij:</strong> ${aboutMe}</p>
        `;

        // Werkvoorkeuren
        const jobTitle = document.getElementById("job-title").value;
        const industry = document.getElementById("industry").value;
        const workHours = document.getElementById("work-hours").value;
        const salary = document.getElementById("salary").value;
        const travelDistance = document.getElementById("travel-distance").value;
        const benefits = document.getElementById("benefits").value;

        const preferencesCard = document.querySelector(".profile-content .card:nth-child(3)");
        preferencesCard.innerHTML = `
            <h3>Werkvoorkeuren</h3>
            <p><strong>Gewenste functietitel:</strong> ${jobTitle}</p>
            <p><strong>Branche:</strong> ${industry}</p>
            <p><strong>Werktijden voorkeur:</strong> ${workHours}</p>
            <p><strong>Minimum salaris:</strong> ${salary}</p>
            <p><strong>Reisafstand:</strong> ${travelDistance}</p>
            <p><strong>Belangrijke arbeidsvoorwaarden:</strong> ${benefits}</p>
        `;

        // Verberg het formulier
        editForm.style.display = "none";
    });
});