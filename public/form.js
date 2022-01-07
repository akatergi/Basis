const addCRN = document.querySelector("#addCRN")
const setCRNs = document.querySelector("#setCRNs")
const setCourses = document.querySelector("#courses")
const addCourse = document.querySelector("#addCourse")

let crnCount = 0
let counter = 0
let counter2 = 0
let courseCount = 0

function getIcon() {
    let i = document.createElement("i")
    i.classList.add("fas", "fa-trash")
    return i
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

