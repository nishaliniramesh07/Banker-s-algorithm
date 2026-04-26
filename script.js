// 🔥 DOM ELEMENTS
const processes = document.getElementById("processes");
const resources = document.getElementById("resources");
const tables = document.getElementById("tables");
const status = document.getElementById("status");
const sequence = document.getElementById("sequence");
const explanationBox = document.getElementById("explanation");

// 🔥 GENERATE TABLES
function generateTables() {
    let n = +processes.value;
    let m = +resources.value;

    let html = "<div class='card'><h3>📊 Allocation</h3>";
    html += createTable("alloc", n, m);

    html += "<h3>📈 Max</h3>";
    html += createTable("max", n, m);

    html += "<h3>💾 Available</h3><table><tr>";
    for (let j = 0; j < m; j++) {
        html += `<td><input id="avail-${j}" value="0"></td>`;
    }
    html += "</tr></table></div>";

    tables.innerHTML = html;

    // 🔥 CREATE REQUEST INPUTS
    let reqHtml = "<h4>Request Vector</h4><table><tr>";
    for (let j = 0; j < m; j++) {
        reqHtml += `<td><input id="req-${j}" value="0"></td>`;
    }
    reqHtml += "</tr></table>";

    document.getElementById("request-inputs").innerHTML = reqHtml;
}

// 🔥 CREATE TABLE
function createTable(prefix, n, m) {
    let t = "<table>";

    for (let i = 0; i < n; i++) {
        t += `<tr id="row-${prefix}-${i}">`;
        for (let j = 0; j < m; j++) {
            t += `<td><input id="${prefix}-${i}-${j}" value="0"></td>`;
        }
        t += "</tr>";
    }

    return t + "</table>";
}

// 🔥 MAIN EXECUTION
async function startExecution() {
    let n = +processes.value;
    let m = +resources.value;

    let alloc = [], max = [], avail = [];

    for (let i = 0; i < n; i++) {
        alloc[i] = [];
        max[i] = [];
        for (let j = 0; j < m; j++) {
            alloc[i][j] = +document.getElementById(`alloc-${i}-${j}`).value;
            max[i][j] = +document.getElementById(`max-${i}-${j}`).value;
        }
    }

    for (let j = 0; j < m; j++) {
        avail[j] = +document.getElementById(`avail-${j}`).value;
    }

    let result = getSteps(n, m, avail, max, alloc);

    if (!result.safe) {
        status.innerHTML = "❌ System is UNSAFE!";
        status.className = "status unsafe";

        explanationBox.innerHTML = `
            <b>No safe sequence found.</b><br>
            Need is greater than Available for some processes.
        `;
        return;
    }

    status.innerHTML = "🟡 Checking system...";
    status.className = "status running";
    sequence.innerHTML = "";
    explanationBox.innerHTML = "";

    await new Promise(r => setTimeout(r, 800));

    for (let step of result.steps) {

        let row = document.getElementById(`row-alloc-${step.process}`);
        row.classList.add("highlight");

        explanationBox.innerHTML = `
            <b>Process P${step.process} selected</b><br><br>
            🔹 Need: [${step.need.join(", ")}]<br>
            🔹 Available: [${step.available.join(", ")}]<br><br>
            👉 Need ≤ Available → Safe
        `;

        status.innerHTML = `⚡ Executing P${step.process}`;

        await new Promise(r => setTimeout(r, 1200));

        let span = document.createElement("span");
        span.innerText = "P" + step.process;
        sequence.appendChild(span);

        row.classList.remove("highlight");
    }

    status.innerHTML = "✅ System is SAFE!";
    status.className = "status safe";

    explanationBox.innerHTML += `
        <br><br><b>✔ Safe Sequence:</b> ${result.sequence.join(" → ")}
    `;
}

// 🔥 RESOURCE REQUEST FUNCTION
function checkRequest() {
    let n = +processes.value;
    let m = +resources.value;
    let p = +document.getElementById("req-process").value;

    let alloc = [], max = [], avail = [], request = [];

    for (let i = 0; i < n; i++) {
        alloc[i] = [];
        max[i] = [];
        for (let j = 0; j < m; j++) {
            alloc[i][j] = +document.getElementById(`alloc-${i}-${j}`).value;
            max[i][j] = +document.getElementById(`max-${i}-${j}`).value;
        }
    }

    for (let j = 0; j < m; j++) {
        avail[j] = +document.getElementById(`avail-${j}`).value;
        request[j] = +document.getElementById(`req-${j}`).value;
    }

    let need = [];
    for (let i = 0; i < n; i++) {
        need[i] = [];
        for (let j = 0; j < m; j++) {
            need[i][j] = max[i][j] - alloc[i][j];
        }
    }

    let output = document.getElementById("request-result");

    // ❌ Request > Need
    for (let j = 0; j < m; j++) {
        if (request[j] > need[p][j]) {
            output.innerHTML = "❌ Request > Need → Not Allowed";
            output.className = "unsafe";
            return;
        }
    }

    // ❌ Request > Available
    for (let j = 0; j < m; j++) {
        if (request[j] > avail[j]) {
            output.innerHTML = "⏳ Not enough resources → Wait";
            output.className = "running";
            return;
        }
    }

    // 🔥 Pretend allocation
    for (let j = 0; j < m; j++) {
        avail[j] -= request[j];
        alloc[p][j] += request[j];
    }

    let result = getSteps(n, m, avail, max, alloc);

    if (result.safe) {
        output.innerHTML = `✅ Request GRANTED<br>Safe Sequence: ${result.sequence.join(" → ")}`;
        output.className = "safe";
    } else {
        output.innerHTML = "❌ Request leads to UNSAFE state";
        output.className = "unsafe";
    }
}