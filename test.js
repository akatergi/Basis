const { max } = require("mathjs")

const L = [1,4,6,3,7,8]

console.log(L.reduce((x,y) => max(x,y)))