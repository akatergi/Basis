const addCRN = document.querySelector("#addCRN")
const setCRNs = document.querySelector("#setCRNs")
const setCourses = document.querySelector("#courses")
const addCourse = document.querySelector("#addCourse")
const setElectives = document.querySelector("#setElectives")
const addElective = document.querySelector("#addElective")
const next = document.querySelector("#next")
// let customCourses = []
const addCustomCourse = document.querySelector("#addCustomCourse")
const createCourse = document.querySelector("#createCourse")
const customTitle = document.querySelector("#customTitle")
const sHour = document.querySelector("#sHour");
const sMinute = document.querySelector("#sMinute");
const sTime = document.querySelector("#sTime");
const eHour = document.querySelector("#eHour");
const eMinute = document.querySelector("#eMinute");
const eTime = document.querySelector("#eTime");
const checkMonday = document.querySelector("#check-Monday")
const checkTuesday = document.querySelector("#check-Tuesday")
const checkWednesday = document.querySelector("#check-Wednesday")
const checkThursday = document.querySelector("#check-Thursday")
const checkFriday = document.querySelector("#check-Friday")
const checkSaturday = document.querySelector("#check-Saturday")
const setCustomCourses = document.querySelector("#setCustomCourses")
//////////////////////////////////////////////////////////
const editTitle = document.querySelector("#editTitle")
const editsHour = document.querySelector("#editsHour");
const editsMinute = document.querySelector("#editsMinute");
const editsTime = document.querySelector("#editsTime");
const editeHour = document.querySelector("#editeHour");
const editeMinute = document.querySelector("#editeMinute");
const editeTime = document.querySelector("#editeTime");
const editcheckMonday = document.querySelector("#editcheck-Monday")
const editcheckTuesday = document.querySelector("#editcheck-Tuesday")
const editcheckWednesday = document.querySelector("#editcheck-Wednesday")
const editcheckThursday = document.querySelector("#editcheck-Thursday")
const editcheckFriday = document.querySelector("#editcheck-Friday")
const editcheckSaturday = document.querySelector("#editcheck-Saturday")
const editsetCustomCourses = document.querySelector("#editsetCustomCourses")
const updateButton = document.querySelector("#updateButton")
const editeAM = document.querySelector("#editeAM")
const editePM = document.querySelector("#editePM")
const editsAM = document.querySelector("#editsAM")
const editsPM = document.querySelector("#editsPM")
const mainClose = document.querySelector("#mainClose")
const editClose = document.querySelector("#editClose")
const form = document.querySelector("form")
var customIdx;

// let crnCount = 0
// let counter = 0
// let counter2 = 0
// let courseCount = 0
// let counter3 = 1

function getIcon() {
    let i = document.createElement("i")
    i.classList.add("fas", "fa-trash")
    return i
}
function getIcon2() {
    let i = document.createElement("i")
    i.classList.add("fas", "fa-edit")
    return i
}

function timeToInt(Time, PM) {
    // 09:30
    Time = Time.split(":");
    let Hours = Time[0],
        Mins = Time[1];
    return (
        parseInt(Hours) * 100 +
        parseInt(Mins) +
        (Hours != "12" && PM == true ? 1200 : 0)
    );
}

function intToTime(I) {
    let S = String(I),
        n = S.length,
        Minutes = S.slice(n - 2),
        Hours = S.slice(0, n - 2);
    if (Hours == "12") return Hours + ":" + Minutes + " PM";
    else if (I < 1200) return Hours + ":" + Minutes + " AM";
    else return String(parseInt(Hours) - 12) + ":" + Minutes + " PM";
}


function CRNPlaceholder(e) {
    return `eg: ${e}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`
}

function coursePlaceholder() {
    let courses = ["MATH", "STAT", "BIOL", "CHEM", "ENGL", "EECE", "CIVE", "PHYS", "INDE", "HIST", "DCSN", "CMPS", "ACCT", "ECON", "FEAA", "ARAB", "MECH", "MNGT", "MUSC", "ARCH", "AROL", "BUSS", "BMEN"]
    return `eg: ${courses[Math.floor(Math.random() * courses.length)]}` + (Math.floor(Math.random() * 5) + 1) + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 9)
}

addCRN.addEventListener('click', e => {
    if (totalCount < 9) {
        e.preventDefault();
        let newInp = document.createElement("input")
        newInp.type = "number"
        newInp.min = "10000"
        newInp.id = `crnInput-${counter}`
        newInp.classList.add(`crnInput`)
        newInp.name = "setCRNs[]"
        newInp.classList.add("form-control", "mt-2")
        newInp.placeholder = CRNPlaceholder(2)

        let clearButton = document.createElement("a")
        clearButton.id = `clearButton-${counter}`
        clearButton.append(getIcon())
        clearButton.classList.add("clearButton", "crnClear")

        clearButton.addEventListener("click", function (e) {
            e.preventDefault()
            newInp.remove()
            this.remove()
            totalCount--
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 13) {
                e.preventDefault()
                addCRN.click()
                let newerInp = document.querySelector(`#crnInput-${counter - 1}`)
                newerInp.select()
            }
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 8 && newInp.value.length === 0) {
                clearButton.click()
                let allInps = document.querySelectorAll(`.crnInput`)
                if (allInps.length) {
                    let lastInp = allInps[allInps.length - 1]
                    let val = lastInp.value
                    lastInp.select()
                    lastInp.value = val * 10;
                }
            }
        }
        )

        let newDiv = document.createElement("div")
        newDiv.append(newInp, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setCRNs.append(newDiv)

        counter++
        totalCount++
    }
    else {
        e.preventDefault()
        alert("Can't place more than 9 courses in total on schedule!")
    }
})

addCourse.addEventListener('click', e => {
    if (totalCount < 9) {
        e.preventDefault();
        let newInp = document.createElement("input")
        newInp.type = "text"
        newInp.minLength = "7"
        newInp.id = `courseInput-${counter2}`
        newInp.classList.add("courseInput")
        newInp.name = "sections[]"
        newInp.classList.add("form-control", "mt-2")
        newInp.placeholder = coursePlaceholder()

        let clearButton = document.createElement("a")
        clearButton.id = `clearButton-${counter2}`
        clearButton.append(getIcon())
        clearButton.classList.add("clearButton", "courseClear")

        clearButton.addEventListener("click", function (e) {
            e.preventDefault()
            newInp.remove()
            this.remove()
            totalCount--
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 13) {
                e.preventDefault()
                addCourse.click()
                let newerInp = document.querySelector(`#courseInput-${counter2 - 1}`)
                newerInp.select()
            }
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 8 && newInp.value.length === 0) {
                clearButton.click()
                let allInps = document.querySelectorAll(`.courseInput`)
                if (allInps.length) {
                    let lastInp = allInps[allInps.length - 1]
                    let val = lastInp.value
                    lastInp.select()
                    lastInp.value = val + " "
                }
            }
        }
        )

        let newDiv = document.createElement("div")
        newDiv.append(newInp, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setCourses.append(newDiv)

        counter2++
        totalCount++
    }
    else {
        e.preventDefault()
        alert("Can't place more than 9 courses in total on schedule!")
    }
})

addElective.addEventListener("click", e => {
    if (totalCount < 9) {
        e.preventDefault()
        let select = document.createElement("select")
        select.classList.add("form-select", "mt-2")
        select.name = 'electives[]'
        let D = {
            "Social Sciences I": "SS1",
            "Social Sciences II": "SS2",
            "Humanities I": "H1",
            "Humanities II": "H2",
            "Natural Sciences": "NS",
            "Arabic Communication Skills": "Ar",
            "English Communication Skills": "En",
            "Quantitative Thought": "QT"
        };
        for (let key in D) {
            let option = document.createElement("option")
            option.value = D[key]
            option.innerText = key
            select.append(option)
        }

        let clearButton = document.createElement("a")
        clearButton.append(getIcon())
        clearButton.classList.add("clearButton", "electiveClear")

        clearButton.addEventListener("click", function (e) {
            e.preventDefault()
            select.remove()
            this.remove()
            totalCount--
        })

        let newDiv = document.createElement("div")
        newDiv.append(select, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setElectives.append(newDiv)
        totalCount++
    }
    else {
        e.preventDefault()
        alert("Can't place more than 9 courses in total on schedule!")
    }
})

form.addEventListener("submit", e => {
    let newInp = document.createElement("input")
    newInp.type = "hidden"
    newInp.name = "customCourses"
    newInp.value = JSON.stringify(customCourses)
    console.log(customCourses, newInp.value)
    setCustomCourses.append(newInp)
})

createCourse.addEventListener("click", e => {
    e.preventDefault()
    if (totalCount < 9) {
        let Subject = customTitle.value
        let sH = sHour.value
        let sM = sMinute.value
        let eH = eHour.value
        let eM = eMinute.value
        let sT = sTime.value
        let eT = eTime.value
        if (!sM) sM = "00"
        if (!eM) eM = "00"
        if (Subject === "") alert("Need to specify name!")
        else if (sH.length === 0) alert("Must specify Start Hour!")
        else if (eH.length === 0) alert("Must specify End Hour!")
        else if (parseInt(sH) > 12 || parseInt(sH) < 1 || (sT === "AM" && (parseInt(sH) < 7 || parseInt(sH) === 12))) alert("Start hour must be between 7 AM and 11 PM")
        else if (parseInt(sM) < 0 || parseInt(sM) > 59) alert("Start minute must be between 0 and 60")
        else if (parseInt(eH) > 12 || parseInt(eH) < 1 || (eT === "AM" && (parseInt(eH) < 7 || parseInt(eH) === 12))) alert("End hour must be between 7 AM and 11 PM")
        else if (parseInt(eM) < 0 || parseInt(eM) > 59) alert("End minute must be between 0 and 60")

        else {
            let BT1 = timeToInt(sH + ":" + sM, sT === "PM")
            let ET1 = timeToInt(eH + ":" + eM, eT === "PM")
            let days = [checkMonday, checkTuesday, checkWednesday, checkThursday, checkFriday, checkSaturday]
            let Schedule1 = ""
            let CRN = `CUST${counter3}`

            for (let day of days) {
                if (day.checked) {
                    if (day.value !== "Thursday") Schedule1 += day.value[0]
                    else Schedule1 += "R"
                }
            }
            if (Schedule1.length === 0) alert("Course should be on at least one day!")
            else if (BT1 > ET1) alert("Begin time cannot be greater than end time!")
            else if ((ET1 - BT1) < 30) alert("Custom Course must be at least 30 minutes!")
            else {
                let customCourseObj = { Subject, Code: "", CRN, BT1, ET1, Schedule1, LCRN: [], Schedule2: "" }
                customCourses.push(customCourseObj)
                let li = document.createElement("li")
                li.classList.add("list-group-item", "form-control", "mt-2")
                li.innerText = `Title: ${Subject}, Time: ${intToTime(BT1)} - ${intToTime(ET1)}, Schedule:${Schedule1}`
                li.id = `li-${customCourses.indexOf(customCourseObj)}`

                let clearButton = document.createElement("a")
                clearButton.append(getIcon())
                clearButton.classList.add("clearButton", "customClear")
                totalCount++


                let editButton = document.createElement("a")
                editButton.append(getIcon2())
                editButton.setAttribute("data-bs-toggle", "modal")
                editButton.setAttribute("data-bs-target", "#editModal")
                editButton.classList.add("editButton")
                editButton.id = `edit-${CRN}`

                editButton.addEventListener("click", () => {
                    e.preventDefault()
                    console.log(editButton.id.slice(9))
                    customIdx = parseInt(editButton.id.slice(9))
                    editTitle.value = Subject
                    editsHour.value = sH
                    editeHour.value = eH
                    editeMinute.value = eM
                    editsMinute.value = sM
                    if (Schedule1.includes("M")) editcheckMonday.checked = true
                    else editcheckMonday.checked = false
                    if (Schedule1.includes("T")) editcheckTuesday.checked = true
                    else editcheckTuesday.checked = false
                    if (Schedule1.includes("W")) editcheckWednesday.checked = true
                    else editcheckWednesday.checked = false
                    if (Schedule1.includes("R")) editcheckThursday.checked = true
                    else editcheckThursday.checked = false
                    if (Schedule1.includes("F")) editcheckFriday.checked = true
                    else editcheckFriday.checked = false
                    if (Schedule1.includes("S")) editcheckSaturday.checked = true
                    else editcheckSaturday.checked = false

                    if (sT === "PM") { editsPM.selected = true; editsAM.selected = false }
                    else { editsPM.selected = false; editsAM.selected = true }
                    if (eT === "PM") { editePM.selected = true; editeAM.selected = false }
                    else { editePM.selected = false; editeAM.selected = true }
                })

                clearButton.addEventListener("click", function (e) {
                    e.preventDefault()
                    li.remove()
                    customCourses.splice(customCourses.indexOf(customCourseObj), 1)
                    this.remove()
                    editButton.remove()
                    totalCount--
                })

                let newDiv = document.createElement("div")
                newDiv.append(li, editButton, clearButton)
                newDiv.classList.add("CRNInpGrp")
                counter3++
                setCustomCourses.append(newDiv)
                mainClose.click()
            }
        }
    }
    else {
        e.preventDefault()
        alert("Can't place more than 9 courses in total on schedule!")
    }
})

let crnClearButtons = document.querySelectorAll(".crnClear")

if (crnClearButtons.length) {
    crnClearButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault()
            let idx = parseInt(btn.id.slice(13))
            let associatedInp = document.querySelector(`#crnInput-${idx}`)
            associatedInp.remove()
            btn.remove()
            totalCount--
        })
    })
}

let courseClearButtons = document.querySelectorAll(".courseClear")

if (courseClearButtons.length) {
    courseClearButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault()
            let idx = parseInt(btn.id.slice(13))
            let associatedInp = document.querySelector(`#courseInput-${idx}`)
            associatedInp.remove()
            btn.remove()
            totalCount--
        })
    })
}

let electiveClearButtons = document.querySelectorAll(".electiveClear")

if (electiveClearButtons.length) {
    electiveClearButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault()
            let idx = parseInt(btn.id.slice(13))
            let associatedInp = document.querySelector(`#select-${idx}`)
            associatedInp.remove()
            btn.remove()
            totalCount--
        })
    })
}

let customDelButtons = document.querySelectorAll(".customClear")

if (customDelButtons.length) {
    customDelButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault()
            let idx = parseInt(btn.id.slice(13))
            let associatedInp = document.querySelector(`#li-${idx}`)
            associatedInp.remove()
            btn.remove()
            let associatedEdit = document.querySelector(`#DeditButton-${idx}`)
            associatedEdit.remove()
            customCourses.splice(idx, 1)
            totalCount--
        })
    })
}

let editButtons = document.querySelectorAll(".editButton")
editButtons.forEach(editButton => {
    editButton.addEventListener("click", () => {
        customIdx = parseInt(editButton.id.slice(9))
        let customCourseObj = customCourses[idx]
        let { Subject, BT1, ET1, CRN, Schedule1 } = customCourseObj
        let P = String(BT1)
        let sM = P.slice(P.length - 2)
        let sH = P.slice(0, P.length - 2)
        if (sH > 12) { sH -= 12; sT = "PM" }
        else sT = "AM"
        let P2 = String(ET1)
        let eM = P2.slice(P2.length - 2)
        let eH = P2.slice(0, P2.length - 2)
        if (eH > 12) { eH -= 12; eT = "PM" }
        else eT = "AM"
        if (sH == 12) sT = "PM"
        if (eH == 12) eT = "PM"
        editTitle.value = Subject
        editsHour.value = sH
        editeHour.value = eH
        editeMinute.value = eM
        editsMinute.value = sM
        if (Schedule1.includes("M")) editcheckMonday.checked = true
        else editcheckMonday.checked = false
        if (Schedule1.includes("T")) editcheckTuesday.checked = true
        else editcheckTuesday.checked = false
        if (Schedule1.includes("W")) editcheckWednesday.checked = true
        else editcheckWednesday.checked = false
        if (Schedule1.includes("R")) editcheckThursday.checked = true
        else editcheckThursday.checked = false
        if (Schedule1.includes("F")) editcheckFriday.checked = true
        else editcheckFriday.checked = false
        if (Schedule1.includes("S")) editcheckSaturday.checked = true
        else editcheckSaturday.checked = false

        if (sT === "PM") { editsPM.selected = true; editsAM.selected = false }
        else { editsPM.selected = false; editsAM.selected = true }
        if (eT === "PM") { editePM.selected = true; editeAM.selected = false }
        else { editePM.selected = false; editeAM.selected = true }
        
    })
})

let order = [customTitle, sHour, sMinute, eHour, eMinute]

for (let j = 0; j < order.length - 1; j++) {
    let inp = order[j]
    inp.addEventListener("keydown", e => {
        if (e.keyCode === 13) { e.preventDefault(); order[j + 1].select() }
    })
}

eMinute.addEventListener("keydown", e => {
    if (e.keyCode === 13) { e.preventDefault(); checkMonday.select() }
})

let checks = [checkMonday, checkTuesday, checkWednesday, checkThursday, checkFriday, checkSaturday]

for (let j = 0; j < checks.length; j++) {
    let check = checks[j]
    check.addEventListener("keydown", e => {
        e.preventDefault()
        if (e.keyCode === 13) check.checked = !check.checked
        if (e.keyCode === 9 && check !== checkSaturday) checks[j + 1].select()
    })
}

let order2 = [editTitle, editsHour, editsMinute, editeHour, editeMinute]

for (let j = 0; j < order.length - 1; j++) {
    let inp = order2[j]
    inp.addEventListener("keydown", e => {
        if (e.keyCode === 13) { e.preventDefault(); order[j + 1].select() }
    })
}

editeMinute.addEventListener("keydown", e => {
    if (e.keyCode === 13) { e.preventDefault(); checkMonday.select() }
})

let checks2 = [editcheckMonday, editcheckTuesday, editcheckWednesday, editcheckThursday, editcheckFriday, editcheckSaturday]

for (let j = 0; j < checks.length; j++) {
    let check = checks2[j]
    check.addEventListener("keydown", e => {
        e.preventDefault()
        if (e.keyCode === 13) check.checked = !check.checked
        if (e.keyCode === 9 && check !== checkSaturday) checks[j + 1].select()
    })
}

checkSaturday.addEventListener("keydown", e => { e.preventDefault(); if (e.keyCode === 13) checkSaturday.checked = !checkSaturday.checked })
editcheckSaturday.addEventListener("keydown", e => { e.preventDefault(); if (e.keyCode === 13) editcheckSaturday.checked = !editcheckSaturday.checked })

document.querySelector("#reset").addEventListener("click", () => {
    let sets = [setCRNs, setCourses, setElectives, setCustomCourses]
    for (let set of sets) {
        set.innerHTML = ""
    }
    customCourses = []
    totalCount = 0
})

document.querySelectorAll(".courseInput").forEach(course => {
    course.addEventListener("keydown", e => {
        if (e.keyCode === 13) {
            e.preventDefault()
            addCourse.click()
            let newerInp = document.querySelector(`#courseInput-${counter2 - 1}`)
            newerInp.select()
        }
    })
})

document.querySelectorAll(".crnInput").forEach(course => {
    course.addEventListener("keydown", e => {
        if (e.keyCode === 13) {
            e.preventDefault()
            addCRN.click()
            let newerInp = document.querySelector(`#crnInput-${counter - 1}`)
            newerInp.select()
        }
    })
})

function updateCustomCourse() {
    Subject = editTitle.value
    sH = editsHour.value
    sM = editsMinute.value
    sT = editsTime.value
    eH = editeHour.value
    eM = editeMinute.value
    eT = editeTime.value
    BT1 = timeToInt(sH + ":" + sM, sT === "PM")
    ET1 = timeToInt(eH + ":" + eM, eT === "PM")
    if (!sM) sM = "00"
    if (!eM) eM = "00"
    if (parseInt(sH) > 12 || parseInt(sH) < 1 || (sT === "AM" && (parseInt(sH) < 7 || parseInt(sH) === 12))) alert("Start hour must be between 7 AM and 11 PM")
    else if (parseInt(sM) < 0 || parseInt(sM) > 59) alert("Start minute must be between 0 and 60")
    else if (parseInt(eH) > 12 || parseInt(eH) < 1 || (eT === "AM" && (parseInt(eH) < 7 || parseInt(eH) === 12))) alert("End hour must be between 7 AM and 11 PM")
    else if (parseInt(eM) < 0 || parseInt(eM) > 59) alert("End minute must be between 0 and 60")
    else if (Subject === "") alert("Need to specify name!")
    else if (sH.length === 0) alert("Must specify Start Hour!")
    else if (eH.length === 0) alert("Must specify End Hour!")
    else if (BT1 > ET1) alert("End time must be less than start time!")
    else if ((ET1 - BT1) < 30) alert("Custom Course must be at least 30 minutes!")

    else {

        days = [editcheckMonday, editcheckTuesday, editcheckWednesday, editcheckThursday, editcheckFriday, editcheckSaturday]
        Schedule1 = ""

        for (let day of days) {
            if (day.checked) {
                if (day.value !== "Thursday") Schedule1 += day.value[0]
                else Schedule1 += "R"
            }
        }
        if (Schedule1.length === 0) alert("Course must be on at least one day!")
        else {
            let { CRN } = customCourses[customIdx]
            let customCourseObj = { Subject, BT1, ET1, Code: "", CRN, LCRN: [], Schedule1, Schedule2: "" }
            console.log(customCourses, customIdx, customCourseObj)
            customCourses[customIdx] = customCourseObj
            let li = document.querySelector(`#li-${customIdx}`)
            li.innerText = `Title: ${Subject}, Time: ${intToTime(BT1)} - ${intToTime(ET1)}, Schedule:${Schedule1}`
            editClose.click()
        }
    }
}

updateButton.addEventListener("click", e => {
    e.preventDefault()
    updateCustomCourse()
})
