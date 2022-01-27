let sHour = document.querySelector("#sHour")
let sMin = document.querySelector("#sMin")
let eHour = document.querySelector("#eHour")
let eMin = document.querySelector("#eMin")
let form = document.querySelector("form")
let stime = document.querySelector("#stime")
let etime = document.querySelector("#etime")

form.addEventListener("submit", e => {
    let sH = sHour.value
    let sM = sMin.value
    let eH = eHour.value
    let eM = eMin.value
    let sT = stime.value
    let eT = etime.value
    if (!sM || !sM.length) sM = "00"
    if (!eM || !eM.length) eM = "00"
    if (timeToInt(sH + ":" + sM, sT == "PM") > timeToInt(eH + ":" + eM, eT == "PM")) {
        e.preventDefault()
        alert("Start time must be less than end time!")
    } else if (parseInt(sH) > 12 || parseInt(sH) < 1 || (sT === "AM" && (parseInt(sH) < 7 || parseInt(sH) === 12))) {
        e.preventDefault();
        alert("Start hour must be between 7 AM and 11 PM")
    } else if (parseInt(sM) < 0 || parseInt(sM) > 59) {
        e.preventDefault();
        alert("Start minute must be between 0 and 60")
    } else if (parseInt(eH) > 12 || parseInt(eH) < 1 || (eT === "AM" && (parseInt(eH) < 7 || parseInt(eH) === 12))) {
        e.preventDefault();
        alert("End hour must be between 7 AM and 11 PM")
    } else if (parseInt(eM) < 0 || parseInt(eM) > 59) {
        e.preventDefault();
        alert("End minute must be between 0 and 60")
    }
})

let selBtns = document.querySelectorAll(".selBtn")

selBtns.forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault()
    let idx = btn.classList[1].slice(4)
    if (btn.innerText == "Check All") {
        document.querySelectorAll(`.checkbox-${idx}`).forEach(box => box.checked = true)
        btn.innerText = "Uncheck All"
    }
    else {
        document.querySelectorAll(`.checkbox-${idx}`).forEach(box => box.checked=false)
        btn.innerText = "Check All"
    }
}))