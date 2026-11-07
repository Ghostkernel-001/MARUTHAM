
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // =====================================
  // FARMER PROFILE AND LOGIN
  // =====================================

  const LOGIN_KEY = "marutham-farmer";

  function getFarmer() {
    try {
      return JSON.parse(localStorage.getItem(LOGIN_KEY)) || null;
    } catch {
      return null;
    }
  }

  function updateGreeting() {
    const farmer = getFarmer();
    const greeting = $("farmerGreeting");

    if (greeting) {
      greeting.textContent = farmer
        ? `Welcome, ${farmer.name}!`
        : "Welcome to Marutham!";
    }
  }

  function showLogin() {
    if ($("farmerLogin")) $("farmerLogin").hidden = false;
    if ($("maruthamApp")) $("maruthamApp").hidden = true;
  }

  function showApp() {
    if ($("farmerLogin")) $("farmerLogin").hidden = true;
    if ($("maruthamApp")) $("maruthamApp").hidden = false;
    updateGreeting();
  }

  const savedFarmer = getFarmer();

  if (savedFarmer && savedFarmer.name && savedFarmer.farming) {
    showApp();
  } else {
    showLogin();
  }

  if ($("farmerLoginForm")) {
    $("farmerLoginForm").addEventListener("submit", event => {
      event.preventDefault();

      const name = $("farmerName").value.trim();
      const farming = $("farmingType").value;

      if (!name || !farming) {
        alert("Please enter your name and select your farming type.");
        return;
      }

      const farmer = { name, farming };

      try {
        localStorage.setItem(LOGIN_KEY, JSON.stringify(farmer));
        localStorage.setItem("marutham-name", name);
        localStorage.setItem("marutham-farming", farming);
      } catch {
        alert("Could not save your profile in this browser.");
        return;
      }

      showApp();
      showScreen("home");
    });
  }

  // =====================================
  // SCREEN NAVIGATION
  // =====================================

  function showScreen(screenName) {
    if (screenName === "profile") {
      editFarmerProfile();
      return;
    }

    if (screenName === "more") {
      alert(
        "MARUTHAM\n\n" +
        "Smart Agriculture Assistance\n" +
        "Your Farm. Your Language. Your Smart Companion."
      );
      return;
    }

    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    const selected = $(screenName);
    if (!selected) return;

    selected.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.screen === screenName
      );
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.showScreen = showScreen;

  window.goToServices = function () {
    const services = document.querySelector(".service-grid");
    if (services) {
      services.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  function editFarmerProfile() {
    const farmer = getFarmer() || {
      name: "",
      farming: ""
    };

    const newName = prompt("Enter farmer name:", farmer.name);
    if (newName === null) return;

    const cleanName = newName.trim();

    if (!cleanName) {
      alert("Farmer name cannot be empty.");
      return;
    }

    const farmingOptions = [
      "Crop Farming",
      "Dairy Farming",
      "Poultry Farming",
      "Horticulture",
      "Organic Farming",
      "Mixed Farming",
      "Other"
    ];

    const currentIndex = farmingOptions.indexOf(farmer.farming);
    const message =
      "Choose farming type:\n" +
      farmingOptions.map((item, index) =>
        `${index + 1}. ${item}`
      ).join("\n");

    const choice = prompt(
      message,
      currentIndex >= 0 ? String(currentIndex + 1) : "1"
    );

    if (choice === null) return;

    const index = Number(choice) - 1;

    if (!Number.isInteger(index) || index < 0 || index >= farmingOptions.length) {
      alert("Invalid farming type selection.");
      return;
    }

    const updated = {
      name: cleanName,
      farming: farmingOptions[index]
    };

    try {
      localStorage.setItem(LOGIN_KEY, JSON.stringify(updated));
      localStorage.setItem("marutham-name", updated.name);
      localStorage.setItem("marutham-farming", updated.farming);
    } catch {
      alert("Could not save the updated profile.");
      return;
    }

    updateGreeting();
    alert("Farmer profile updated successfully!");
    showScreen("home");
  }

  document.querySelectorAll("[data-screen]").forEach(button => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.screen);
    });
  });

  if ($("navMic")) {
    $("navMic").addEventListener("click", () => {
      showScreen("voice");
      setTimeout(startVoice, 250);
    });
  }

  // =====================================
  // CROP IMAGE UPLOAD
  // =====================================

  let cropImageURL = null;

  if ($("cropImage")) {
    $("cropImage").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        $("cropStatus").textContent = "Please select an image file.";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        $("cropStatus").textContent =
          "Please choose an image smaller than 10 MB.";
        return;
      }

      if (cropImageURL) URL.revokeObjectURL(cropImageURL);

      cropImageURL = URL.createObjectURL(file);
      $("cropPreview").src = cropImageURL;

      $("cropStatus").textContent =
        "Image selected successfully: " + file.name;
    });
  }

  if ($("resetCrop")) {
    $("resetCrop").addEventListener("click", () => {
      $("cropImage").value = "";

      if (cropImageURL) {
        URL.revokeObjectURL(cropImageURL);
        cropImageURL = null;
      }

      $("cropPreview").src =
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900";

      $("cropStatus").textContent = "Select a crop image to begin.";

      $("cropResult").textContent =
        "Upload a clear photo and describe the symptoms to receive basic next-step guidance.";
    });
  }

  if ($("analyzeCrop")) {
    $("analyzeCrop").addEventListener("click", () => {
      if (!cropImageURL) {
        $("cropStatus").textContent =
          "Please upload a crop image first.";
        return;
      }

      $("cropStatus").textContent =
        "Image preview is ready.";

      $("cropResult").textContent =
        "Image uploaded successfully. Actual disease identification is not connected yet. Connect an AI crop-diagnosis backend to produce a real result.";
    });
  }

  // =====================================
  // CROP SYMPTOM GUIDANCE
  // =====================================

  if ($("cropGuide")) {
    $("cropGuide").addEventListener("click", () => {
      const crop = $("cropName").value.trim();
      const symptom = $("cropSymptoms").value;
      const when = $("cropWhen").value;
      const result = $("cropResult");

      if (!crop || !symptom) {
        result.textContent =
          "Please enter the crop name and choose the closest symptom.";
        return;
      }

      const advice = {
        yellow:
          "Yellow leaves can have several causes, including water stress, nutrient issues or disease. Check whether the yellowing starts on older or newer leaves and whether the field is too wet or too dry.",

        spots:
          "Leaf spots may be caused by fungal, bacterial or other damage. Avoid wetting leaves during irrigation, and take clear close-up and whole-plant photos.",

        holes:
          "Inspect the underside of leaves and nearby plants for insects or caterpillars. Note how many plants are affected. Do not spray an unidentified chemical.",

        wilting:
          "Check soil moisture near the roots and inspect whether only one area or the whole field is affected.",

        rot:
          "Rot can spread under wet conditions. Avoid waterlogging, keep affected produce separate, and ask a local agriculture expert to inspect the plant.",

        growth:
          "Slow growth can relate to seed quality, water, soil condition, pests or nutrients. Use a soil test before changing fertiliser.",

        other:
          "Take a clear photo of the whole plant and a close-up of the affected part. Note when it started."
      };

      result.textContent =
        "Crop: " + crop +
        (when ? " · First noticed: " + when : "") +
        ". " + advice[symptom] +
        " This is general guidance, not a confirmed diagnosis. Confirm with your local agriculture officer or KVK before treatment.";

      $("cropStatus").textContent =
        "Your symptom details are ready. Photo-based AI diagnosis is not connected in this demo.";
    });
  }

  // =====================================
  // SOIL IMAGE PREVIEW
  // =====================================

  let soilImageURL = null;

  if ($("soilImage")) {
    $("soilImage").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Please choose an image smaller than 10 MB.");
        return;
      }

      if (soilImageURL) URL.revokeObjectURL(soilImageURL);

      soilImageURL = URL.createObjectURL(file);

      $("soilPreview").src = soilImageURL;
      $("soilPreview").hidden = false;
    });
  }

  // =====================================
  // SOIL VALUE SUMMARY
  // =====================================

  if ($("soilAnalyze")) {
    $("soilAnalyze").addEventListener("click", () => {
      const phValue = $("soilPH").value.trim();
      const nValue = $("nitrogen").value.trim();
      const pValue = $("phosphorus").value.trim();
      const kValue = $("potassium").value.trim();

      if (!phValue && !nValue && !pValue && !kValue) {
        $("soilOutput").innerHTML =
          "<h3>🌱 Soil Analysis Result</h3>" +
          "<p>No lab values entered. Use the simple guidance questions above, or upload your Soil Health Card. Do not guess nutrient values.</p>";
        return;
      }

      if (!phValue || !nValue || !pValue || !kValue) {
        $("soilOutput").innerHTML =
          "<h3>🌱 Soil Analysis Result</h3>" +
          "<p>Enter all four values exactly as printed on your report, or leave all blank and use the simple guidance option.</p>";
        return;
      }

      const ph = Number(phValue);
      const n = Number(nValue);
      const p = Number(pValue);
      const k = Number(kValue);

      if (
        ![ph, n, p, k].every(Number.isFinite) ||
        ph < 0 || ph > 14 ||
        n < 0 || p < 0 || k < 0
      ) {
        $("soilOutput").innerHTML =
          "<h3>🌱 Soil Analysis Result</h3>" +
          "<p>Check the report values. pH must be 0–14 and nutrient values cannot be negative.</p>";
        return;
      }

      const phMessage =
        ph < 6.5 ? "Acidic" :
        ph > 7.5 ? "Alkaline" :
        "Near neutral";

      $("soilOutput").innerHTML = `
        <h3>🌱 Soil Report Summary</h3>
        <div class="nutrient-row">Soil pH: <b>${ph} (${phMessage})</b></div>
        <div class="nutrient-row">Nitrogen (N): <b>${n}</b></div>
        <div class="nutrient-row">Phosphorus (P): <b>${p}</b></div>
        <div class="nutrient-row">Potassium (K): <b>${k}</b></div>
        <p>These are copied values, not a new test. Nutrient interpretation needs the units, test method and local recommendations.</p>
      `;
    });
  }

  // =====================================
  // SIMPLE SOIL GUIDANCE
  // =====================================

  if ($("soilGuide")) {
    $("soilGuide").addEventListener("click", () => {
      const crop = $("soilCrop").value.trim();
      const concern = $("soilConcern").value;
      const output = $("soilGuideOutput");

      if (!crop || !concern) {
        output.textContent =
          "Please tell us the crop and choose the main soil concern.";
        return;
      }

      const advice = {
        poor:
          "Poor growth can have many causes. Check irrigation, drainage, seed quality and visible pests. Arrange a soil test before adding fertiliser.",

        water:
          "Standing water may mean drainage is poor. Avoid unnecessary irrigation and ask a local agriculture officer about field drainage suited to your soil and crop.",

        dry:
          "Fast drying may be related to soil texture, heat or irrigation. Check moisture below the surface and ask about locally suitable mulching and irrigation methods.",

        salty:
          "A white crust can be a sign of salt accumulation, but appearance alone cannot confirm it. Request a soil and irrigation-water test before trying any treatment.",

        none:
          "Maintain soil cover where practical, add only well-decomposed organic matter, avoid unnecessary tillage, and use a Soil Health Card to guide nutrient inputs."
      };

      output.textContent =
        "For " + crop + ": " + advice[concern] +
        " This is general guidance, not a soil test. A soil photo cannot measure pH or N-P-K.";
    });
  }

  // =====================================
  // VOICE AND TEXT ASSISTANT
  // =====================================

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  let recognition = null;
  let listening = false;

  const chatArea = document.querySelector(".chat-area");

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      if ($("voiceStatus")) {
        $("voiceStatus").textContent =
          "Speech output is not supported in this browser.";
      }
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = /[\u0C80-\u0CFF]/.test(text) ? "kn-IN" : "en-IN";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }

  function addChatMessage(message, sender) {
    if (!chatArea) return;

    const element = document.createElement("div");

    element.className =
      sender === "user"
        ? "chat-message user-message"
        : "chat-message assistant-message";

    if (sender === "assistant") {
      const logo = document.createElement("span");
      logo.className = "chat-logo";
      logo.textContent = "🌿";

      const content = document.createElement("div");
      content.textContent = message;

      element.appendChild(logo);
      element.appendChild(content);
    } else {
      element.textContent = message;
    }

    chatArea.appendChild(element);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function displayConversation(question, answer) {
    if ($("userMessage")) $("userMessage").hidden = true;
    if ($("assistantMessage")) $("assistantMessage").hidden = true;

    addChatMessage(question, "user");
    addChatMessage(answer, "assistant");

    speak(answer);
  }

  // =====================================
  // QUESTION PROCESSING
  // =====================================

  function processQuestion(question) {
    const q = question.toLowerCase().trim();
    if (!q) return;

    const kannada = /[\u0C80-\u0CFF]/.test(question);

    let answer = "";
    let destination = "";

    const say = (english, kannadaText) =>
      kannada ? kannadaText : english;

    const has = (...terms) =>
      terms.some(term => q.includes(term));

    if (
      has("hello", "good morning", "good evening", "ನಮಸ್ಕಾರ", "ಹಾಯ್", "ಶುಭೋದಯ") ||
      /(^|\s)(hi|hey)(\s|$)/.test(q)
    ) {
      answer = say(
        "Hello! Welcome to Marutham. You can ask me about your crop, soil, water, seeds, fertiliser, weather, market or government schemes. What are you growing?",
        "ನಮಸ್ಕಾರ! Marutham ಗೆ ಸ್ವಾಗತ. ಬೆಳೆ, ಮಣ್ಣು, ನೀರು, ಬೀಜ, ಗೊಬ್ಬರ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು. ನೀವು ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ?"
      );

    } else if (has("thank", "ಧನ್ಯವಾದ")) {
      answer = say(
        "You're welcome! What else would you like help with on your farm?",
        "ಸ್ವಾಗತ! ನಿಮ್ಮ ಕೃಷಿಗೆ ಇನ್ನೇನು ಸಹಾಯ ಬೇಕು?"
      );

    } else if (has("scheme", "ಯೋಜನೆ", "ಸರ್ಕಾರ", "pm kisan", "subsidy", "ಸಬ್ಸಿಡಿ", "ಪಿಂಚಣಿ")) {
      answer = say(
        "Open Government Schemes to search farmer programmes. Check eligibility, dates and documents on the official government portal before applying.",
        "ರೈತರ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗಾಗಿ Schemes ವಿಭಾಗ ತೆರೆಯಿರಿ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅರ್ಹತೆ, ದಿನಾಂಕ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ತಾಣದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ."
      );
      destination = "schemes";

    } else if (has("loan", "credit", "kcc", "ಸಾಲ", "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್")) {
      answer = say(
        "You can check the Kisan Credit Card information in Government Schemes. Ask your bank about current eligibility, interest and documents.",
        "Kisan Credit Card ಮಾಹಿತಿಗಾಗಿ Government Schemes ತೆರೆಯಿರಿ. ಪ್ರಸ್ತುತ ಅರ್ಹತೆ, ಬಡ್ಡಿ ಮತ್ತು ದಾಖಲೆಗಳಿಗಾಗಿ ಬ್ಯಾಂಕ್‌ನಲ್ಲಿ ವಿಚಾರಿಸಿ."
      );
      destination = "schemes";

    } else if (has("insurance", "fasal", "crop cover", "ವಿಮೆ", "ಬೆಳೆ ವಿಮೆ")) {
      answer = say(
        "Open Government Schemes and check Pradhan Mantri Fasal Bima Yojana. Coverage depends on notified crops, areas and enrollment dates.",
        "Government Schemes ನಲ್ಲಿ ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ. ವಿಮೆ ಅಧಿಸೂಚಿತ ಬೆಳೆ, ಪ್ರದೇಶ ಮತ್ತು ನೋಂದಣಿ ದಿನಾಂಕಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ."
      );
      destination = "schemes";

    } else if (has("market", "price", "mandi", "rate", "ಮಾರುಕಟ್ಟೆ", "ಬೆಲೆ", "ದರ", "sell", "selling", "ಮಾರಾಟ", "ಮಾರಬೇಕು")) {
      answer = say(
        "Open Agri Marketplace to explore the demo listings. Live mandi prices and real transactions are not connected in this prototype; verify prices with a local market.",
        "ಡೆಮೋ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಲು Agri Marketplace ತೆರೆಯಿರಿ. ನೈಜ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ; ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಬೆಲೆ ಪರಿಶೀಲಿಸಿ."
      );
      destination = "market";

    } else if (has("soil", "ph", "ಮಣ್ಣು", "ಮಣ್ಣಿನ", "soil health card")) {
      answer = say(
        "Open Soil Intelligence. If you have a Soil Health Card, upload its photo. You can also open the public Soil Health Card sample dataset shown there. Do not guess pH or nutrient values; a soil photo cannot measure them.",
        "Soil Intelligence ತೆರೆಯಿರಿ. Soil Health Card ಇದ್ದರೆ ಅದರ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಅಲ್ಲಿ ಸಾರ್ವಜನಿಕ Soil Health Card ಮಾದರಿ ಡೇಟಾವನ್ನೂ ತೆರೆಯಬಹುದು. pH ಅಥವಾ ಪೋಷಕಾಂಶಗಳ ಮೌಲ್ಯ ಊಹಿಸಬೇಡಿ; ಮಣ್ಣಿನ ಫೋಟೋದಿಂದ ಅವುಗಳನ್ನು ಅಳೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ."
      );
      destination = "soil";

    } else if (has("fertilizer", "fertiliser", "manure", "urea", "ಗೊಬ್ಬರ", "ರಸಗೊಬ್ಬರ")) {
      answer = say(
        "The right fertiliser depends on the crop and soil-test report. Do not guess the dose. Check the Soil Health Card and ask a local agriculture officer for the crop-specific recommendation.",
        "ಸರಿಯಾದ ಗೊಬ್ಬರವು ಬೆಳೆ ಮತ್ತು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ವರದಿಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ಪ್ರಮಾಣವನ್ನು ಊಹಿಸಬೇಡಿ. Soil Health Card ಪರಿಶೀಲಿಸಿ, ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯಿಂದ ಬೆಳೆ-ನಿರ್ದಿಷ್ಟ ಸಲಹೆ ಪಡೆಯಿರಿ."
      );
      destination = "soil";

    } else if (has("water", "irrigation", "watering", "ನೀರು", "ನೀರಾವರಿ")) {
      answer = say(
        "Water needs depend on crop stage, soil moisture and weather. Check moisture near the root zone and avoid waterlogging. Tell me your crop and growth stage for more focused guidance.",
        "ನೀರಿನ ಅಗತ್ಯವು ಬೆಳೆ ಹಂತ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಹವಾಮಾನವನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ. ಬೇರುಗಳ ಬಳಿಯ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ; ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಬೆಳೆ ಮತ್ತು ಅದರ ಹಂತ ತಿಳಿಸಿದರೆ ಹೆಚ್ಚು ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಹುದು."
      );

    } else if (has("seed", "seeds", "sowing", "ಬೀಜ", "ಬಿತ್ತನೆ")) {
      answer = say(
        "Choose certified seed suited to your area and season. Sowing time and seed rate vary by crop and location; confirm them with your local agriculture department.",
        "ನಿಮ್ಮ ಪ್ರದೇಶ ಮತ್ತು ಹಂಗಾಮಿಗೆ ಸೂಕ್ತವಾದ ಪ್ರಮಾಣೀಕೃತ ಬೀಜ ಆಯ್ಕೆಮಾಡಿ. ಬಿತ್ತನೆ ಸಮಯ ಮತ್ತು ಬೀಜದ ಪ್ರಮಾಣ ಬೆಳೆ ಹಾಗೂ ಪ್ರದೇಶದ ಮೇಲೆ ಅವಲಂಬಿತ; ಸ್ಥಳೀಯ ಕೃಷಿ ಇಲಾಖೆಯಲ್ಲಿ ಪರಿಶೀಲಿಸಿ."
      );

    } else if (has("weather", "rain", "rainfall", "temperature", "ಮಳೆ", "ಹವಾಮಾನ")) {
      answer = say(
        "Marutham does not have live weather data connected yet. Check the latest district forecast from the official weather service before spraying, sowing or irrigation.",
        "Marutham ನಲ್ಲಿ ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ. ಸಿಂಪಡಣೆ, ಬಿತ್ತನೆ ಅಥವಾ ನೀರಾವರಿಗೆ ಮೊದಲು ಅಧಿಕೃತ ಹವಾಮಾನ ಇಲಾಖೆಯ ಜಿಲ್ಲಾ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ."
      );

    } else if (has("harvest", "harvesting", "ಕೊಯ್ಲು", "ಸುಗ್ಗಿ")) {
      answer = say(
        "Harvest timing depends on the crop and maturity signs. Tell me the crop and how many days it has been growing, or confirm the stage with a local agriculture expert.",
        "ಕೊಯ್ಲಿನ ಸಮಯವು ಬೆಳೆ ಮತ್ತು ಪಕ್ವತೆಯ ಲಕ್ಷಣಗಳ ಮೇಲೆ ಅವಲಂಬಿತ. ಯಾವ ಬೆಳೆ ಮತ್ತು ಎಷ್ಟು ದಿನಗಳಿಂದ ಬೆಳೆದಿದೆ ಎಂದು ತಿಳಿಸಿ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ."
      );

    } else if (has("storage", "store crop", "ಧಾನ್ಯ ಸಂಗ್ರಹ", "ಸಂಗ್ರಹಣೆ")) {
      answer = say(
        "Dry harvested grain properly and store it in a clean, dry, pest-protected place. The correct moisture level depends on the crop, so confirm crop-specific storage guidance.",
        "ಕೊಯ್ಲಾದ ಧಾನ್ಯವನ್ನು ಸರಿಯಾಗಿ ಒಣಗಿಸಿ, ಸ್ವಚ್ಛ ಮತ್ತು ಒಣ, ಕೀಟಗಳಿಂದ ರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ಸರಿಯಾದ ತೇವಾಂಶವು ಬೆಳೆಯ ಪ್ರಕಾರ ಬದಲಾಗುತ್ತದೆ."
      );

    } else if (has("today", "what should i do", "today's work", "ಇಂದು", "ಏನು ಮಾಡಲಿ")) {
      answer = say(
        "A safe daily farm check: inspect a few plants for new symptoms, check soil moisture, look for standing water and check the official local weather forecast. Avoid spraying or adding fertiliser without identifying the need. What crop are you growing?",
        "ಇಂದಿನ ಸರಳ ಪರಿಶೀಲನೆ: ಕೆಲವು ಗಿಡಗಳಲ್ಲಿ ಹೊಸ ಲಕ್ಷಣಗಳಿವೆಯೇ ನೋಡಿ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ, ನೀರು ನಿಂತಿದೆಯೇ ನೋಡಿ ಮತ್ತು ಅಧಿಕೃತ ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ. ಅಗತ್ಯ ತಿಳಿಯದೆ ಔಷಧಿ ಅಥವಾ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ. ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ?"
      );

    } else if (has("crop", "plant", "leaf", "leaves", "disease", "pest", "insect", "yellow", "spots", "wilting", "ಬೆಳೆ", "ರೋಗ", "ಕೀಟ", "ಎಲೆ")) {
      answer = say(
        "Open Crop Doctor, upload a clear photo and choose the symptom that best matches what you see. Photo-based AI disease detection is not connected yet, so this prototype cannot confirm a disease. Tell me the crop name and symptom.",
        "Crop Doctor ತೆರೆಯಿರಿ. ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಕಾಣುವ ಲಕ್ಷಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಫೋಟೋ ಆಧಾರಿತ AI ರೋಗ ಪತ್ತೆ ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ; ಆದ್ದರಿಂದ ಈ ಡೆಮೋ ರೋಗವನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಬೆಳೆ ಹೆಸರು ಮತ್ತು ಲಕ್ಷಣ ತಿಳಿಸಿ."
      );
      destination = "crop";

    } else {
      answer = say(
        "I can help with crops, soil, seeds, fertiliser, irrigation, weather, markets and government schemes. Please tell me your crop name and what you want to know, in a short sentence.",
        "ಬೆಳೆ, ಮಣ್ಣು, ಬೀಜ, ಗೊಬ್ಬರ, ನೀರಾವರಿ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ನಿಮ್ಮ ಬೆಳೆ ಹೆಸರು ಮತ್ತು ನಿಮಗೆ ಬೇಕಾದ ಮಾಹಿತಿಯನ್ನು ಚಿಕ್ಕ ವಾಕ್ಯದಲ್ಲಿ ತಿಳಿಸಿ."
      );
    }

    displayConversation(question, answer);

    if (destination) {
      setTimeout(() => showScreen(destination), 900);
    }
  }

  // =====================================
  // TEXT MESSAGE INPUT
  // =====================================

  function sendTextMessage() {
    const input = $("messageInput");
    if (!input) return;

    const question = input.value.trim();
    if (!question) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    input.value = "";
    processQuestion(question);
  }

  if ($("sendMessage")) {
    $("sendMessage").addEventListener("click", sendTextMessage);
  }

  if ($("messageInput")) {
    $("messageInput").addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendTextMessage();
      }
    });
  }

  // =====================================
  // VOICE RECOGNITION
  // =====================================

  function startVoice() {
    if (!SpeechRecognition) {
      $("voiceStatus").textContent =
        "Voice recognition is unavailable. Open this website in Chrome and allow microphone access.";
      return;
    }

    if (listening) {
      recognition.stop();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "kn-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      $("voiceButton").classList.add("listening");
      $("voiceStatus").textContent = "Listening...";
      $("voiceHint").textContent = "Speak now";
    };

    recognition.onresult = event => {
      const question = event.results[0][0].transcript;

      $("voiceHint").textContent =
        "ನಿಮ್ಮ ಪ್ರಶ್ನೆ: " + question;

      processQuestion(question);
    };

    recognition.onerror = event => {
      $("voiceStatus").textContent =
        "Microphone error: " + event.error;
    };

    recognition.onend = () => {
      listening = false;
      recognition = null;

      $("voiceButton").classList.remove("listening");
      $("voiceStatus").textContent = "Tap to speak again";
    };

    try {
      recognition.start();
    } catch {
      $("voiceStatus").textContent =
        "Could not start microphone. Please try again.";

      recognition = null;
      listening = false;
    }
  }

  if ($("voiceButton")) {
    $("voiceButton").addEventListener("click", startVoice);
  }

  window.startVoice = startVoice;

  // =====================================
  // STOP VOICE
  // =====================================

  if ($("stopVoice")) {
    $("stopVoice").addEventListener("click", () => {
      if (recognition && listening) recognition.stop();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if ($("voiceStatus")) {
        $("voiceStatus").textContent = "Voice assistant stopped.";
      }
    });
  }

  // =====================================
  // EXAMPLE QUESTIONS
  // =====================================

  window.askExample = function (type) {
    const examples = {
      crop: "ನನ್ನ ಬೆಳೆಗೆ ರೋಗ ಬಂದಿದೆ",
      soil: "ನನ್ನ ಮಣ್ಣಿನ ಮಾಹಿತಿ ಬೇಕು",
      scheme: "ನನಗೆ ಕೃಷಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಬೇಕು"
    };

    processQuestion(
      examples[type] || "ನನಗೆ ಕೃಷಿ ಸಹಾಯ ಬೇಕು"
    );
  };

  // =====================================
  // INITIAL SCREEN
  // =====================================

  showScreen("home");

});
