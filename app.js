const tasks = {
  "18-22": ["Study 2hrs +10", "No reels 3hrs +15"],
  "23-27": ["Apply 3 jobs +20", "LC 1hr +15"], // fixed!5
  "28-35": ["Deep work 90min +20", "Workout 30min +10"], // fixed!0
  "35+": ["Walk 5k +15", "No phone after 9pm +25"] // fixed text
};

let coins = 0;
let ageGroup = "18-22";

const taskList = document.getElementById("taskList");
const coinCount = document.getElementById("coinCount");
const unlockBtn = document.getElementById("unlockBtn");
document.getElementById("userAge").innerText = ageGroup;

coinCount.innerText = coins;

// Build repeatable task rows
tasks[ageGroup].forEach(taskText => {
  const taskRow = document.createElement("div");
  taskRow.classList.add("task-row"); // uses your CSS
  
  const taskLabel = document.createElement("span");
  taskLabel.innerText = taskText;
  
  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Done";
  addBtn.classList.add("add-btn"); // uses your CSS
  
  let completedCount = 0;
  
  addBtn.addEventListener("click", () => {
    const coinValue = parseInt(taskText.split("+")[1]);
    coins += coinValue;
    completedCount++;
    
    coinCount.innerText = coins;
    taskLabel.innerText = `${taskText} x${completedCount}`;
    
    if (coins >= 50) {
      unlockBtn.disabled = false;
    }
  });
  
  taskRow.appendChild(taskLabel);
  taskRow.appendChild(addBtn);
  taskList.appendChild(taskRow);
});