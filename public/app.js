const btn = document.querySelector("button")
const dayPicker = document.querySelector("#dayPicker")

class Course {
    constructor(Term, CRN, Subject, Code, Section, Title, CH, BH, College, SeatsT, SeatsA, BT1, ET1, Buil1, R1, Schedule1, BT2, ET2, Buil2, R2, Schedule2, IName, ISName, LCRN) {
        this.Term = Term
        this.CRN = CRN
        this.Subject = Subject
        this.Code = Code
        this.Section = Section
        this.Title = Title
        this.CH = CH
        this.BH = BH
        this.College = College
        this.SeatsT = SeatsT
        this.SeatsA = SeatsA
        this.BT1 = BT1
        this.ET1 = ET1
        this.Buil1 = Buil1
        this.R1 = R1
        this.Schedule1 = Schedule1
        this.BT2 = BT2
        this.ET2 = ET2
        this.Buil2 = Buil2
        this.R2 = R2
        this.Schedule2 = Schedule2
        this.IName = IName
        this.ISName = ISName
        this.LCRN = LCRN
    }
}

class Schedule {
    constructor() {
        this.Monday = []
        this.Tuesday = []
        this.Wednesday = []
        this.Thursday = []
        this.Friday = []
        this.Saturday = []
    }
}

let classes = [
    new Course("Fall2020", 1010, "EECE", 230, "L1", '', 3, 0, "AS", 30, 0, "12:00", "12:50")
]

let i = 0

btn.addEventListener("click", () => {
    const day = dayPicker.value
    const courseBlock = document.querySelector(`.r7 .${day} .content`)
    document.querySelector(`.r7 .${day}`).classList.add(`occupied`, `occupied-${classes[i].CRN}`)
    const name = document.createElement("span")
    name.classList.add("courseName")
    name.innerText = classes[i].Subject + classes[i].Code
    const time = document.createElement("span")
    time.classList.add("courseTime")
    time.innerText = `${classes[i].BT1}-${classes[i].ET1}`
    courseBlock.append(name)
    courseBlock.append(time)
})

const boxes = document.querySelectorAll(".box")

boxes.forEach(box =>{
    box.addEventListener("mouseenter", () => {
        if (box.classList.contains("occupied")) {
            const commonCRN = document.querySelectorAll(`.${box.classList[box.classList.length - 1]}`)
            for (let course of commonCRN) {
                course.style.transform = "scale(1.1)";
            }
        }
    })
    box.addEventListener("mouseleave", () => {
        if (box.classList.contains("occupied")) {
            const commonCRN = document.querySelectorAll(`.${box.classList[box.classList.length - 1]}`)
            for (let course of commonCRN) {
                course.style.transform = "scale(1.0)";
            }
        }
    })
})