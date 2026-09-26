const HISTORY_KEY = "keysmash-history";

const modeFilter = document.getElementById("mode-filter");
const viewToggle = document.getElementById("view-toggle");

const wpmStatEl = document.getElementById("wpm-stat");
const accuracyStatEl = document.getElementById("accuracy-stat");
const testsTakenEl = document.getElementById("tests-taken");
const totalTimeEl = document.getElementById("total-time");
const missedKeyEl = document.getElementById("missed-key");

const chartEl = document.getElementById("chart");
const historyBody = document.getElementById("history-body");

function getHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
}

function filterHistory(history, mode) {
    if (mode === "all") {
        return history;
    }
    return history.filter(function (entry) {
        return entry.mode === mode;
    });
}

function renderTable(entries) {
    if (entries.length === 0) {
        historyBody.innerHTML = "<tr><td colspan='4'>no tests taken yet, go type something</td></tr>";
        return;
    }

    historyBody.innerHTML = "";

    const reversed = entries.slice().reverse();

    reversed.forEach(function (entry) {
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + entry.date + "</td>" +
            "<td>" + entry.mode + "</td>" +
            "<td>" + entry.wpm + "</td>" +
            "<td>" + entry.accuracy + "%</td>";
        historyBody.appendChild(row);
    });
}

function renderStats(entries, view) {
    if (entries.length === 0) {
        wpmStatEl.innerText = "0";
        accuracyStatEl.innerText = "0%";
        testsTakenEl.innerText = "0";
        totalTimeEl.innerText = "0m";
        missedKeyEl.innerText = "-";
        return;
    }

    let wpmValue;
    let accuracyValue;

    if (view === "best") {
        wpmValue = Math.max.apply(null, entries.map(function (e) { return e.wpm; }));
        accuracyValue = Math.max.apply(null, entries.map(function (e) { return e.accuracy; }));
    } else {
        const wpmSum = entries.reduce(function (total, e) { return total + e.wpm; }, 0);
        const accSum = entries.reduce(function (total, e) { return total + e.accuracy; }, 0);
        wpmValue = Math.round(wpmSum / entries.length);
        accuracyValue = Math.round(accSum / entries.length);
    }

    wpmStatEl.innerText = wpmValue;
    accuracyStatEl.innerText = accuracyValue + "%";
    testsTakenEl.innerText = entries.length;

    const totalSeconds = entries.reduce(function (total, e) { return total + (e.timeTaken || 0); }, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    totalTimeEl.innerText = totalMinutes + "m";

    missedKeyEl.innerText = getOverAllWorstKey(entries);
}

function getOverAllWorstKey(entries) {
    const counts = {};

    entries.forEach(function (e) {
        if (e.worstKey && e.worstKey !== "-") {
            if (!counts[e.worstKey]) {
                counts[e.worstKey] = 0;
            }
            counts[e.worstKey]++;
        }
    });

    let topKey = "-";
    let topCount = 0;

    for (const key in counts) {
        if (counts[key] > topCount) {
            topCount = counts[key];
            topKey = key;
        }
    }

    return topKey;
}

function renderChart(entries) {
    chartEl.innerHTML = "";

    if (entries.length === 0) {
        chartEl.innerHTML = "<p style='font-size:13px; color:#b6a9cc;'>no data yet</p>";
        return;
    }

    const maxWpm = Math.max.apply(null, entries.map(function (e) { return e.wpm; }));

    entries.forEach(function (e) {
        const bar = document.createElement("div");
        const heightPercent = maxWpm > 0 ? (e.wpm / maxWpm) * 100 : 0;

        bar.style.height = heightPercent + "%";
        bar.style.width = "20px";
        bar.style.background = "#feb236";
        bar.style.borderRadius = "3px 3px 0 0";
        bar.title = e.wpm + " wpm on " + e.date;

        chartEl.appendChild(bar);
    });
}

function renderPage() {
    const history = getHistory();
    const mode = modeFilter.value;
    const view = viewToggle.value;

    const filtered = filterHistory(history, mode);

    renderStats(filtered, view);
    renderTable(filtered);
    renderChart(filtered);
}

modeFilter.addEventListener("change", renderPage);
viewToggle.addEventListener("change", renderPage);

const clearHistoryBtn = document.getElementById("clear-history-btn");

clearHistoryBtn.addEventListener("click", function () {
    const sure = confirm("delete all your test history? can't undo this");
    if (sure) {
        localStorage.removeItem(HISTORY_KEY);
        renderPage();
    }
});

renderPage();