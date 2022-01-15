// set Variables

let i = 0
let letterDays = {
    "M": "monday",
    "T": "tuesday",
    "W": "wednesday",
    "R": "thursday",
    "F": "friday",
    "S": "saturday"
}
let nextSchedArrow = document.querySelector(".rightArrow")
let index = document.querySelector("#index")
let prevSchedArrow = document.querySelector(".leftArrow")
let boxes;
const mainSchedules = [...Schedules]
let custom = document.querySelector("#custom")
let lockedCRNs = []
let deletedCRNs = []
let total = document.querySelector("#total")
let idxSpan = document.querySelector("#index")
let t = false
let timeTDs = document.querySelectorAll(".time")
timeTDs = Array.from(timeTDs).slice(6)
let removed = document.querySelector("#removed")
//Functions

const isRecitation = ({ Section }) => !isNumberorL(Section);

function isNumberorL(N) {
  for (let digit of N) {
    let digitIsNumber = false;
    for (let number of "1234567890L") {
      if (digit == number) {
        digitIsNumber = true;
        continue;
      }
    }
    if (!digitIsNumber) return false;
  }
  return true;
}

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin) {
    let span = document.createElement("span")
    span.classList.add("blockTitle")
    span.innerText = course.Subject + " " + course.Code
    let small = document.createElement("small")
    small.classList.add("blockSub")
    small.innerText = `${startHour + ":" + (startMin < 10 ? `0${startMin}` : startMin) + "-" + endHour + ":" + (endMin < 10 ? `0${endMin}` : endMin)}`
    courseBlock.append(span)
    courseBlock.append(small)
}

function fixTimes(BT, ET) {
    let B = BT.toString()
    let E = ET.toString()
    var startHour, startMin, endHour, endMin
    if (B.length === 3) {
        startHour = parseInt(B[0])
        startMin = parseInt(B.slice(1))
    }
    else if (B.length === 4) {
        startHour = parseInt(B.slice(0, 2))
        startMin = parseInt(B.slice(2))
    }
    if (E.length === 3) {
        endHour = parseInt(E[0])
        endMin = parseInt(E.slice(1))
    }
    else if (E.length === 4) {
        endHour = parseInt(E.slice(0, 2))
        endMin = parseInt(E.slice(2))
    }
    return { startHour, startMin, endHour, endMin }
}

function makeIcon() {
    let icon = document.createElement("i")
    icon.classList.add("fas")
    icon.classList.add("fa-lock")
    return icon
}

function makeXIcon() {
    let icon = document.createElement("i")
    icon.classList.add("fas")
    icon.classList.add("fa-times-circle")
    icon.classList.add("liX")
    return icon
}

function genSched(i) {
    for (let course of Schedules[i]) {
        let { startHour, startMin, endHour, endMin } = fixTimes(course.BT1, course.ET1)
        let cH = startHour
        let written = false
        let cM = startMin
        let i = 0
        let overrideWritten = false
        let shouldLock = lockedCRNs.includes(course.CRN)
        let lock = false
        let overrideLock = false
        while (cH <= endHour) {
            if (cH < endHour) {
                for (let day of course.Schedule1) {
                    let td = document.querySelector(`.r${cH} .${letterDays[day]}`)
                    td.style.borderBottom = `1px solid ${course.Color}`
                    let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                    let courseBlock = document.createElement("div")
                    courseBlock.classList.add("course")
                    let percentage = (60 - cM) / 60 * 100
                    courseBlock.style.height = `${percentage}%`
                    if (written === false && percentage >= 50) {
                        labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin)
                        overrideWritten = true;
                    }
                    if (shouldLock && lock === false && percentage >= 70) {
                        courseBlock.append(makeIcon())
                        overrideLock = true
                    }
                    if (!content.classList.contains("contentTop")) {
                        content.classList.add("contentBott")
                    }
                    else {
                        content.classList.remove("contentTop")
                        content.classList.add("contentBoth")
                    }
                    content.append(courseBlock)
                    courseBlock.style.backgroundColor = course.Color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
                    if(cH+1===endHour && endMin===0){
                        courseBlock.style.borderRadius = "0px 0px 7px 7px"
                        courseBlock.classList.add("special")
                        td.style.borderBottom="none"
                    }
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                }
            }
            if (cH === endHour) {
                if(endMin===0) break;
                cM = endMin
                for (let day of course.Schedule1) {
                    let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                    let courseBlock = document.createElement("div")
                    courseBlock.classList.add("course")
                    courseBlock.style.height = `${100 - ((60 - cM) / 60 * 100)}%`
                    if (!content.classList.contains("contentBott")) {
                        content.classList.add("contentTop")
                        content.append(courseBlock)
                    }
                    else {
                        content.classList.remove("contentBott")
                        content.classList.add("contentBoth")
                        let courseBott = document.querySelector(`.r${cH} .${letterDays[day]} .occupied`)
                        courseBott.before(courseBlock)
                    }
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    if (written === false) {
                        overrideWritten = true
                        labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin)
                    }
                    if (shouldLock && lock === false) {
                        courseBlock.append(makeIcon())
                        overrideLock = true
                    }
                    courseBlock.style.backgroundColor = course.Color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 7px 7px"
                    else courseBlock.style.borderRadius = "0px 0px 7px 7px"
                }
            }
            cH++;
            i++;
            cM = 0;
            if (overrideWritten) written = true
            if (overrideLock) lock = true
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (course.BT2) {
            let { startHour, startMin, endHour, endMin } = fixTimes(course.BT2, course.ET2)
            let cH = startHour
            let written = false
            let cM = startMin
            let i = 0
            let overrideWritten = false
            let lock = false
            let overrideLock = false
            while (cH <= endHour) {
                if (cH < endHour) {
                    for (let day of course.Schedule2) {
                        let td = document.querySelector(`.r${cH} .${letterDays[day]}`)
                        td.style.borderBottom = `1px solid ${course.Color}`
                        let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                        content.classList.add("contentBott")
                        let courseBlock = document.createElement("div")
                        courseBlock.classList.add("course")
                        let percentage = (60 - cM) / 60 * 100
                        courseBlock.style.height = `${percentage}%`
                        if (written === false && percentage >= 50) {
                            labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin);
                            overrideWritten = true;
                        }
                        if (shouldLock && lock === false && percentage >= 70) {
                            courseBlock.append(makeIcon())
                            overrideLock = true
                        }
                        content.append(courseBlock)
                        courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                        courseBlock.style.backgroundColor = course.Color
                        if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
                        if(cH+1===endHour && endMin===0){
                            courseBlock.style.borderRadius = "0px 0px 7px 7px"
                            courseBlock.classList.add("special")
                            td.style.borderBottom="none"
                        }
                        courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    }
                }
                if (cH === endHour) {
                    cM = endMin
                    for (let day of course.Schedule2) {
                        let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                        content.classList.add("contentTop")
                        let courseBlock = document.createElement("div")
                        courseBlock.classList.add("course")
                        courseBlock.style.height = `${100 - ((60 - cM) / 60 * 100)}%`
                        content.append(courseBlock)
                        courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                        if (written === false) {
                            labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin);
                            overrideWritten = true;
                        }
                        if (shouldLock && lock === false) {
                            courseBlock.append(makeIcon())
                            overrideLock = true
                        }
                        courseBlock.style.backgroundColor = course.Color
                        courseBlock.style.borderRadius = "0px 0px 7px 7px"
                    }
                }
                cH++;
                i++;
                cM = 0;
                if (overrideWritten) written = true
                if (overrideLock) lock = true
            }
        }
    }
    custom.innerHTML = ""
    for (let j = 0; j < Schedules[i].length; j++) {
        let course = Schedules[i][j]
        let newInp = document.createElement("input")
        newInp.value = course.Color
        newInp.type = "color"
        newInp.id = `color-${course.CRN}`
        newInp.addEventListener("input", () => {
            let commonCRN = document.querySelectorAll(`.occupied-${course.CRN}`)
            commonCRN.forEach(courseBlock => {
                let newColor = newInp.value
                Schedules[i][j].Color = newColor
                courseBlock.style.backgroundColor = newColor
                ////////////////////////////////////////////////////////////
                let p = courseBlock.parentElement
                let p2 = p.parentElement
                if (p.classList.contains("contentBott")) p2.style.borderBottom = `1px solid ${newColor}`;
                else if (p.classList.contains("contentBoth")) {
                    let children = p.childNodes
                    let last = children[children.length - 1]
                    if (last.classList.contains(`occupied-${course.CRN}`)) p2.style.borderBottom = `1px solid ${newColor}`
                }
                ////////////////////////////////////////////////////////////
                updateBoxes()
            })
        })
        let label = document.createElement("label")
        label.for = `color-${course.CRN}`
        label.innerText = `${course.Subject} ${course.Code} - ${course.CRN}`
        label.classList.add("colorTitle")
        let div = document.createElement("div")
        div.classList.add("form-group-color", "mt-2", "mb-2")
        div.append(newInp)
        div.append(label)
        custom.append(div)
    }
}

function clearSched() {
    let tds = document.querySelectorAll("td")
    tds.forEach(td => {
        if (!td.classList.contains("time")) {
            td.style.borderBottom = "1px solid lightgray"
        }
    })
    let contents = document.querySelectorAll(".content")
    contents.forEach(content => {
        content.innerHTML = "";
        content.classList.remove("contentTop")
        content.classList.remove("contentBott")
        content.classList.remove("contentBoth")
    })
}

function updateTime12() {
    timeTDs.forEach(td => {
        let hour = td.innerText.slice(0, 2)
        td.innerText = `${hour - 12}:00`
    })
    let blockSubs = document.querySelectorAll(".blockSub")
    blockSubs.forEach(t => {
        let [BT, ET] = t.innerText.split("-")
        BT = BT.split(":")
        ET = ET.split(":")
        let BTh = BT[0]
        let BTm = BT[1]
        let ETh = ET[0]
        let ETm = ET[1]
        BTh > 12 ? BTh -= 12 : BTh
        ETh > 12 ? ETh -= 12 : ETh
        t.innerText = `${BTh}:${BTm}-${ETh}:${ETm}`
    })
}

const checkCRNsInSched = (Schedule, CRNs) => {
    for (let CRN of CRNs) if (Schedule.filter(x => x.CRN === CRN).length == 0) return false
    return true
}

function updateTime24() {
    timeTDs.forEach(td => {
        let hour = td.innerText.slice(0, td.innerText.length - 3)
        td.innerText = `${parseInt(hour) + 12}:00`
    })
    let blockSubs = document.querySelectorAll(".blockSub")
    blockSubs.forEach(t => {
        let [BT, ET] = t.innerText.split("-")
        BT = BT.split(":")
        ET = ET.split(":")
        let BTh = parseInt(BT[0])
        let BTm = parseInt(BT[1])
        let ETh = parseInt(ET[0])
        let ETm = parseInt(ET[1])
        if (parseInt(t.parentElement.parentElement.parentElement.parentElement.classList[0].slice(1)) > 12) {
            BTh += 12;
            ETh += 12
        }
        else if (parseInt(t.parentElement.parentElement.parentElement.parentElement.classList[0].slice(1)) + Math.abs(ETh - BTh) > 12) ETh += 12
        t.innerText = `${BTh}:${BTm / 10 >= 1 ? BTm : "0" + BTm}-${ETh}:${ETm / 10 >= 1 ? ETm : "0" + ETm}`
    })
}

function findByCRN(CRN) {
    for (let course of Schedules[i]) {
        if (course.CRN === CRN) return course
    }
}

function findName(CRN) {
    for (let course of Schedules[i]) {
        if (course.CRN === CRN) return `${course.Subject} ${course.Code} ${course.Section}`
    }
}

function updateBoxes() {
    boxes.forEach(box => {
        let color = box.style.backgroundColor
        let crnClass = box.classList[box.classList.length - 1]
        box.addEventListener("mouseenter", () => {
            if (box.classList.contains("occupied")) {
                const commonCRN = document.querySelectorAll(`.${crnClass}`)
                for (let course of commonCRN) {
                    let p = course.parentElement
                    let p2 = p.parentElement
                    if (p.classList.contains("contentBott")) p2.style.borderBottom = "1px solid darkblue";
                    else if (p.classList.contains("contentBoth")) {
                        let children = p.childNodes
                        let last = children[children.length - 1]
                        if (last.classList.contains(crnClass)) p2.style.borderBottom = "1px solid darkblue"
                    }
                    course.style.backgroundColor = "darkblue";
                    course.style.color = "white";
                }
            }
        })
        box.addEventListener("mouseleave", () => {
            if (box.classList.contains("occupied")) {
                const commonCRN = document.querySelectorAll(`.${crnClass}`)
                for (let course of commonCRN) {
                    let p = course.parentElement
                    let p2 = p.parentElement
                    if (p.classList.contains("contentBott")) p2.style.borderBottom = `1px solid ${color}`;
                    else if (p.classList.contains("contentBoth")) {
                        let children = p.childNodes
                        let last = children[children.length - 1]
                        if (last.classList.contains(crnClass)) p2.style.borderBottom = `1px solid ${color}`
                    }
                    course.style.backgroundColor = color;
                    course.style.color = "black"
                }
            }
        })

        box.addEventListener("click", async () => {
            if (box.classList.contains("occupied")) {
                const CRN = box.classList[box.classList.length - 1].slice(9)
                let section = document.querySelector("#section")
                let crn = document.querySelector("#crn")
                let credits = document.querySelector("#credits")
                let seats = document.querySelector("#seats")
                let course = findByCRN(CRN)
                let cardTitle = document.querySelector("#cardTitle")
                let cardName = document.querySelector("#cardName")
                let instructor = document.querySelector("#instructor")
                section.innerText = course.Section ? course.Section : "N/A"
                crn.innerText = course.CRN
                credits.innerText = course.CH ? course.CH : "N/A"
                seats.innerText = `${course.SeatsA || course.SeatsA == 0 ? course.SeatsA : "N/A"}/${(course.SeatsA + course.SeatsT) ? (course.SeatsA + course.SeatsT) : "N/A"}`
                cardTitle.innerText = `${course.Subject} ${course.Code}`
                cardName.innerText = course.Title
                if (course.IName === "." && course.ISName === "STAFF") instructor.innerText = 'TBA'
                else if (!course.IName || !course.ISName) instructor.innerText = "N/A"
                else instructor.innerText = `${course.IName} ${course.ISName}`
            }
        })

        box.addEventListener("dblclick", () => {
            const CRN = box.classList[box.classList.length - 1].slice(9)
            let currentSched = Schedules[i]

            if (lockedCRNs.includes(CRN)) {
                lockedCRNs.splice(lockedCRNs.indexOf(CRN), 1)
                Schedules = mainSchedules.filter(Schedule => {
                    for (let course of Schedule) {
                        if (deletedCRNs.includes(course.CRN)) return false
                    }
                    return checkCRNsInSched(Schedule, lockedCRNs)
                })
                let newIdxOfSched = Schedules.indexOf(currentSched)
                i = newIdxOfSched
                total.innerText = Schedules.length
                idxSpan.innerText = newIdxOfSched + 1
                clearSched()
                genSched(i)

                boxes = document.querySelectorAll(".course")
                updateBoxes()
            }

            else {
                lockedCRNs.push(CRN)
                Schedules = Schedules.filter(sched => {
                    for (let course of sched) if (course.CRN === CRN) return true
                    return false
                })
                let newIdxOfSched = Schedules.indexOf(currentSched)
                i = newIdxOfSched
                total.innerText = Schedules.length
                idxSpan.innerText = newIdxOfSched + 1
                clearSched()
                genSched(i)

                boxes = document.querySelectorAll(".course")
                updateBoxes()
            }
        })

        box.addEventListener("contextmenu", e => {
            e.preventDefault();
            const CRN = box.classList[box.classList.length - 1].slice(9)
            let newSched = Schedules.filter(sched => {
                for (let course of sched) if (course.CRN === CRN) return false
                return true
            })
            if (newSched.length) {
                deletedCRNs.push(CRN)
                updateDeletedCRNs(CRN, findName(CRN))
                Schedules = newSched
                let newIdxOfSched = 0
                i = newIdxOfSched
                total.innerText = Schedules.length
                idxSpan.innerText = newIdxOfSched + 1
                clearSched()
                genSched(i)
                boxes = document.querySelectorAll(".course")
                updateBoxes()
            }
            else {
              for (let Section of Schedules[i]){
                if (CRN === Section.CRN) alert(`Cannot remove this ${isRecitation(Section) ? "recitation":"section"} for ${Section.Subject + Section.Code} since it would result in 0 Schedules`)
              }
            }
        }
        )
    })
}

function updateDeletedCRNs(CRN, name) {
    let span = document.createElement("span")
    let span2 = document.createElement("span")
    span2.innerText = `${name} - ${CRN}`
    span.classList.add("removed-li")
    span.append(makeXIcon(), span2)
    span.addEventListener("click", () => {
        let currentSched = Schedules[i]
        deletedCRNs.splice(deletedCRNs.indexOf(CRN), 1)
        Schedules = mainSchedules.filter(Schedule => {
            for (let course of Schedule) {
                if (deletedCRNs.includes(course.CRN)) return false
            }
            return checkCRNsInSched(Schedule, lockedCRNs)
        })
        let newIdxOfSched = Schedules.indexOf(currentSched)
        i = newIdxOfSched
        total.innerText = Schedules.length
        idxSpan.innerText = newIdxOfSched + 1
        clearSched()
        genSched(i)
        boxes = document.querySelectorAll(".course")
        updateBoxes()
        span.remove()
    })
    removed.append(span)
}

nextSchedArrow.addEventListener("click", () => {
    if (i < Schedules.length - 1) {
        clearSched()
        i++;
        index.innerText = i + 1
        genSched(i)
        boxes = document.querySelectorAll(".course");
        updateBoxes()
    }
})

prevSchedArrow.addEventListener("click", () => {
    if (i > 0) {
        clearSched()
        i--;
        index.innerText = i + 1
        genSched(i)
        boxes = document.querySelectorAll(".course");
        updateBoxes()
    }
})

let changeTime = document.querySelector("#changeTime")

changeTime.addEventListener("click", () => {
    t = !t
    if (t) {
        updateTime12()
        changeTime.innerText = "12 Hour Format"
    }
    else {
        updateTime24()
        changeTime.innerText = "24 Hour Format"
    }
    changeTime.classList.toggle("time24")

})

genSched(i)
boxes = document.querySelectorAll(".course")
updateBoxes()

document.querySelector("body").addEventListener("keydown", e => {
    if (e.keyCode === 37) prevSchedArrow.click()
    else if (e.keyCode === 39) nextSchedArrow.click()
})

idxSpan.addEventListener("dblclick", e => {
    let val = idxSpan.innerText
    idxSpan.innerHTML = ""
    let newInpDiv = document.createElement("div")
    let newInp = document.createElement("input")
    newInpDiv.append(newInp)
    idxSpan.append(newInpDiv)
    newInp.classList.add('form-control')
    newInp.value = val
    newInp.focus()
    newInp.addEventListener("change", e => {
        let v = newInp.value
        if (v <= Schedules.length) {
            clearSched()
            i = v - 1;
            index.innerHTML = ""
            index.innerText = i + 1
            genSched(i)
            boxes = document.querySelectorAll(".course");
            updateBoxes()
        }
        else {
            alert("Improper form/ Outside range of schedules!")
        }
    })
})

let copy = document.querySelector(".copyCRNs")
copy.addEventListener('click', e => {
    let newInp = document.createElement("input")
    newInp.value = Schedules[i].map(x => x.CRN).join("\t")
    document.body.append(newInp)
    newInp.select()
    document.execCommand("copy")
    newInp.remove()
    copy.innerHTML = 'Copied to clipboard! <i class="fas fa-check-circle"></i>'
    copy.style.border = "1px solid green"
    copy.style.backgroundColor = "lightgreen"
    copy.style.color = "darkgreen"

    setTimeout(() => {
        copy.innerHTML = `Copy CRNs <i class="fas fa-clipboard-list"></i>`
        copy.style.border = "2px solid lightblue"
        copy.style.backgroundColor = "#ceebf5"
        copy.style.color = "darkblue"
    },1000)
})