const els = {
  gate: document.getElementById("gate"),
  inbox: document.getElementById("inbox"),
  form: document.getElementById("gateForm"),
  input: document.getElementById("codeInput"),
  enter: document.getElementById("codeEnter"),
  box: document.querySelector(".code-box"),
  state: document.getElementById("gateState"),
  line: document.getElementById("systemLine"),
  faults: document.getElementById("faultLayer"),
  mailOpen: document.getElementById("mailOpen"),
  mailClose: document.getElementById("mailClose"),
  modal: document.getElementById("mailModal"),
  mailCount: document.getElementById("mailCount"),
  topCount: document.getElementById("topCount"),
  jazz: document.getElementById("jazzAudio"),
  audioState: document.getElementById("audioState")
}

const tokens = [
  "■□■",
  "■■■□",
  "■■■",
  "■■■■",
  "ACCESS",
  "WAIT",
  "PILOT",
  "ERR",
  "87%",
  "RED ROUTE",
  "NO INPUT",
  "TOO EARLY"
]

const alerts = [
  "ACCESS DENIED",
  "INPUT OVERRIDDEN",
  "PASSWORD FIELD CORRUPTED",
  "UNAUTHORIZED TOUCH",
  "WAIT SIGNAL ARMED",
  "REQUEST TOO EARLY",
  "MANUAL ENTRY REJECTED",
  "PILOT ROUTE OPENING",
  "KEYSTROKE LOGGED",
  "DO NOT TOUCH"
]

const passwordFrames = [
  "■",
  "■□",
  "■□■",
  "■□■ ■",
  "■□■ ■■■□",
  "■□■ ■■■□ ■■■",
  "■□■ ■■■□ ■■■ ■■■■",
  "■□■ ■■■□ ■■■ ■■■■ ■■■□□■",
  "■□■ ■■■□ ■■■ ■■■■ ■■■□□■ □□■"
]

const systemFrames = [
  "status :: verifying access code",
  "status :: password channel unstable",
  "status :: manual input rejected",
  "status :: error signal duplicated",
  "status :: incoming mail route armed",
  "status :: opening forced message"
]

const sfxPool = Array.from({ length: 12 }, () => {
  const audio = new Audio("Error_s.mp3")
  audio.preload = "auto"
  audio.volume = 0.55
  return audio
})

let started = false
let opened = false
let sfxIndex = 0

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function playSfx(volume = 0.62, rate = 1) {
  const audio = sfxPool[sfxIndex % sfxPool.length]
  sfxIndex += 1
  audio.pause()
  audio.currentTime = 0
  audio.volume = volume
  audio.playbackRate = rate
  audio.play().catch(() => {})
}

function playSfxBurst() {
  const taps = [0, 48, 86, 126, 162, 205, 244, 292, 346, 402, 466, 542, 622, 706]
  taps.forEach((delay, i) => {
    setTimeout(() => {
      playSfx(rand(0.35, i % 3 === 0 ? 0.78 : 0.58), rand(0.86, 1.18))
    }, delay)
  })
}

function place(node, edge = 6) {
  node.style.setProperty("--x", `${rand(-edge, 100 - edge)}vw`)
  node.style.setProperty("--y", `${rand(2, 94)}vh`)
}

function token() {
  const node = document.createElement("span")
  node.className = "fault-token"
  node.textContent = pick(tokens)
  node.style.setProperty("--s", `${rand(13, 28)}px`)
  node.style.setProperty("--d", `${rand(0.42, 0.96)}s`)
  node.style.setProperty("--c", Math.random() > 0.22 ? "rgba(255, 42, 56, 0.92)" : "rgba(34, 244, 255, 0.76)")
  place(node, 4)
  els.faults.appendChild(node)
  setTimeout(() => node.remove(), 1100)
}

function alertBox() {
  const node = document.createElement("strong")
  node.className = "fault-alert"
  node.textContent = pick(alerts)
  node.style.setProperty("--s", `${rand(10, 13)}px`)
  node.style.setProperty("--d", `${rand(0.62, 1.12)}s`)
  node.style.setProperty("--c", Math.random() > 0.18 ? "rgba(255, 218, 225, 0.96)" : "rgba(34, 244, 255, 0.9)")
  place(node, 12)
  els.faults.appendChild(node)
  setTimeout(() => node.remove(), 1300)
}

function fillPassword() {
  els.input.type = "text"
  let i = 0
  const timer = setInterval(() => {
    els.input.value = passwordFrames[i]
    i += 1
    if (i >= passwordFrames.length) clearInterval(timer)
  }, 132)
}

function runSystemLine() {
  let i = 0
  const timer = setInterval(() => {
    els.line.textContent = systemFrames[i % systemFrames.length]
    i += 1
    if (i > 11) clearInterval(timer)
  }, 190)
}

function startGate() {
  if (started) return
  started = true
  els.gate.classList.remove("typing")
  els.gate.classList.add("corrupt")
  els.input.blur()
  els.input.readOnly = true
  els.enter.disabled = true
  els.enter.textContent = "ERR"
  els.state.textContent = "input contact detected"
  els.line.textContent = "status :: access attempt logged"
  fillPassword()
  playSfxBurst()
  runSystemLine()
  const burst = setInterval(() => {
    for (let i = 0; i < 7; i += 1) token()
    for (let i = 0; i < 2; i += 1) alertBox()
  }, 138)
  setTimeout(() => {
    els.state.textContent = "pilot route forced"
    els.line.textContent = "status :: wait signal accepted"
  }, 1180)
  setTimeout(() => {
    clearInterval(burst)
    els.gate.classList.remove("is-active")
    els.inbox.classList.add("is-active")
  }, 2850)
}

function warmSfx() {
  sfxPool.forEach(audio => audio.load())
}

function markRead() {
  if (opened) return
  opened = true
  els.mailCount.classList.add("read")
  els.topCount.textContent = "0"
}

function openMail() {
  markRead()
  els.modal.classList.add("is-active")
  els.jazz.volume = 0.72
  els.jazz.play().then(() => {
    els.audioState.textContent = "audio signal :: playing jazz loop"
  }).catch(() => {
    els.audioState.textContent = "audio signal :: blocked / tap once more"
  })
}

function closeMail() {
  els.modal.classList.remove("is-active")
}

function preCorrupt() {
  if (started) return
  els.gate.classList.add("typing")
  els.state.textContent = "input contact detected"
  els.line.textContent = "status :: verifying access code"
}

els.box.addEventListener("pointerdown", event => {
  if (started) return
  warmSfx()
  playSfx(0.32, 0.95)
  preCorrupt()
  if (event.target !== els.enter) els.input.focus()
})

els.input.addEventListener("focus", () => {
  preCorrupt()
  setTimeout(startGate, 240)
})

els.input.addEventListener("beforeinput", event => {
  if (!started) event.preventDefault()
  startGate()
})

els.input.addEventListener("keydown", event => {
  if (!started) event.preventDefault()
  startGate()
})

els.form.addEventListener("submit", event => {
  event.preventDefault()
  startGate()
})

els.enter.addEventListener("pointerdown", () => {
  if (started) return
  warmSfx()
  playSfx(0.32, 1.05)
})

els.mailOpen.addEventListener("click", openMail)

els.mailClose.addEventListener("click", closeMail)

els.modal.addEventListener("click", event => {
  if (event.target === els.modal) closeMail()
})

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && els.modal.classList.contains("is-active")) closeMail()
})
