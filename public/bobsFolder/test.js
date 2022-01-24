let { readCRNs } = require("./Tools");


async function test() {
  let Buildings = []
  let CRNs = await readCRNs("202220");
  for (let CRN in CRNs){
    let Building = CRNs[CRN].Buil1
    if (!(Building == ".") && !Buildings.includes(Building)){
      Buildings.push(Building)}
  }
  Buildings.sort((x,y) => x.localeCompare(y))
  console.log(Buildings.map(x => "'" + x + "'").join("\n"))
}
test();