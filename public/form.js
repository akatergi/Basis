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

        let newDiv = document.createElement("div")
        newDiv.append(newInp, clearButton)
        newDiv.classList.add("CRNInpGrp")
        setCourses.append(newDiv)

        courseCount++
        counter2++
    }
    else {
        alert("Cannot add more than 8 CRNs!")
    }
})

