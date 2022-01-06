`<span class='blockTitle'> ${course.Subject + " " + course.Code}</span> <small class='blockSub'> ${startHour + ":" + (startMin < 10 ? `0${startMin}` : startMin) + "-" + endHour + ":" + (endMin < 10 ? `0${endMin}` : endMin)} </small>`

let span = document.createElement("span")
span.classList.add("blockTitle")
span.innerText = course.Subject + " " + course.Code
let small = document.createElement("small")
small.classList.add("blockSub")
small.classList.innerText = `${startHour + ":" + (startMin < 10 ? `0${startMin}` : startMin) + "-" + endHour + ":" + (endMin < 10 ? `0${endMin}` : endMin)}`
courseBlock.append(span, small)