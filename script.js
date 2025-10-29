const totalStudents = 600;
let halls = [];
let subjects = [];
let allStudents = [];

// --- Generate hall input cards dynamically ---
for (let i = 1; i <= 10; i++) {
  const div = document.createElement("div");
  div.className = "hall-card";
  div.innerHTML = `
    <h3>Hall ${i}</h3>
    <label>Capacity</label>
    <input type="number" id="hall${i}" value="${50 + i * 5}">
  `;
  document.getElementById("hallInputs").appendChild(div);
}

// --- Load student data from CSV ---
function loadCSV() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a CSV file first!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvData = e.target.result.trim().split("\n");
    allStudents = [];
    subjects = [];

    csvData.slice(1).forEach(row => {
      const [roll, subject] = row.split(",").map(v => v.trim());
      if (roll && subject) {
        allStudents.push({ id: roll, subject });
      }
    });

    const subjectCountMap = {};
    allStudents.forEach(s => {
      subjectCountMap[s.subject] = (subjectCountMap[s.subject] || 0) + 1;
    });

    subjects = Object.keys(subjectCountMap).map(sub => ({
      name: sub,
      count: subjectCountMap[sub],
    }));

    alert(`✅ Loaded ${allStudents.length} students from CSV.\nSubjects: ${subjects.map(s => `${s.name} (${s.count})`).join(", ")}`);
    generateSeatingPlan();
  };

  reader.readAsText(file);
}

// --- Ask for subjects manually ---
function askSubjects() {
  const subjectCount = parseInt(prompt("Enter number of elective subjects:"));
  if (isNaN(subjectCount) || subjectCount <= 0) {
    alert("Please enter a valid number!");
    return;
  }

  subjects = [];
  let totalEntered = 0;

  for (let i = 1; i <= subjectCount; i++) {
    const subName = prompt(`Enter name of subject ${i}:`);
    const subStudents = parseInt(prompt(`Enter number of students for ${subName}:`));
    if (subName && !isNaN(subStudents) && subStudents > 0) {
      subjects.push({ name: subName.trim(), count: subStudents });
      totalEntered += subStudents;
    }
  }

  if (totalEntered !== totalStudents) {
    alert(`⚠️ Total students entered (${totalEntered}) does not match required total (${totalStudents}). Adjust your numbers!`);
    return;
  }

  alert(`Subjects Added:\n${subjects.map(s => `${s.name} (${s.count})`).join(", ")}`);

  // Generate random realistic roll numbers
  allStudents = [];
  let subjectPool = [];
  subjects.forEach(sub => {
    for (let i = 0; i < sub.count; i++) subjectPool.push(sub.name);
  });
  subjectPool.sort(() => Math.random() - 0.5);
  for (let i = 1; i <= totalStudents; i++) {
    allStudents.push({ id: `S${String(i).padStart(3, "0")}`, subject: subjectPool[i - 1] });
  }

  generateSeatingPlan();
}

// --- Generate seating plan ---
function generateSeatingPlan() {
  if (allStudents.length === 0) {
    askSubjects();
    return;
  }

  halls = [];
  for (let i = 1; i <= 10; i++) {
    halls.push({
      id: i,
      capacity: parseInt(document.getElementById(`hall${i}`).value),
      students: []
    });
  }

  const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
  if (totalCapacity < allStudents.length) {
    alert("Total capacity is less than total students! Increase capacities.");
    return;
  }

  // --- Combine 2 subjects per hall and balance seat distribution ---
  const uniqueSubjects = [...new Set(allStudents.map(s => s.subject))];
  let subjectPairs = [];
  for (let i = 0; i < uniqueSubjects.length; i += 2) {
    subjectPairs.push([uniqueSubjects[i], uniqueSubjects[i + 1] || null]);
  }

  const subjectMap = {};
  uniqueSubjects.forEach(sub => {
    subjectMap[sub] = allStudents.filter(s => s.subject === sub);
  });

  let currentPair = 0;
  for (let hall of halls) {
    const [subA, subB] = subjectPairs[currentPair];
    const hallCap = hall.capacity;
    const half = Math.floor(hallCap / 2);

    const takeA = subjectMap[subA]?.splice(0, half) || [];
    const takeB = subB ? subjectMap[subB]?.splice(0, hallCap - takeA.length) || [] : [];

    hall.students = [...takeA, ...takeB];
    currentPair = (currentPair + 1) % subjectPairs.length;
  }

  displaySeatingPlan("Seating Plan Generated ✅");
}

// --- Display seating plan ---
function displaySeatingPlan(message) {
  const tableBody = document.getElementById("seatingTable");
  const output = document.getElementById("output");
  const summary = document.getElementById("summary");
  tableBody.innerHTML = "";

  halls.forEach(hall => {
    hall.students.forEach(stu => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stu.id}</td>
        <td>${stu.subject}</td>
        <td>Hall ${hall.id}</td>
      `;
      tableBody.appendChild(row);
    });
  });

  const unused = halls.reduce((sum, h) => sum + Math.max(0, h.capacity - h.students.length), 0);
  summary.innerText = `${message} | Total Students: ${allStudents.length} | Subjects: ${subjects.length} | Halls Used: ${halls.length} | Unused Seats: ${unused}`;
  output.classList.remove("hidden");
}

// --- Handle random hall unavailability ---
function markHallUnavailable() {
  if (halls.length === 0) {
    alert("Generate the seating plan first!");
    return;
  }

  const unavailableIndex = Math.floor(Math.random() * halls.length);
  const unavailableHall = halls[unavailableIndex];
  reallocateStudents(unavailableHall.id, `Randomly marked Hall ${unavailableHall.id} unavailable ⚠️`);
}

// --- Handle manual hall unavailability ---
function markSpecificHallUnavailable() {
  if (halls.length === 0) {
    alert("Generate the seating plan first!");
    return;
  }

  const hallNum = parseInt(prompt("Enter Hall number to mark unavailable (1–10):"));
  if (isNaN(hallNum) || hallNum < 1 || hallNum > halls.length) {
    alert("❌ Invalid hall number!");
    return;
  }

  const unavailableHall = halls.find(h => h.id === hallNum);
  if (!unavailableHall) {
    alert("❌ Hall not found!");
    return;
  }

  reallocateStudents(hallNum, `Hall ${hallNum} manually marked unavailable ⚠️`);
}

// --- Common function for reallocation ---
function reallocateStudents(hallId, message) {
  const unavailableIndex = halls.findIndex(h => h.id === hallId);
  const unavailableHall = halls[unavailableIndex];

  const remainingStudents = halls
    .filter((_, i) => i !== unavailableIndex)
    .reduce((all, h) => all.concat(h.students), [])
    .concat(unavailableHall.students);

  halls.splice(unavailableIndex, 1);

  halls.forEach(h => (h.students = []));
  let studentIndex = 0;
  for (let hall of halls) {
    for (let i = 0; i < hall.capacity && studentIndex < remainingStudents.length; i++) {
      hall.students.push(remainingStudents[studentIndex]);
      studentIndex++;
    }
  }

  displaySeatingPlan(`${message} → Students Reallocated (Greedy)`);
}
