document.addEventListener("DOMContentLoaded", () => {
  const profileCard = document.getElementById("profileCard");
  profileCard.addEventListener("click", () => {
    window.location.href = "profiel.html";
  });

  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName").innerText;
  const profileImageUrl = "";
  if (profileImageUrl) {
    const img = document.createElement("img");
    img.src = profileImageUrl;
    img.alt = profileName;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = "50%";
    profileAvatar.appendChild(img);
  } else {
    profileAvatar.innerText = profileName.charAt(0).toUpperCase();
  }

  // Klik op job open vacature info
  const jobs = document.querySelectorAll(".job");
  jobs.forEach(job => {
    job.addEventListener("click", () => {
      const title = job.querySelector("h3").innerText;
      const location = job.querySelector("p:nth-of-type(1)").innerText;
      const salary = job.querySelector("p:nth-of-type(2)").innerText;
      alert(`Vacature details:\n\n${title}\n${location}\n${salary}`);
    });
  });

  // Klik op berichten open bericht
  const messages = document.querySelectorAll(".message");
  messages.forEach(msg => {
    msg.addEventListener("click", () => {
      const title = msg.querySelector("h3").innerText;
      const firstLine = msg.querySelector("p").innerText;
      alert(`Bericht:\n\n${title}\n${firstLine}`);
    });
  });

  // Bekijk alle matches ga naar matches page
  document.querySelector(".matches .view-all").addEventListener("click", () => {
    window.location.href = "matches.html";
  });

  // Bekijk alle berichten ga naar berichten page
  document.querySelector(".messages .view-all").addEventListener("click", () => {
    window.location.href = "berichten.html";
  });
});
