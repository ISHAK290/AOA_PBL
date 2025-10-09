// Exam Seating Arrangement Optimizer
// Simple version without advanced programming

// Step 1: Input data
let students = 600;
let halls = [
  { name: "Hall A", capacity: 80, available: true },
  { name: "Hall B", capacity: 50, available: true },
  { name: "Hall C", capacity: 70, available: true },
  { name: "Hall D", capacity: 60, available: true },
  { name: "Hall E", capacity: 40, available: true },
  { name: "Hall F", capacity: 90, available: true },
  { name: "Hall G", capacity: 50, available: true },
  { name: "Hall H", capacity: 70, available: true },
  { name: "Hall I", capacity: 45, available: true },
  { name: "Hall J", capacity: 45, available: true }
];

// Step 2: Function to create initial seating plan (Batchwise allocation)
function createSeatingPlan() {
  let rollNo = 1;
  let plan = [];

  for (let i = 0; i < halls.length; i++) {
    if (!halls[i].available) continue; // Skip unavailable halls

    let count = 0;
    let hallList = [];

    while (count < halls[i].capacity && rollNo <= students) {
      hallList.push("Student " + rollNo);
      rollNo++;
      count++;
    }

    plan.push({
      hall: halls[i].name,
      students: hallList
    });
  }

  return plan;
}

// Step 3: Function to handle reallocation if a hall fails
function reallocate(plan, failedHall) {
  console.log("\n⚠️ Hall " + failedHall + " is now unavailable! Reallocating...\n");
  
  // Mark hall as unavailable
  for (let i = 0; i < halls.length; i++) {
    if (halls[i].name === failedHall) {
      halls[i].available = false;
      break;
    }
  }

  // Find all students from failed hall
  let reassign = [];
  for (let i = 0; i < plan.length; i++) {
    if (plan[i].hall === failedHall) {
      reassign = plan[i].students;
      plan.splice(i, 1);
      break;
    }
  }

  // Reassign them to remaining available halls
  for (let i = 0; i < plan.length; i++) {
    for (let j = 0; j < reassign.length; j++) {
      if (plan[i].students.length < getCapacity(plan[i].hall)) {
        plan[i].students.push(reassign[j]);
        reassign.splice(j, 1);
        j--;
      }
      if (reassign.length === 0) break;
    }
  }

  if (reassign.length > 0) {
    console.log("⚠️ Not enough seats! " + reassign.length + " students unassigned.");
  }

  return plan;
}

// Step 4: Helper function to get hall capacity
function getCapacity(hallName) {
  for (let i = 0; i < halls.length; i++) {
    if (halls[i].name === hallName) {
      return halls[i].capacity;
    }
  }
  return 0;
}

// Step 5: Display function
function displayPlan(plan) {
  for (let i = 0; i < plan.length; i++) {
    console.log(plan[i].hall + ": " + plan[i].students.length + " students");
  }
}

// Run the program
console.log("🏫 Initial Seating Plan:\n");
let plan = createSeatingPlan();
displayPlan(plan);

// Simulate a hall failure
plan = reallocate(plan, "Hall F");

console.log("\n✅ Updated Seating Plan:\n");
displayPlan(plan);
