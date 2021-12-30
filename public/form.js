const addCRN = document.querySelector("#addCRN")
const setCRNs = document.querySelector("#setCRNs")

addCRN.addEventListener('click', e => {
    e.preventDefault();
    let newInp = document.createElement("input")
    newInp.type = "number"
    newInp.name = "setCRNs[]"
    setCRNs.append(newInp)
})