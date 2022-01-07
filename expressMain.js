const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const { getProfessors, searchByCRNs, timeToInt, checkIfConflictingArray } = require("./public/bobsFolder/Tools")
app.use(express.json());
const { getPermutations } = require("./public/bobsFolder/Main")
const session = require("express-session")
const flash = require("connect-flash")
const e = require("connect-flash")

app.engine("ejs", ejsMate)

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: `s_'mfWntka+d]&>F>[cS(/j]r"[8cWUQs<P~`,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7
  }
}))

app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = req.flash("error")
  next()
})

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

app.get("/", (req, res) => res.redirect("/new"))

app.get("/new", (req, res) => {
  res.render("scheduleForm")
})

app.post("/filter", async (req, res) => {
  let { Term, setCRNs, sections, electives} = req.body
  if(!electives) electives = []
  let electivesArr = []
  for(let elective of electives){
    electivesArr.push({CourseName:elective, SeatsFilter: true, ProfessorFilter:[], Elective:true})
  }
  
  if (!setCRNs) setCRNs = []
  try {
    var SetSections = await searchByCRNs(Term, setCRNs)
    checkIfConflictingArray(SetSections,0,2400)
  } catch (e) {
    req.flash("error", e.message)
    return res.redirect("/new")
  }
  if (!sections) sections = []
  let courses = []
  for (let i = 0; i < sections.length; i++) {
    sections[i] = sections[i].toUpperCase().replace(/\s/g, '')
    let sec = sections[i]
    try {
      var profs = await getProfessors(Term, sec.slice(0, 4), sec.slice(4));
    } catch (e) {
      req.flash("error", e.message)
      return res.redirect("/new")
    }
    courses.push({ CourseName: sec, Professors: profs })
  }
  req.session.SetSections = SetSections;
  req.session.courses = courses;
  req.session.Term = Term
  req.session.electivesArr = electivesArr
  res.redirect("/filter")
})

app.get("/filter", async (req, res) => {
  let { Term, SetSections, courses, electivesArr } = req.session
  if (!Term || !SetSections || !courses) {
    req.flash("error", "Missing parameters!")
    return res.redirect("/new")
  }

  if (SetSections.length === 0 && courses.length === 0 && electivesArr.length===0) {
    req.flash("error", "Need at least one course to create schedule!")
    return res.redirect("/new")
  }
  res.render("filterForm", { Term, SetSections, courses, electivesArr })
})

app.post("/schedules", async (req, res) => {
  let { setSections, sHour, sMinute, stime, eHour, eMinute, etime, Term, courses, electivesArr } = req.body
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
    if (!course.ProfessorFilter) course.ProfessorFilter = []
    course.Elective = false
  }
  courses = courses.concat(JSON.parse(electivesArr))

  try {
    var Schedules = await getPermutations(Term, setSections, CustomSections, courses, PStartTime, PEndTime)
  } catch (err) {
    req.flash("error", err.message)
    return res.redirect("/filter")
  }
  req.session.Schedules = Schedules
  res.redirect("/schedules")
})

app.get("/schedules", (req, res) => {
  if (!req.session.Schedules) {
    req.flash("error", "Something went wrong")
    return res.redirect("/filter")
  }
  else {
    let Schedules = req.session.Schedules
    res.render("index.ejs", { Schedules })
  }
})

app.get("/test", (req, res) => res.send("hi"))