// 1. TASKS
const tasksByAge = {
  "13-17": [
    { name: "Complete homework +15", repeatable: false, type: "button" },
    { name: "Read 30min +5", repeatable: true, type: "timer", targetSeconds: 30 * 60 },
    { name: "Exercise 30min +10", repeatable: false, type: "timer", targetSeconds: 30 * 60 },
    { name: "Meditate 10min +5", repeatable: true, type: "timer", targetSeconds: 10 * 60 },
    { name: "Clean room +10", repeatable: false, type: "button" }
  ],
  "18-22": [
    { name: "Study 2hrs +15", repeatable: false, type: "timer", targetSeconds: 120 * 60 },
    { name: "LeetCode 1 problem +10", repeatable: true, type: "timer", targetSeconds: 30 * 60 },
    { name: "Gym session +10", repeatable: false, type: "button" },
    { name: "No reels 3hrs +15", repeatable: false, type: "button" },
    { name: "Journal +5", repeatable: true, type: "button" }
  ],
  "23-27": [
    { name: "Apply 3 jobs +20", repeatable: false, type: "button" },
    { name: "LC 1hr +15", repeatable: true, type: "timer", targetSeconds: 60 * 60 },
    { name: "Deep work 90min +20", repeatable: false, type: "timer", targetSeconds: 90 * 60 },
    { name: "Network 15min +5", repeatable: true, type: "timer", targetSeconds: 15 * 60 }
  ],
  "28-35": [
    { name: "Client work 2hrs +15", repeatable: false, type: "timer", targetSeconds: 120 * 60 },
    { name: "Exercise 45min +10", repeatable: false, type: "timer", targetSeconds: 45 * 60 },
    { name: "Skill course 1hr +15", repeatable: false, type: "timer", targetSeconds: 60 * 60 },
    { name: "Read 20min +10", repeatable: true, type: "timer", targetSeconds: 20 * 60 }
  ],
  "35+": [
    { name: "Walk 5k steps +10", repeatable: false, type: "button" },
    { name: "Read industry news +5", repeatable: true, type: "timer", targetSeconds: 15 * 60 },
    { name: "Family time 1hr +15", repeatable: false, type: "button" },
    { name: "Meditate +10", repeatable: false, type: "timer", targetSeconds: 10 * 60 },
    { name: "Stretch 10min +10", repeatable: true, type: "timer", targetSeconds: 10 * 60 }
  ]
};

// 2. STORAGE HELPER
const storage = window.chrome?.storage?.sync || {
  get: (keys, cb) => {
    const result = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val === "true") result[k] = true;
      else if (val === "false") result[k] = false;
      else if (val === null) result[k] = null;
      else if (!isNaN(val) && val!== "") result[k] = Number(val);
      else result[k] = val;
    });
    cb(result);
  },
  set: (obj, cb) => {
    Object.entries(obj).forEach(([k,v]) => localStorage.setItem(k, v));
    if(cb) cb();
  }
};

// 3. GLOBAL VARS
let coins = 0;
let ageGroup = "18-22";
let ageLockedToday = false;
const today = new Date().toDateString();
let activeTimer = null; // {timerId, interval, sessionStart, secondsDone, targetSeconds}

// 4. DOM ELEMENTS
const ageSelect = document.getElementById("ageSelect");
const userAgeDisplay = document.getElementById("userAgeDisplay");
const taskList = document.getElementById("taskList");
const coinCount = document.getElementById("coinCount");
const unlockBtn = document.getElementById("unlockBtn");
const ageLockStatus = document.getElementById("ageLockStatus");

// 5. INIT
storage.get(["focusCoins", "userAge", "ageLockDate"], (result) => {
  coins = Number(result.focusCoins) || 0;
  ageGroup = result.userAge || "18-22";
  ageLockedToday = result.ageLockDate === today;

  ageSelect.value = ageGroup;
  userAgeDisplay.textContent = ageGroup;
  coinCount.textContent = coins;
  updateAgeControlState();

  checkUnlockButton();
  renderTasks();
});

// 6. RENDER TASKS - SECONDS PRECISION LIKE YTP
function renderTasks() {
  taskList.innerHTML = "";

  tasksByAge[ageGroup].forEach((task, idx) => {
    const taskKey = `done_${ageGroup}_${task.name}_${today}`;
    const timeKey = `time_${ageGroup}_${task.name}_${today}`; // NOW STORES SECONDS
    const repeatKey = `count_${ageGroup}_${task.name}_${today}`;

    storage.get([taskKey, timeKey, repeatKey], (result) => {
      const taskRow = document.createElement("div");
      taskRow.className = "task-card";

      const taskLabel = document.createElement("div");
      taskLabel.className = "task-title";

      const isDoneToday = result[taskKey] === true;
      let secondsDone = Number(result[timeKey]) || 0;
      let repeatCount = Number(result[repeatKey]) || 0;

      if (task.type === "timer") {
        const timerId = `timer_${idx}`;
        const coinValue = Number(task.name.split("+")[1]);
        const targetSecs = task.targetSeconds;
        
        taskLabel.textContent = task.repeatable && repeatCount > 0 
    ? `${task.name} x${repeatCount}` 
          : task.name;

        // Large countdown display
        const countdownDisplay = document.createElement("div");
        countdownDisplay.id = `${timerId}_countdown`;
        countdownDisplay.className = "timer-display";
        countdownDisplay.textContent = formatTime(targetSecs - secondsDone);

        // Progress text with seconds
        const progressDisplay = document.createElement("div");
        progressDisplay.className = "timer-progress-text";
        progressDisplay.textContent = `${formatTimeShort(secondsDone)} / ${formatTimeShort(targetSecs)}`;

        // Progress bar
        const progressBar = document.createElement("div");
        progressBar.className = "progress-track";
        const progressFill = document.createElement("div");
        progressFill.className = "progress-fill";
        progressFill.style.width = `${(secondsDone / targetSecs) * 100}%`;
        progressBar.appendChild(progressFill);

        const btnContainer = document.createElement("div");
        btnContainer.className = "task-actions";

        const startBtn = document.createElement("button");
        startBtn.textContent = secondsDone > 0 && secondsDone < targetSecs? "Continue" : "Start";
        startBtn.className = "action-btn primary";

        const pauseBtn = document.createElement("button");
        pauseBtn.textContent = "Pause";
        pauseBtn.className = "action-btn pause";
        pauseBtn.style.display = "none";

        const claimBtn = document.createElement("button");
        claimBtn.textContent = `Claim +${coinValue} coins`;
        claimBtn.className = "action-btn claim";
        claimBtn.style.display = "none";

        const statusText = document.createElement("div");
        statusText.className = "task-status";
        
        // Set initial state
        if (!task.repeatable && isDoneToday) {
          statusText.textContent = "✓ Completed today";
          statusText.style.color = "#22c55e";
          startBtn.disabled = true;
          startBtn.textContent = "Done Today";
          startBtn.style.opacity = "0.5";
        } else if (secondsDone >= targetSecs) {
          statusText.textContent = "✓ Target reached! Claim your coins";
          statusText.style.color = "#22c55e";
          startBtn.style.display = "none";
          claimBtn.style.display = "inline-block";
        } else if (secondsDone > 0) {
          statusText.textContent = `${formatTimeShort(targetSecs - secondsDone)} remaining`;
        } else {
          statusText.textContent = "Ready to start";
        }

        // Disable if another timer running
        if (activeTimer && activeTimer.timerId!== timerId) {
          startBtn.disabled = true;
          startBtn.style.opacity = "0.5";
          startBtn.title = "Pause other timer first";
        }

        startBtn.onclick = () => {
          if (activeTimer) {
            alert("Only 1 timer can run at a time. Pause the other one first.");
            return;
          }
          
          let remainingSeconds = targetSecs - secondsDone;
          activeTimer = {
            timerId,
            sessionStart: Date.now(),
            secondsDone,
            targetSeconds: targetSecs,
            timeKey,
            interval: null
          };
          
          startBtn.style.display = "none";
          pauseBtn.style.display = "inline-block";
          statusText.textContent = "Timer running...";
          statusText.style.color = "#f59e0b";

          // Disable all other start buttons
          document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Start') || btn.textContent.includes('Continue')) {
              btn.disabled = true;
              btn.style.opacity = "0.5";
            }
          });
          pauseBtn.disabled = false;
          pauseBtn.style.opacity = "1";

          activeTimer.interval = setInterval(() => {
            remainingSeconds--;
            countdownDisplay.textContent = formatTime(remainingSeconds);
            
            const totalSecs = activeTimer.secondsDone + Math.floor((Date.now() - activeTimer.sessionStart) / 1000);
            progressDisplay.textContent = `${formatTimeShort(totalSecs)} / ${formatTimeShort(targetSecs)}`;
            progressFill.style.width = `${Math.min((totalSecs / targetSecs) * 100, 100)}%`;

            if (remainingSeconds <= 0) {
              clearInterval(activeTimer.interval);
              const updates = { [timeKey]: targetSecs };
              
              storage.set(updates, () => {
                activeTimer = null;
                pauseBtn.style.display = "none";
                claimBtn.style.display = "inline-block";
                statusText.textContent = "✓ Target reached! Claim your coins";
                statusText.style.color = "#22c55e";
                countdownDisplay.textContent = "00:00";
                progressDisplay.textContent = `${formatTimeShort(targetSecs)} / ${formatTimeShort(targetSecs)}`;
                progressFill.style.width = "100%";
                renderTasks(); // Re-enable buttons
              });
            }
          }, 1000);
        };

        pauseBtn.onclick = () => {
          if (!activeTimer) return;
          
          clearInterval(activeTimer.interval);
          const elapsedSeconds = Math.floor((Date.now() - activeTimer.sessionStart) / 1000);
          const newSecondsDone = activeTimer.secondsDone + elapsedSeconds;
          
          storage.set({ [timeKey]: newSecondsDone }, () => {
            activeTimer = null;
            startBtn.style.display = "inline-block";
            pauseBtn.style.display = "none";
            startBtn.textContent = "Continue";
            statusText.textContent = `Paused. ${formatTimeShort(targetSecs - newSecondsDone)} remaining`;
            statusText.style.color = "#94a3b8";
            countdownDisplay.textContent = formatTime(targetSecs - newSecondsDone);
            progressDisplay.textContent = `${formatTimeShort(newSecondsDone)} / ${formatTimeShort(targetSecs)}`;
            renderTasks(); // Re-render to update state
          });
        };

        claimBtn.onclick = () => {
          coins += coinValue;
          const updates = { focusCoins: coins };
          
          if (!task.repeatable) {
            updates[taskKey] = true;
            claimBtn.disabled = true;
            claimBtn.textContent = "Claimed";
          } else {
            repeatCount++;
            updates[repeatKey] = repeatCount;
            updates[timeKey] = 0;
            taskLabel.textContent = `${task.name} x${repeatCount}`;
            secondsDone = 0;
          }

          storage.set(updates, () => {
            coinCount.textContent = coins;
            checkUnlockButton();
            statusText.textContent = `✓ +${coinValue} coins earned!`;
            claimBtn.style.display = "none";
            startBtn.style.display = "inline-block";
            startBtn.disabled =!task.repeatable;
            startBtn.textContent = task.repeatable? "Start New Session" : "Done Today";
            startBtn.style.opacity = task.repeatable? "1" : "0.5";
            if (task.repeatable) {
              countdownDisplay.textContent = formatTime(targetSecs);
              progressDisplay.textContent = `0m 0s / ${formatTimeShort(targetSecs)}`;
              progressFill.style.width = "0%";
            }
          });
        };

        btnContainer.appendChild(startBtn);
        btnContainer.appendChild(pauseBtn);
        btnContainer.appendChild(claimBtn);
        taskRow.appendChild(taskLabel);
        taskRow.appendChild(countdownDisplay);
        taskRow.appendChild(progressDisplay);
        taskRow.appendChild(progressBar);
        taskRow.appendChild(btnContainer);
        taskRow.appendChild(statusText);

      } else {
        const addBtn = document.createElement("button");
        addBtn.className = "action-btn done";
        taskRow.classList.add("simple");

        if (!task.repeatable && isDoneToday) {
          taskLabel.textContent = `${task.name} ✓ Done Today`;
          addBtn.textContent = "Done";
          addBtn.disabled = true;
          addBtn.style.opacity = "0.5";
        } else if (task.repeatable && repeatCount > 0) {
          taskLabel.textContent = `${task.name} x${repeatCount}`;
          addBtn.textContent = "+ Done";
        } else {
          taskLabel.textContent = task.name;
          addBtn.textContent = "+ Done";
        }

        addBtn.onclick = () => {
          const coinValue = Number(task.name.split("+")[1]);
          coins += coinValue;
          const updates = { focusCoins: coins };

          if (!task.repeatable) {
            updates[taskKey] = true;
            taskLabel.textContent = `${task.name} ✓ Done Today`;
            addBtn.textContent = "Done";
            addBtn.disabled = true;
            addBtn.style.opacity = "0.5";
          } else {
            repeatCount++;
            updates[repeatKey] = repeatCount;
            taskLabel.textContent = `${task.name} x${repeatCount}`;
          }

          storage.set(updates, () => {
            coinCount.textContent = coins;
            checkUnlockButton();
          });
        };

        taskRow.appendChild(taskLabel);
        taskRow.appendChild(addBtn);
      }

      taskList.appendChild(taskRow);
    });
  });
}

// Helper: format seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

// Helper: format seconds to Xm Ys
function formatTimeShort(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
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

function updateAgeControlState() {
  ageSelect.disabled = ageLockedToday;
  ageSelect.style.opacity = ageLockedToday ? "0.65" : "1";
  ageLockStatus.textContent = ageLockedToday
    ? "Locked for today to keep tasks fair."
    : "Choose once for today's task list.";
}

ageSelect.addEventListener("change", () => {
  if (ageLockedToday) return;
  if (activeTimer) {
    alert("Pause your active timer before changing age group");
    ageSelect.value = ageGroup;
    return;
  }

  ageGroup = ageSelect.value;
  storage.set({ userAge: ageGroup, ageLockDate: today, ageLocked: false }, () => {
    ageLockedToday = true;
    userAgeDisplay.textContent = ageGroup;
    updateAgeControlState();
    renderTasks();
  });
});

unlockBtn.addEventListener("click", () => {
  if (coins >= 50) {
    coins -= 50;
    const unlockUntil = Date.now() + 10 * 60 * 1000;
    storage.set({ focusCoins: coins, igUnlockUntil: unlockUntil }, () => {
      coinCount.textContent = coins;
      checkUnlockButton();
      alert("Unlocked 10 minutes of Instagram!");
    });
  }
});

window.addEventListener('beforeunload', (e) => {
  if (activeTimer) {
    e.preventDefault();
    e.returnValue = 'Timer is running. Pause first to save your progress!';
  }
});
