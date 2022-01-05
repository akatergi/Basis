const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const { getProfessors, searchByCRNs, timeToInt } = require("./public/bobsFolder/Tools")
app.use(express.json());
const { GetPermutations } = require("./public/bobsFolder/Main")
const session = require("express-session")
app.engine("ejs", ejsMate)

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: "1234", resave: false, saveUninitialized: false
}))

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

app.get("/", (req, res) => res.redirect("/new"))

app.get("/new", (req, res) => {
  res.render("scheduleForm")
})



app.get("/filter", async (req, res) => {
  let { Term, setCRNs, sections } = req.query
  if (!setCRNs) setCRNs = []
  let SetSections = await searchByCRNs(Term, setCRNs)
  if (!sections) sections = []
  let courses = []
  for (let i = 0; i < sections.length; i++) {
    sections[i] = sections[i].toUpperCase().replace(" ", "")
    let sec = sections[i]
    let profs = await getProfessors(Term, sec.slice(0, 4), sec.slice(4));
    courses.push({ CourseName: sec, Professors: profs })
  }
  res.render("filterForm", { Term, SetSections, courses })
})

app.post("/schedules", async (req, res) => {
  let { setSections, sHour, sMinute, stime, eHour, eMinute, etime, Term, courses } = req.body
  Term = "202220"
  let PStartTime, PEndTime;
  if (sHour === "") PStartTime = null
  else PStartTime = timeToInt(sHour + ":" + sMinute, stime === "PM")
  if (eHour === "") PEndTime = null
  else PEndTime = timeToInt(eHour + ":" + eMinute, etime === "PM")

  let CustomSections = []
  setSections = JSON.parse(setSections)

  if (!courses) courses = []
  for (let course of courses) {
    if (course.SeatsFilter === "true") course.SeatsFilter = true;
    else course.SeatsFilter = false;
  }
  var Schedules
  try{
    Schedules = await GetPermutations(Term, setSections, CustomSections, courses, PStartTime, PEndTime)
  } catch(err) {
    return res.send(err.message)
  }
  req.session.Schedules = Schedules
  res.redirect("/schedules")
})

app.get("/schedules", (req, res) => {
  if (!req.session.Schedules) res.send("error")
  else {
    let Schedules = req.session.Schedules
    res.render("index.ejs", { Schedules })
  }
})

app.get("/test", (req, res) => res.send("hi"))