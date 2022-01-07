let route = document.URL.split("/")
let currRoute = route[route.length-1]
let navLink = document.querySelector(`#${currRoute}`)
navLink.classList.add("active")