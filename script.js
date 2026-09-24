const wordBank = {
    short: [
        "The quick brown fox jumps over the lazy dog.",
        "Typing is a useful skill for everyday life.",
        "Practice makes perfect when learning to type.",
        "She sells seashells by the seashore.",
        "Always keep your fingers on the home row."
    ],
    medium: [
        "The quick brown fox jumps over the lazy dog. Typing is a useful skill for everyday life. Practice makes perfect when learning to type",
        "Always keep your fingers on the home row. She sells seashells by the seashore. Practice makes perfect when learning to type",
        "Typing is a useful skill for everyday life. The quick brown fox jumps over the lazy dog. Always keep your fingers on the home row"
    ],
    long: [
        "The quick brown fox jumps over the lazy dog. Typing is a useful skill for everyday life. Practice makes perfect when learning to type. She sells seashells by the seashore. Always keep your fingers on the home row",
        "Always keep your fingers on the home row. Practice makes perfect when learning to type. The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Typing is a useful skill for everyday life."
    ]
};

const modeButtons = document.querySelectorAll(".mode-btn");
const textDisplay = document.getElementById("text-display");
const textInput = document.getElementById("text-input");

const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeLeftEl = document.getElementById("time-left");
const errorsEl = document.getElementById("errors");
const progressBar = document.getElementById("progress-bar");

const resultCard = document.getElementById("result-card");
const resultSummary = document.getElementById("result-summary");

const modeTimes = {
    short: 15,
    medium: 30,
    long: 60
};

const HISTORY_KEY = "keysmash-history";

let currentMode = "short";
let currentText = "";
let letterSpans = [];
let currentIndex = 0;
let errorCount = 0;
let testStarted = false;
let timeLeft = modeTimes[currentMode];
let timerId = null;
let missedKeys = {};

function pickText(mode) {
    const bank = wordBank[mode];
    const randomIndex = Math.floor(Math.random() * bank.length);
    return bank[randomIndex];
}

function renderText(text) {
    textDisplay.innerHTML = "";
    letterSpans = [];

    for (let i = 0; i < text.length; i++) {
        const span = document.createElement("span");
        span.innerText = text[i];
        textDisplay.appendChild(span);
        letterSpans.push(span);
    }

    if (letterSpans.length > 0) {
        letterSpans[0].classList.add("current");
    }
}

function loadNewText(mode) {
    currentMode = mode;
    currentText = pickText(mode);
    currentIndex = 0;
    errorCount = 0;
    testStarted = false;
    timeLeft = modeTimes[mode];
    missedKeys = {};

    clearInterval(timerId);
    timerId = null;

    textInput.value = "";
    textInput.disabled = false;

    renderText(currentText);
    updateStatsDisplay(0, 100, timeLeft, 0);
    resultCard.classList.add("hidden");
}

modeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        modeButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        const mode = btn.innerText.trim().toLowerCase();
        loadNewText(mode);
    });
});

textInput.addEventListener("input", function () {
    const typed = textInput.value;

    if (!testStarted && typed.length > 0) {
        testStarted = true;
        startTimer();
    }

    errorCount = 0;

    for (let i = 0; i < letterSpans.length; i++) {
        const span = letterSpans[i];
        span.classList.remove("correct", "incorrecet", "current");

        if (i < typed.length) {
            if (typed[i] === currentText[i]) {
                span.classList.add("correct");
            } else {
                span.classList.add("incorrecet");
                errorCount++;

                const missedChar = currentText[i].toLowerCase();
                if (!missedKeys[missedChar]) {
                    missedKeys[missedChar] = 0;
                }
                missedKeys[missedChar]++;
            }
        }
    }

    currentIndex = typed.length;

    if (currentIndex < letterSpans.length) {
        letterSpans[currentIndex].classList.add("current");
    }

    const percentDone = (currentIndex / currentText.length) * 100;
    progressBar.style.setProperty("--w", percentDone + "%");

    const accuracy = calculateAccuracy(currentIndex, errorCount);
    const wpm = calculateWPM(currentIndex, errorCount);
    updateStatsDisplay(wpm, accuracy, timeLeft, errorCount);

    if (currentIndex >= currentText.length) {
        finishTest();
    }
});

function startTimer() {
    timerId = setInterval(function () {
        timeLeft--;
        timeLeftEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

function calculateWPM(charsTyped, errors) {
    const correctChars = charsTyped - errors;
    const secondsElapsed = modeTimes[currentMode] - timeLeft;

    if (secondsElapsed <= 0 || correctChars <= 0) {
        return 0;
    }

    const minutes = secondsElapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes);
    return wpm;
}

function calculateAccuracy(charsTyped, errors) {
    if (charsTyped === 0) {
        return 100;
    }
    const correct = charsTyped - errors;
    return Math.round((correct / charsTyped) * 100);
}

function updateStatsDisplay(wpm, accuracy, time, errors) {
    wpmEl.innerText = wpm;
    accuracyEl.innerText = accuracy + "%";
    timeLeftEl.innerText = time;
    errorsEl.innerText = errors;
}

function getWorstKey() {
    let worstKey = "-";
    let worstCount = 0;

    for (const key in missedKeys) {
        if (missedKeys[key] > worstCount) {
            worstCount = missedKeys[key];
            worstKey = key;
        }
    }

    return worstKey;
}

function saveResult(wpm, accuracy, timeTaken) {
    const existing = localStorage.getItem(HISTORY_KEY);
    const history = existing ? JSON.parse(existing) : [];

    history.push({
        date: new Date().toLocaleDateString(),
        mode: currentMode,
        wpm: wpm,
        accuracy: accuracy,
        timeTaken: timeTaken,
        worstKey: getWorstKey()
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function finishTest() {
    clearInterval(timerId);
    textInput.disabled = true;

    const finalWpm = calculateWPM(currentIndex, errorCount);
    const finalAccuracy = calculateAccuracy(currentIndex, errorCount);
    const timeTaken = modeTimes[currentMode] - timeLeft;

    saveResult(finalWpm, finalAccuracy, timeTaken);

    resultSummary.innerHTML = "you typed at <strong>" + finalWpm + "</strong> wpm with <strong>" + finalAccuracy + "%</strong> accuracy";
    resultCard.classList.remove("hidden");
}

const restartBtn = document.getElementById("restart-btn");
const closeCardBtn = document.getElementById("close-card-btn");

restartBtn.addEventListener("click", function () {
    loadNewText(currentMode);
});

closeCardBtn.addEventListener("click", function () {
    resultCard.classList.add("hidden");
});

loadNewText(currentMode);