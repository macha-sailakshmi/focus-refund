// 1. TASKS WITH REPEATABLE LOGIC
const tasksByAge = {
  "13-17": [
    { name: "Complete homework +15", repeatable: false }, // Once per day
    { name: "Read 30min +5", repeatable: true }, // Unlimited
    { name: "Exercise 30min +10", repeatable: false },
    { name: "Meditate 10min +5", repeatable: true },
    { name: "Clean room +10", repeatable: false } // Total: 45+ coins
  ],
  "18-22": [
    { name: "Study 2hrs +15", repeatable: false },
    { name: "LeetCode 1 problem +10", repeatable: true }, // Grind
    { name: "Gym session +10", repeatable: false },
    { name: "No reels 3hrs +15", repeatable: false }, // Total: 50+ coins
    { name: "Journal +5", repeatable: true }
  ],
  "23-27": [
    { name: "Apply 3 jobs +20", repeatable: false },
    { name: "LC 1hr +15", repeatable: true },
    { name: "Deep work 90min +20", repeatable: false }, // Total: 55+ coins
    { name: "Network 15min +5", repeatable: true }
  ],
  "28-35": [
    { name: "Client work 2hrs +15", repeatable: false },
    { name: "Exercise 45min +10", repeatable: false },
    { name: "Skill course 1hr +15", repeatable: false }, // Total: 40+ coins
    { name: "Read 20min +10", repeatable: true }
  ],
  "35+": [
    { name: "Walk 5k steps +10", repeatable: false },
    { name: "Read industry news +5", repeatable: true },
    { name: "Family time 1hr +15", repeatable: false }, // Total: 40+ coins
    { name: "Meditate +10", repeatable: false },
    { name: "Stretch 10min +10", repeatable: true }
  ]
};

// 2. LOAD SAVED DATA
let coins = parseInt(localStorage.getItem("focusCoins")) || 0;
let ageGroup = localStorage.getItem("userAge") || "18-22";
const today = new Date().toDateString(); // For daily reset
const ageLocked = localStorage.getItem("ageLocked") === "true";

// 3. DOM ELEMENTS
const ageSelect = document.getElementById("ageSelect");
const userAgeDisplay = document.getElementById("userAgeDisplay");
const taskList = document.getElementById("taskList");
const coinCount = document.getElementById("coinCount");
const unlockBtn = document.getElementById("unlockBtn");

// 4. INITIAL SETUP + AGE LOCK
ageSelect.value = ageGroup;
userAgeDisplay.textContent = ageGroup;
coinCount.textContent = coins;

// Lock age if already set
if (ageLocked) {
  ageSelect.disabled = true;
  ageSelect.style.opacity = "0.5";
  ageSelect.title = "Age locked. Clear browser data to reset.";
}

checkUnlockButton();
renderTasks();

// 5. RENDER TASKS WITH REPEATABLE LOGIC
function renderTasks() {
  taskList.innerHTML = "";
  
  tasksByAge[ageGroup].forEach((task) => {
    const taskRow = document.createElement("div");
    taskRow.classList.add("task-row");
    
    const taskLabel = document.createElement("span");
    const addBtn = document.createElement("button");
    addBtn.classList.add("add-btn");
    
    // Check if one-time task was done today
    const taskKey = `done_${ageGroup}_${task.name}_${today}`;
    const isDoneToday = localStorage.getItem(taskKey) === "true";
    
    // Get repeat count for repeatable tasks
    const repeatKey = `count_${ageGroup}_${task.name}_${today}`;
    let repeatCount = parseInt(localStorage.getItem(repeatKey)) || 0;
    
    // Set initial label
    if (!task.repeatable && isDoneToday) {
      taskLabel.textContent = `${task.name} ✓ Done Today`;
      addBtn.textContent = "Done";
      addBtn.disabled = true;
    } else if (task.repeatable && repeatCount > 0) {
      taskLabel.textContent = `${task.name} x${repeatCount}`;
      addBtn.textContent = "+ Done";
    } else {
      taskLabel.textContent = task.name;
      addBtn.textContent = "+ Done";
    }
    
    // CLICK LOGIC
    addBtn.addEventListener("click", () => {
      const coinValue = parseInt(task.name.split("+")[1]);
      coins += coinValue;
      
      localStorage.setItem("focusCoins", coins);
      coinCount.textContent = coins;
      
      if (!task.repeatable) {
        // One-time task: lock for today
        localStorage.setItem(taskKey, "true");
        taskLabel.textContent = `${task.name} ✓ Done Today`;
        addBtn.textContent = "Done";
        addBtn.disabled = true;
      } else {
        // Repeatable task: increment counter
        repeatCount++;
        localStorage.setItem(repeatKey, repeatCount);
        taskLabel.textContent = `${task.name} x${repeatCount}`;
      }
      
      checkUnlockButton();
    });
    
    taskRow.appendChild(taskLabel);
    taskRow.appendChild(addBtn);
    taskList.appendChild(taskRow);
  });
}

function checkUnlockButton() {
  if (coins >= 50) {
    unlockBtn.disabled = false;
    unlockBtn.style.opacity = "1";
  } else {
    unlockBtn.disabled = true;
    unlockBtn.style.opacity = "0.5";
  }
}

// 6. AGE CHANGE WITH LOCK CONFIRMATION
ageSelect.addEventListener("change", () => {
  if (ageLocked) return;
  
  if (confirm("Lock age group permanently? You won't be able to change this without resetting data. This prevents coin farming.")) {
    ageGroup = ageSelect.value;
    localStorage.setItem("userAge", ageGroup);
    localStorage.setItem("ageLocked", "true");
    userAgeDisplay.textContent = ageGroup;
    ageSelect.disabled = true;
    ageSelect.style.opacity = "0.5";
    renderTasks();
  } else {
    // Revert dropdown if user cancels
    ageSelect.value = ageGroup;
  }
});

// 7. UNLOCK BUTTON
unlockBtn.addEventListener("click", () => {
  if (coins >= 50) {
    coins -= 50;
    localStorage.setItem("focusCoins", coins);
    coinCount.textContent = coins;
    checkUnlockButton();
    alert("Unlocked 10 minutes of Instagram! The Muscle will now allow access.");
  }
});