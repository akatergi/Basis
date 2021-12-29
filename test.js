const lettersConst = ["A", "B", "C", "D", "E", "F", "G"]
let letters = ["A", "B", "C", "D", "E", "F", "G"]

function x() {
    if (letters.length) return letters.splice(Math.floor(Math.random() * letters.length), 1)[0]
    else {
        letters = lettersConst
        return letters.splice(Math.floor(Math.random() * letters.length), 1)[0]
    }
}

for (let i = 0; i < 10; i++) {
    console.log(x())
    console.log(letters)
}
