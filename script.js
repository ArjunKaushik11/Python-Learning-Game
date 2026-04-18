// 🐍 CodeMaster – Complete Final Script
let mode = "";
let score = 0;
let matches = 0;
let attempts = 0;
let flipped = [];
let timer;
let timeLeft = 60;
const board = document.getElementById("game-board");

// 🧮 Update accuracy & high score
function updateStats() {
  let accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;

  // Update stats on screen
  document.getElementById('acc').textContent = accuracy;
  document.getElementById('best').textContent = localStorage.getItem('bestScore') || 0;

  // Save high score if beaten
  if (score > (localStorage.getItem('bestScore') || 0)) {
    localStorage.setItem('bestScore', score);
    document.getElementById('best').textContent = score;
  }

  // If live display is visible during gameplay
  const liveAcc = document.getElementById('liveAcc');
  if (liveAcc) liveAcc.textContent = `Accuracy: ${accuracy}%`;
}

// 🎮 Start game
function startGame(selectedMode) {
  // 🧹 Clear previous timer
  clearInterval(timer);
  document.getElementById('timer').textContent = "";

  mode = selectedMode;
  score = 0;
  matches = 0;
  attempts = 0;
  flipped = [];
  updateStats();

  document.getElementById('score').textContent = "Score: 0";
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');

  // 🕒 Show timer only in Speed Mode
  if (mode === 'speed') {
    document.getElementById('timer').style.display = "inline";
    startTimer();
  } else {
    document.getElementById('timer').style.display = "none";
  }

  if (mode === 'match' || mode === 'learn' || mode === 'speed') loadMatchGame();
  if (mode === 'quiz') loadQuiz();
  if (mode === 'challenge') loadChallenge(); // placeholder for future
}

// 🕒 Speed Mode Timer
function startTimer() {
  timeLeft = 60;
  document.getElementById('timer').textContent = `Time: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("⏰ Time’s up! Final Score: " + score);
      showMenu();
    }
  }, 1000);
}

// 🧩 Load Match / Learn / Speed mode
async function loadMatchGame() {
  const topic = document.getElementById("topicSelect")?.value || "basics";
  const res = await fetch(`data/${topic}.json`);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    board.innerHTML = "<p>No data found for this topic 😕</p>";
    return;
  }

  const selected = data.sort(() => Math.random() - 0.5).slice(0, 6);
  const cards = [];

  selected.forEach(q => {
    cards.push({ type: "code", text: q.code, id: q.output, explain: q.explanation });
    cards.push({ type: "output", text: q.output, id: q.output, explain: q.explanation });
  });

  const shuffled = cards.sort(() => Math.random() - 0.5);
  board.innerHTML = "";

  shuffled.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.dataset.id = c.id;
    div.dataset.explain = c.explain || "";
    div.innerHTML = `
      <div class="front">?</div>
      <div class="back">${c.text}</div>
    `;
    div.onclick = () => flipCard(div);
    board.appendChild(div);
  });

  if (mode === "learn") previewCards();
}

// 🔄 Card flip logic
function flipCard(card) {
  if (flipped.length < 2 && !card.classList.contains("flipped")) {
    card.classList.add("flipped");
    flipped.push(card);

    if (flipped.length === 2) {
      attempts++;
      if (flipped[0].dataset.id === flipped[1].dataset.id) {
        matches++;
        score += 10;
        flipped = [];
        updateStats();
        document.getElementById('score').textContent = "Score: " + score;
        showPopup(flipped[0].dataset.explain);
      } else {
        setTimeout(() => {
          flipped.forEach(c => c.classList.remove("flipped"));
          flipped = [];
          updateStats();
        }, 800);
      }
    }
  }
}

// 📚 Learn Mode auto preview
function previewCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => c.classList.add('flipped'));
  setTimeout(() => {
    cards.forEach(c => c.classList.remove('flipped'));
  }, 4000);
}

// 💬 Small explanation popup
function showPopup(text) {
  const popup = document.getElementById("popup");
  popup.innerHTML = text;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 2500);
}

// 🧠 Quiz Mode
async function loadQuiz() {
  const topic = document.getElementById("topicSelect")?.value || "basics";
  const res = await fetch(`data/${topic}_quiz.json`);
  const qs = await res.json();
  const q = qs[Math.floor(Math.random() * qs.length)];

  board.innerHTML = `
    <h2>${q.question}</h2>
    <div class="quiz-options">
      ${q.options.map(o => `<button class='opt' onclick='checkAns("${o}","${q.answer}")'>${o}</button>`).join('')}
    </div>
  `;
}

// ✅ Check quiz answer
function checkAns(selected, correct) {
  attempts++;
  if (selected === correct) {
    score += 10;
    matches++;
    showPopup("✅ Correct! 🎉");
  } else {
    showPopup("❌ Wrong! Try again!");
  }
  updateStats();
  document.getElementById('score').textContent = "Score: " + score;
  setTimeout(loadQuiz, 1000);
}

// ⚡ Speed / Match end back to menu
function showMenu() {
  clearInterval(timer);
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('game-screen').classList.add('hidden');

  // 🎉 Show motivation when user completes a mode
  showMotivationQuote();
}


// 🎯 Placeholder for Challenge Mode (to be added later)
// ⚔️ Challenge Mode — Final Version
// ⚔️ Challenge Mode – Upgraded with Summary Screen
async function loadChallenge() {
  clearInterval(timer);
  let timeLeft = 45;
  document.getElementById('timer').style.display = "inline";
  document.getElementById('timer').textContent = `Time: ${timeLeft}s`;
  document.getElementById('score').textContent = "Score: " + score;

  // ⏱️ Start timer
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showChallengeSummary();
    }
  }, 1000);

  // 📂 Load all topic quizzes
  const files = ['basics', 'loops', 'functions'];
  let questions = [];
  for (const file of files) {
    try {
      const res = await fetch(`data/${file}_quiz.json`);
      const data = await res.json();
      questions = questions.concat(data);
    } catch (e) {
      console.warn(`Missing or invalid: ${file}_quiz.json`);
    }
  }

  // 🔀 Randomize questions
  questions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
  let qIndex = 0;

  // 🧠 Display next question
  function showNextQuestion() {
    if (qIndex >= questions.length) {
      clearInterval(timer);
      showChallengeSummary();
      return;
    }

    const q = questions[qIndex];
    board.innerHTML = `
      <h2>⚔️ Challenge #${qIndex + 1}</h2>
      <p style="font-size:20px;margin:15px 0;">${q.question}</p>
      <div class="quiz-options">
        ${q.options.map(o => `<button class="opt" onclick="checkChallengeAns('${o}','${q.answer}')">${o}</button>`).join('')}
      </div>
      <p style="margin-top:20px; font-size:14px; color:#9ca3af;">Question ${qIndex + 1} of ${questions.length}</p>
    `;
  }

  // ✅ Handle answers + stats
  window.checkChallengeAns = (selected, correct) => {
    attempts++; // every attempt
    if (selected === correct) {
      score += 10;
      matches++;
      showPopup("✅ Correct!");
    } else {
      showPopup("❌ Wrong!");
    }
    updateStats();
    document.getElementById('score').textContent = "Score: " + score;
    qIndex++;
    setTimeout(showNextQuestion, 800);
  };

  // 📊 Summary Screen
  function showChallengeSummary() {
    clearInterval(timer);
    const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;
    const streak = localStorage.getItem("streak") || 1;

    board.innerHTML = `
      <div class="summary">
        <h2>🏆 Challenge Complete!</h2>
        <p><strong>✅ Correct:</strong> ${matches}/${attempts}</p>
        <p><strong>🎯 Accuracy:</strong> ${accuracy}%</p>
        <p><strong>💰 Score:</strong> ${score}</p>
        <p><strong>🔥 Current Streak:</strong> ${streak} days</p>
        <button onclick="showMenu()" class="menu-btn">🏠 Back to Menu</button>
      </div>
    `;

    // Save updated stats
    updateStats();
    showMotivationQuote();
  }

  // ▶️ Start first question
  showNextQuestion();
  // 💬 Motivational Quote Popup
function showMotivationQuote() {
  const quotes = [
    "🔥 Great job! Every line of code makes you stronger.",
    "💡 Keep learning, future Python master!",
    "🎯 Code. Debug. Conquer. Repeat!",
    "🚀 You’re levelling up one concept at a time!",
    "🐍 Python bows to your dedication!",
    "💪 Consistency beats talent — keep going!",
    "🏆 You’re becoming unstoppable!",
    "🧠 Practice makes progress, not perfection!",
    "🌟 One more step toward coding greatness!",
    "🎓 Learning never exhausts the mind."
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const div = document.createElement("div");
  div.className = "motivation-popup";
  div.innerHTML = `<p>${quote}</p>`;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 6000);
}

}
