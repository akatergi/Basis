// set Variables

let i = 0
let letterDays = {
    "M": "monday",
    "T": "tuesday",
    "W": "wednesday",
    "R": "thursday",
    "F": "friday",
}
let nextSchedArrow = document.querySelector(".rightArrow")
let index = document.querySelector("#index")
let prevSchedArrow = document.querySelector(".leftArrow")
let boxes;
const mainSchedules = [...Schedules]
let custom = document.querySelector("#custom")
let lockedCRNs = []
let total = document.querySelector("#total")
let idxSpan = document.querySelector("#index")
//Functions

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
function genSched(i) {
    for (let course of Schedules[i]) {
        let { startHour, startMin, endHour, endMin } = fixTimes(course.BT1, course.ET1)
        let cH = startHour
        let written = false
        let cM = startMin
        let i = 0
        let overrideWritten = false
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
                    if (!content.classList.contains("contentTop")) {
                        content.classList.add("contentBott")
                    }
                    else {
                        content.classList.remove("contentTop")
                        content.classList.add("contentBoth")
                    }
                    content.append(courseBlock)
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    courseBlock.style.backgroundColor = course.Color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
                    content.append(courseBlock)
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    courseBlock.style.backgroundColor = course.Color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
                }
            }
            if (cH === endHour) {
                endMin === 0 ? cM = 60 : cM = endMin
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
                    courseBlock.style.backgroundColor = course.Color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 7px 7px"
                    else courseBlock.style.borderRadius = "0px 0px 7px 7px"
                }
            }
            cH++;
            i++;
            cM = 0;
            if (overrideWritten) written = true
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (course.BT2) {
            let { startHour, startMin, endHour, endMin } = fixTimes(course.BT2, course.ET2)
            let cH = startHour
            let written = false
            let cM = startMin
            let i = 0
            let overrideWritten = false
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
                            labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin)
                            overrideWritten = true;
                        }
                        content.append(courseBlock)
                        courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                        courseBlock.style.backgroundColor = course.Color
                        if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
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
                            labelCourseBlock(course, courseBlock, startHour, startMin, endHour, endMin)
                        }
                        courseBlock.style.backgroundColor = course.Color
                        courseBlock.style.borderRadius = "0px 0px 7px 7px"
                    }
                }
                cH++;
                i++;
                cM = 0;
                if (overrideWritten) written = true
            }
        }
    }
    custom.innerHTML=""
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

function findByCRN(CRN) {
    for (let course of Schedules[i]) {
        if (course.CRN === CRN) return course
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
                section.innerText = course.Section
                crn.innerText = course.CRN
                credits.innerText = course.CH
                seats.innerText = `${course.SeatsA}/${course.SeatsA + course.SeatsT}`
                cardTitle.innerText = `${course.Subject} ${course.Code}`
                cardName.innerText = course.Title
                if (course.IName === "." && course.ISName === "STAFF") instructor.innerText = 'TBA'
                else instructor.innerText = `${course.IName} ${course.ISName}`
            }
        })

        box.addEventListener("dblclick", () => {
            const CRN = box.classList[box.classList.length - 1].slice(9)
            let currentSched = Schedules[i]

            if(lockedCRNs.includes(CRN)){
                lockedCRNs.splice(lockedCRNs.indexOf(CRN),1)
                Schedules = Schedules.filter( sched => {
                    for(let course of sched) if(course.CRN===CRN) return true
                    return false
                })
                let newIdxOfSched = Schedules.indexOf(currentSched)
                i = newIdxOfSched
                total.innerText = Schedules.length
                idxSpan.innerText = newIdxOfSched+1
                clearSched()
                genSched(i)
            }
            
            else{
                lockedCRNs.push(CRN)
                Schedules = Schedules.filter( sched => {
                    for(let course of sched) if(course.CRN===CRN) return true
                    return false
                })
                let newIdxOfSched = Schedules.indexOf(currentSched)
                i = newIdxOfSched
                total.innerText = Schedules.length
                idxSpan.innerText = newIdxOfSched+1
                clearSched()
                genSched(i)
            }
        })
    })
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

genSched(i)
boxes = document.querySelectorAll(".course")
updateBoxes()