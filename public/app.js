const btn = document.querySelector("button")
const dayPicker = document.querySelector("#dayPicker")

class Course {
    constructor(Term, CRN, Subject, Code, Section, Title, CH, BH, College, SeatsT, SeatsA, BT1, ET1, Buil1, R1, Schedule1, BT2, ET2, Buil2, R2, Schedule2, IName, ISName, LCRN) {
        this.Term = Term.slice(0, Term.length - 8)
        this.CRN = CRN
        this.Subject = Subject
        this.Code = Code
        this.Section = Section
        this.Title = Title
        this.CH = parseInt(CH)
        this.BH = parseInt(BH)
        this.College = College
        this.SeatsT = parseInt(SeatsT)
        this.SeatsA = parseInt(SeatsA)
        this.BT1 = parseInt(BT1)
        this.ET1 = parseInt(ET1)
        this.Buil1 = Buil1
        this.R1 = R1
        this.Schedule1 = Schedule1.replaceAll(".", "")
        this.BT2 = parseInt(BT2)
        this.ET2 = parseInt(ET2)
        this.Buil2 = Buil2
        this.R2 = R2
        this.Schedule2 = Schedule2.replaceAll(".", "")
        this.IName = IName
        this.ISName = ISName
        this.LCRN = LCRN.split(", or ") //array
    }
}

let i = 0

let letterDays = {
    "M": "monday",
    "T": "tuesday",
    "W": "wednesday",
    "R": "thursday",
    "F": "friday",
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

const colors = ["red", "green", "yellow", "lightblue", "indigo", "violet", "brown", "pink"]

function genSched(i) {
    for (let course of Schedules[i]) {
        let { startHour, startMin, endHour, endMin } = fixTimes(course.BT1, course.ET1)
        console.log(startHour, ":", startMin, " ", endHour, ":", endMin)
        let color = colors[Math.floor(Math.random() * colors.length)]
        let cH = startHour
        let written = false
        let cM = startMin
        let i = 0
        let overrideWritten = false
        while (cH <= endHour) {
            if (cH < endHour) {
                for (let day of course.Schedule1) {
                    let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                    content.classList.add("contentBott")
                    let courseBlock = document.createElement("div")
                    courseBlock.classList.add("course")
                    let percentage = (60 - cM) / 60 * 100
                    courseBlock.style.height = `${percentage}%`
                    if (written === false && percentage > 50) {
                        courseBlock.innerHTML = `<span class='blockTitle'> ${course.Subject + " " + course.Code}</span> <small class='blockSub'> ${startHour + ":" + (startMin < 10 ? `0${startMin}` : startMin) + "-" + endHour + ":" + (endMin < 10 ? `0${endMin}` : endMin)} </small>`;
                        overrideWritten = true;
                    }
                    content.append(courseBlock)
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    courseBlock.style.backgroundColor = color
                    if (i === 0) courseBlock.style.borderRadius = "7px 7px 0px 0px"
                }
            }
            if (cH === endHour) {
                cM = endMin
                for (let day of course.Schedule1) {
                    let content = document.querySelector(`.r${cH} .${letterDays[day]} .content`)
                    content.classList.add("contentTop")
                    let courseBlock = document.createElement("div")
                    courseBlock.classList.add("course")
                    courseBlock.style.height = `${100 - ((60 - cM) / 60 * 100)}%`
                    content.append(courseBlock)
                    courseBlock.classList.add("occupied", `occupied-${course.CRN}`)
                    if (written === false) {
                        courseBlock.innerHTML = `<span class='blockTitle'> ${course.Subject + " " + course.Code}</span> <small class='blockSub'> ${startHour + ":" + (startMin < 10 ? `0${startMin}` : startMin) + "-" + endHour + ":" + (endMin < 10 ? `0${endMin}` : endMin)} </small>`
                    }
                    const td = document.querySelector(`.r${cH} .${letterDays[day]}`)
                    td.classList.remove("border")
                    td.style.border = "none"
                    courseBlock.style.backgroundColor = color
                    courseBlock.style.borderRadius = "0px 0px 7px 7px"
                }
            }
            console.log(cH)
            cH++;
            i++;
            cM = 0;
            if (overrideWritten) written = true
        }
    }
}

genSched(i)

function findByCRN(CRN) { //Make it so that it only checks current Sched
    for (let sched of Schedules) {
        for (let course of sched) {
            if (course.CRN === CRN) return course
        }
    }
}

const boxes = document.querySelectorAll(".course")
boxes.forEach(box => {
    let color = box.style.backgroundColor
    box.addEventListener("mouseenter", () => {
        if (box.classList.contains("occupied")) {
            const commonCRN = document.querySelectorAll(`.${box.classList[box.classList.length - 1]}`)
            for (let course of commonCRN) {
                course.style.backgroundColor = "darkblue";
                course.style.color = "white"
            }
        }
    })
    box.addEventListener("mouseleave", () => {
        if (box.classList.contains("occupied")) {
            const commonCRN = document.querySelectorAll(`.${box.classList[box.classList.length - 1]}`)
            for (let course of commonCRN) {
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
            console.log(course, course.seatsA, course.seatsT)
            section.innerText = course.Section
            crn.innerText = course.CRN
            credits.innerText = course.CH
            seats.innerText = `${course.SeatsA}/${course.SeatsA + course.SeatsT}`
            cardTitle.innerText = `${course.Subject} ${course.Code}`
            cardName.innerText = course.Title
        }
    })
})
