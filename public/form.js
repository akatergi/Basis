const addCRN = document.querySelector("#addCRN")
const setCRNs = document.querySelector("#setCRNs")
const setCourses = document.querySelector("#courses")
const addCourse = document.querySelector("#addCourse")
const setElectives = document.querySelector("#setElectives")
const addElective = document.querySelector("#addElective")
const next = document.querySelector("#next")
let customCourses = []
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

let crnCount = 0
let counter = 0
let counter2 = 0
let courseCount = 0
let counter3 = 1

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

addCRN.addEventListener('click', e => {
    e.preventDefault();
    if (crnCount < 8) {
        let newInp = document.createElement("input")
        newInp.type = "number"
        newInp.id = `crnInput-${counter}`
        newInp.classList.add(`crnInput`)
        newInp.name = "setCRNs[]"
        newInp.classList.add("form-control", "mt-2")

        let clearButton = document.createElement("a")
        clearButton.id = `clearButton-${counter}`
        clearButton.append(getIcon())
        clearButton.classList.add("clearButton")

        clearButton.addEventListener("click", function (e) {
            e.preventDefault()
            newInp.remove()
            this.remove()
            crnCount--;
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 13) {
                e.preventDefault()
                addCRN.click()
                let newerInp = document.querySelector(`#crnInput-${counter - 1}`)
                newerInp.focus()
                newerInp.select()
            }
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 8 && newInp.value.length === 0) {
                clearButton.click()
                let allInps = document.querySelectorAll(`.crnInput`)
                if (allInps.length) {
                    let lastInp = allInps[allInps.length - 1]
                    lastInp.focus()
                    lastInp.select()
                }
            }
        }
        )

        let newDiv = document.createElement("div")
        newDiv.append(newInp, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setCRNs.append(newDiv)

        crnCount++
        counter++
    }
    else {
        alert("Cannot add more than 8 CRNs!")
    }
})

addCourse.addEventListener('click', e => {
    e.preventDefault();
    if (courseCount < 8) {
        let newInp = document.createElement("input")
        newInp.type = "text"
        newInp.id = `courseInput-${counter2}`
        newInp.classList.add("courseInput")
        newInp.name = "sections[]"
        newInp.classList.add("form-control", "mt-2")

        let clearButton = document.createElement("a")
        clearButton.id = `clearButton-${counter2}`
        clearButton.append(getIcon())
        clearButton.classList.add("clearButton")

        clearButton.addEventListener("click", function (e) {
            e.preventDefault()
            newInp.remove()
            this.remove()
            courseCount--;
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 13) {
                e.preventDefault()
                addCourse.click()
                let newerInp = document.querySelector(`#courseInput-${counter2 - 1}`)
                newerInp.focus()
                newerInp.select()
            }
        })

        newInp.addEventListener("keydown", e => {
            if (e.keyCode === 8 && newInp.value.length === 0) {
                clearButton.click()
                let allInps = document.querySelectorAll(`.courseInput`)
                if (allInps.length) {
                    let lastInp = allInps[allInps.length - 1]
                    lastInp.focus()
                    lastInp.select()
                }
            }
        }
        )

        let newDiv = document.createElement("div")
        newDiv.append(newInp, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setCourses.append(newDiv)

        courseCount++
        counter2++
        return newInp
    }
    else {
        alert("Cannot add more than 8 CRNs!")
    }
})


addElective.addEventListener("click", e => {
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
    clearButton.classList.add("clearButton")

    clearButton.addEventListener("click", function (e) {
        e.preventDefault()
        select.remove()
        this.remove()
    })

    let newDiv = document.createElement("div")
    newDiv.append(select, clearButton)
    newDiv.classList.add("CRNInpGrp")
    setElectives.append(newDiv)
})

next.addEventListener("click", e => {
    let newInp = document.createElement("input")
    newInp.type = "hidden"
    newInp.name = "customCourses"
    newInp.value = JSON.stringify(customCourses)
    setCustomCourses.append(newInp)
})

createCourse.addEventListener("click", () => {
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
    else if (parseInt(sH) < 1 || parseInt(sH) > 12) alert("Start hour must be between 1 and 12")
    else if (parseInt(sM) < 0 || parseInt(sM) > 59) alert("Start minute must be between 0 and 60")
    else if (parseInt(eH) < 1 || parseInt(eH) > 12) alert("End hour must be between 1 and 12")
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
        else {
            let customCourseObj = { Subject, Code: "", CRN, BT1, ET1, Schedule1, LCRN: [], Schedule2: "" }
            customCourses.push(customCourseObj)
            console.log(customCourses)
            let li = document.createElement("li")
            li.classList.add("list-group-item", "form-control", "mt-2")
            li.innerText = `Title: ${Subject}, Time: ${intToTime(BT1)} - ${intToTime(ET1)}, Schedule:${Schedule1}`

            let clearButton = document.createElement("a")
            clearButton.append(getIcon())
            clearButton.classList.add("clearButton")



            let editButton = document.createElement("a")
            editButton.append(getIcon2())
            editButton.setAttribute("data-bs-toggle", "modal")
            editButton.setAttribute("data-bs-target", "#editModal")
            editButton.classList.add("editButton")
            editButton.id = `edit-${CRN}`

            editButton.addEventListener("click", () => {
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

                updateButton.addEventListener("click", () => {
                    let idx = customCourses.indexOf(customCourseObj)
                    Subject = editTitle.value
                    sH = editsHour.value
                    sM = editsMinute.value
                    eH = editeHour.value
                    eM = editeMinute.value
                    if (!sM) sM = "00"
                    if (!eM) eM = "00"
                    BT1 = timeToInt(sH + ":" + sM, sT === "PM")
                    ET1 = timeToInt(eH + ":" + eM, eT === "PM")
                    if (Subject === "") alert("Need to specify name!")
                    else if (sH.length === 0) alert("Must specify Start Hour!")
                    else if (eH.length === 0) alert("Must specify End Hour!")
                    else if (parseInt(sH) < 1 || parseInt(sH) > 12) alert("Start hour must be between 1 and 12")
                    else if (parseInt(sM) < 0 || parseInt(sM) > 59) alert("Start minute must be between 0 and 60")
                    else if (parseInt(eH) < 1 || parseInt(eH) > 12) alert("End hour must be between 1 and 12")
                    else if (parseInt(eM) < 0 || parseInt(eM) > 59) alert("End minute must be between 0 and 60")

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
                            customCourseObj = { Subject, Code: "", CRN: `CUST${counter3}`, BT1, ET1, Schedule1, LCRN: [], Schedule2: "" }
                            customCourses[idx] = customCourseObj
                            li.innerText = `Title: ${Subject}, Time: ${intToTime(BT1)} - ${intToTime(ET1)}, Schedule:${Schedule1}`
                            editClose.click()
                        }
                    }
                })
            })

            clearButton.addEventListener("click", function (e) {
                e.preventDefault()
                li.remove()
                customCourses.splice(customCourses.indexOf(customCourseObj), 1)
                this.remove()
                editButton.remove()
            })

            let newDiv = document.createElement("div")
            newDiv.append(li, editButton, clearButton)
            newDiv.classList.add("CRNInpGrp")
            counter3++
            setCustomCourses.append(newDiv)
            mainClose.click()
        }
    }
})