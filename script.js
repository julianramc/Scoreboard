// Estado del juego
const gameState = {
  aka: {
    score: 0,
    penalties: { chukoku: 0, keikoku: 0, hansoku_chui: 0, hansoku: false },
  },
  ao: {
    score: 0,
    penalties: { chukoku: 0, keikoku: 0, hansoku_chui: 0, hansoku: false },
  },
  senshu: null, // 'aka', 'ao', o null
  timer: {
    duration: 180, // 3 minutos por defecto
    remaining: 180,
    running: false,
    interval: null,
  },
  winner: null,
  victoryReason: null,
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay()
  setupEventListeners()
  setupKeyboardControls()
})

// Event Listeners
function setupEventListeners() {
  document.getElementById("startPause").addEventListener("click", toggleTimer)
  document.getElementById("resetTimer").addEventListener("click", resetTimer)
}

// Controles de teclado
function setupKeyboardControls() {
  document.addEventListener("keydown", (event) => {
    if (gameState.winner) return // No permitir acciones si hay ganador

    const key = event.key.toLowerCase()

    // Prevenir comportamiento por defecto para nuestras teclas
    if (["q", "w", "e", "a", "s", "d", "z", "u", "i", "o", "j", "k", "l", "m", " ", "r"].includes(key)) {
      event.preventDefault()
    }

    switch (key) {
      // Competidor AKA
      case "q":
        addScore("aka", 1)
        break
      case "w":
        addScore("aka", 2)
        break
      case "e":
        addScore("aka", 3)
        break
      case "a":
        addPenalty("aka", "chukoku")
        break
      case "s":
        addPenalty("aka", "keikoku")
        break
      case "d":
        addPenalty("aka", "hansoku_chui")
        break
      case "z":
        resetCompetitor("aka")
        break

      // Competidor AO
      case "u":
        addScore("ao", 1)
        break
      case "i":
        addScore("ao", 2)
        break
      case "o":
        addScore("ao", 3)
        break
      case "j":
        addPenalty("ao", "chukoku")
        break
      case "k":
        addPenalty("ao", "keikoku")
        break
      case "l":
        addPenalty("ao", "hansoku_chui")
        break
      case "m":
        resetCompetitor("ao")
        break

      // Controles de tiempo
      case " ":
        toggleTimer()
        break
      case "r":
        resetTimer()
        break
    }
  })
}

// Funciones de puntuación
function addScore(competitor, points) {
  if (gameState.winner) return

  gameState[competitor].score += points

  // Verificar Senshu (primer punto)
  if (gameState.senshu === null && points > 0) {
    gameState.senshu = competitor
  }

  checkVictory()
  updateDisplay()
}

// Funciones de penalización
function addPenalty(competitor, penaltyType) {
  if (gameState.winner) return

  const penalties = gameState[competitor].penalties
  const opponent = competitor === "aka" ? "ao" : "aka"

  switch (penaltyType) {
    case "chukoku":
      penalties.chukoku++
      break
    case "keikoku":
      penalties.keikoku++
      // Keikoku otorga Yuko al oponente
      addScore(opponent, 1)
      break
    case "hansoku_chui":
      penalties.hansoku_chui++
      // Hansoku-chui otorga Waza-ari al oponente
      addScore(opponent, 2)
      break
    case "hansoku":
      penalties.hansoku = true
      checkVictory()
      break
  }

  updateDisplay()
}

// Verificar condiciones de victoria
function checkVictory() {
  // Victoria por Hansoku
  if (gameState.aka.penalties.hansoku) {
    gameState.winner = "AO"
    gameState.victoryReason = "Victoria por Hansoku del oponente"
    stopTimer()
    return
  }
  if (gameState.ao.penalties.hansoku) {
    gameState.winner = "AKA"
    gameState.victoryReason = "Victoria por Hansoku del oponente"
    stopTimer()
    return
  }

  // Victoria por diferencia de 8 puntos
  const scoreDiff = Math.abs(gameState.aka.score - gameState.ao.score)
  if (scoreDiff >= 8) {
    gameState.winner = gameState.aka.score > gameState.ao.score ? "AKA" : "AO"
    gameState.victoryReason = "Victoria por diferencia de 8 puntos"
    stopTimer()
    return
  }
}

// Funciones de timer
function toggleTimer() {
  if (gameState.timer.running) {
    stopTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  if (gameState.timer.remaining <= 0) return

  gameState.timer.running = true
  gameState.timer.interval = setInterval(() => {
    gameState.timer.remaining--

    if (gameState.timer.remaining <= 0) {
      gameState.timer.remaining = 0
      stopTimer()
      checkTimeUp()
    }

    updateTimerDisplay()
  }, 1000)

  updateTimerDisplay()
}

function stopTimer() {
  gameState.timer.running = false
  if (gameState.timer.interval) {
    clearInterval(gameState.timer.interval)
    gameState.timer.interval = null
  }
  updateTimerDisplay()
}

function resetTimer() {
  stopTimer()
  gameState.timer.remaining = gameState.timer.duration
  updateTimerDisplay()
}

function checkTimeUp() {
  if (gameState.winner) return

  // Determinar ganador por puntos o Senshu
  if (gameState.aka.score > gameState.ao.score) {
    gameState.winner = "AKA"
    gameState.victoryReason = "Victoria por puntos"
  } else if (gameState.ao.score > gameState.aka.score) {
    gameState.winner = "AO"
    gameState.victoryReason = "Victoria por puntos"
  } else if (gameState.senshu === "aka") {
    gameState.winner = "AKA"
    gameState.victoryReason = "Victoria por Senshu"
  } else if (gameState.senshu === "ao") {
    gameState.winner = "AO"
    gameState.victoryReason = "Victoria por Senshu"
  } else {
    gameState.winner = "EMPATE"
    gameState.victoryReason = "Combate empatado"
  }

  updateDisplay()
}

// Funciones de reset
function resetCompetitor(competitor) {
  gameState[competitor].score = 0
  gameState[competitor].penalties = { chukoku: 0, keikoku: 0, hansoku_chui: 0, hansoku: false }

  // Resetear Senshu si era de este competidor
  if (gameState.senshu === competitor) {
    gameState.senshu = null
  }

  gameState.winner = null
  gameState.victoryReason = null

  updateDisplay()
}

function resetAll() {
  gameState.aka = {
    score: 0,
    penalties: { chukoku: 0, keikoku: 0, hansoku_chui: 0, hansoku: false },
  }
  gameState.ao = {
    score: 0,
    penalties: { chukoku: 0, keikoku: 0, hansoku_chui: 0, hansoku: false },
  }
  gameState.senshu = null
  gameState.winner = null
  gameState.victoryReason = null

  resetTimer()
  updateDisplay()
}

// Funciones de configuración
function toggleConfig() {
  const panel = document.getElementById("configPanel")
  panel.classList.toggle("hidden")
}

function updateNames() {
  const akaName = document.getElementById("akaNameInput").value || "AKA"
  const aoName = document.getElementById("aoNameInput").value || "AO"

  document.getElementById("akaName").textContent = akaName
  document.getElementById("aoName").textContent = aoName
}

function updateDuration() {
  const duration = Number.parseInt(document.getElementById("durationSelect").value)
  gameState.timer.duration = duration
  gameState.timer.remaining = duration
  updateTimerDisplay()
}

// Funciones de actualización de display
function updateDisplay() {
  updateScores()
  updatePenalties()
  updateSenshu()
  updateVictoryBanner()
  updateButtons()
}

function updateScores() {
  document.getElementById("akaScore").textContent = gameState.aka.score
  document.getElementById("aoScore").textContent = gameState.ao.score
}

function updatePenalties() {
  updateCompetitorPenalties("aka")
  updateCompetitorPenalties("ao")
}

function updateCompetitorPenalties(competitor) {
  const penalties = gameState[competitor].penalties
  const display = document.getElementById(competitor + "Penalties")

  let html = ""
  if (penalties.chukoku > 0) html += `Chukoku: ${penalties.chukoku}<br>`
  if (penalties.keikoku > 0) html += `Keikoku: ${penalties.keikoku}<br>`
  if (penalties.hansoku_chui > 0) html += `Hansoku-chui: ${penalties.hansoku_chui}<br>`
  if (penalties.hansoku) html += "<strong>HANSOKU</strong><br>"

  display.innerHTML = html
}

function updateSenshu() {
  document.getElementById("akaSenshu").classList.toggle("hidden", gameState.senshu !== "aka")
  document.getElementById("aoSenshu").classList.toggle("hidden", gameState.senshu !== "ao")
}

function updateVictoryBanner() {
  const banner = document.getElementById("victoryBanner")

  if (gameState.winner) {
    let text = ""
    if (gameState.winner === "EMPATE") {
      text = `🤝 EMPATE<br><small>${gameState.victoryReason}</small>`
    } else {
      const winnerName =
        gameState.winner === "AKA"
          ? document.getElementById("akaName").textContent
          : document.getElementById("aoName").textContent
      text = `🏆 VICTORIA: ${winnerName} (${gameState.winner})<br><small>${gameState.victoryReason}</small>`
    }
    banner.innerHTML = text
    banner.classList.remove("hidden")
  } else {
    banner.classList.add("hidden")
  }
}

function updateButtons() {
  const disabled = !!gameState.winner
  const buttons = document.querySelectorAll(".score-btn, .penalty-btn")
  buttons.forEach((btn) => (btn.disabled = disabled))
}

function updateTimerDisplay() {
  const minutes = Math.floor(gameState.timer.remaining / 60)
  const seconds = gameState.timer.remaining % 60
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  document.getElementById("timer").textContent = timeString

  const startPauseBtn = document.getElementById("startPause")
  startPauseBtn.textContent = gameState.timer.running ? "⏸️ PAUSE" : "▶️ START"
}

// Formatear tiempo
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
