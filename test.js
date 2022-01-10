function areTwoListsDuplicate(L1,L2){
  let dummy1 = [...L1]
  let dummy2 = [...L2]
  
  for (let i of L1){
    for (let j of L2){
      console.log(i,j)
      if (i === j) return false
    }
  }
  return true
}

console.log(areTwoListsDuplicate(["1","2"], ["1", "2"]))