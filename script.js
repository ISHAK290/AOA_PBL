// Algorithm: Greedy Allocation
// It sequentially assigns students to halls until all are allocated or hall capacities are filled.

const totalStudents = 600;
let halls = [];

// Generate hall input cards dynamically
for (let i = 1; i <= 10; i++) {
  const div = document.createElement("div");
  div.className = "hall-card";
  div.innerHTML = `
    <h3>🏫 Hall ${i}</h3>
    <label>Capacity</label>
    <input type="number" id="hall${i}" value="${50 + i * 5}">
  `;
  document.getElementById("hallInputs").appendChild(div);
}

// --- Main Allocation Function (Greedy Approach) ---
function generateSeatingPlan() {
  halls = [];
  // Step 1: Collect hall capacities
  for (let i = 1; i <= 10; i++) {
    halls.push({
      id: i,
      capacity: parseInt(document.getElementById(`hall${i}`).value),
      students: []
    });
  }

  // Step 2: Validate total capacity
  const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
  if (totalCapacity < totalStudents) {
    alert("Total capacity is less than 600 students! Increase capacities.");
    return;
  }

  // Step 3: Greedy Allocation
  let studentId = 1;
  for (let hall of halls) {
    // Fill each hall until capacity or students run out
    for (let i = 0; i < hall.capacity && studentId <= totalStudents; i++) {
      hall.students.push(`S${String(studentId).padStart(3, "0")}`);
      studentId++;
    }
  }

  // Step 4: Display Result
  displaySeatingPlan("Seating Plan Generated ✅ (Greedy Allocation)");
}

// --- Display Seating Plan ---
function displaySeatingPlan(message) {
  const tableBody = document.getElementById("seatingTable");
  const output = document.getElementById("output");
  const summary = document.getElementById("summary");
  tableBody.innerHTML = "";

  // Fill table rows
  halls.forEach(hall => {
    hall.students.forEach(stu => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stu}</td>
        <td>Hall ${hall.id}</td>
      `;
      tableBody.appendChild(row);
    });
  });

  // Summary info
  const unused = halls.reduce((sum, h) => sum + Math.max(0, h.capacity - h.students.length), 0);
  summary.innerText = `${message} | Total Students: ${totalStudents} | Halls: ${halls.length} | Unused Seats: ${unused}`;
  output.classList.remove("hidden");
}

// --- Handle Hall Unavailability ---
function markHallUnavailable() {
  if (halls.length === 0) {
    alert("Generate the seating plan first!");
    return;
  }

  // Randomly make one hall unavailable
  const unavailableIndex = Math.floor(Math.random() * halls.length);
  const unavailableHall = halls[unavailableIndex];
  alert(`Hall ${unavailableHall.id} is now unavailable! Reallocating students...`);

  // Combine students from unavailable hall with others
  const remainingStudents = halls
    .filter((_, i) => i !== unavailableIndex)
    .reduce((all, h) => all.concat(h.students), [])
    .concat(unavailableHall.students);

  halls.splice(unavailableIndex, 1);

  // Reallocate greedily to remaining halls
  halls.forEach(h => (h.students = []));
  let studentIndex = 0;
  for (let hall of halls) {
    for (let i = 0; i < hall.capacity && studentIndex < remainingStudents.length; i++) {
      hall.students.push(remainingStudents[studentIndex]);
      studentIndex++;
    }
  }

  displaySeatingPlan(`Reallocated after Hall ${unavailableHall.id} Unavailability ⚠️ (Greedy)`);
}
