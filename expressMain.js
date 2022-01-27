const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const { getProfessors, searchByCRNs, timeToInt, intToTime, checkIfConflictingArray, getElectiveNames } = require("./public/bobsFolder/Tools")
app.use(express.json());
const { getPermutations } = require("./public/bobsFolder/Main")
const session = require("express-session")
const flash = require("connect-flash")
app.engine("ejs", ejsMate)
const cron = require('node-cron')
const shell = require('shelljs');

cron.schedule("30 36 19 * * *", () => {
  console.log("Hi")
  if (shell.exec('node public\\bobsFolder\\Update.js').code !== 0) {
    shell.exit(1);
  }
  else {
    shell.echo('Database backup complete');
  }
})

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))
let secret = process.env.SECRET || "testsecret"
app.use(session({
  secret: secret,
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
const port = process.env.PORT || 3000
app.use(express.static(__dirname + "/public"));
app.listen(port, () => console.log(`Listening on port ${port}`))

app.get("/", (req, res) => res.redirect("/new"))

app.get("/new", (req, res) => {
  let { Term, setCRNs, sections, electives, customCourses } = req.session
  if (!Term) Term = "202220"
  if (!setCRNs) setCRNs = []
  if (!sections) sections = []
  if (!electives) electives = []
  if (!customCourses) customCourses = []
  res.render("scheduleForm", { Term, setCRNs, sections, electives, customCourses, intToTime })
})

app.post("/filter", async (req, res) => {
  let { Term, setCRNs, sections, electives, customCourses } = req.body
  if (!electives) electives = []
  if (!Term) {
    req.flash("error", "Must enter Term")
    return res.redirect("/new")
  }
  Term = Term.slice(0,6)
  if (!setCRNs) setCRNs = []
  setCRNs = setCRNs.filter(e => e.length !== 0)
  if (!customCourses) customCourses = []
  customCourses = JSON.parse(customCourses)
  req.session.customCourses = customCourses
  if (!sections) sections = []
  sections = sections.filter(e => e.length !== 0)
  req.session.Term = Term
  req.session.setCRNs = setCRNs
  req.session.sections = sections
  req.session.electives = electives

  let electivesArr = []
  for (let elective of electives) {
    electivesArr.push({ CourseName: elective, SeatsFilter: true, ProfessorFilter: [], Elective: true, availableCourses: await getElectiveNames(Term, elective) })
  }

  try {
    var SetSections = await searchByCRNs(Term, [...setCRNs])
    checkIfConflictingArray(SetSections.concat(customCourses), 0, 2400)
  } catch (e) {
    req.flash("error", e.message)
    return res.redirect("/new")
  }

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
  req.session.electivesArr = electivesArr
  res.redirect("/filter")
})

app.get("/filter", async (req, res) => {
  let { Term, SetSections, courses, courses2, electivesArr, customCourses, sHour, sMinute, stime, eHour, eMinute, etime, electivesFinal } = req.session
  if(!electivesFinal) electivesFinal = []
  if (!courses2) courses2 = []
  if (!Term || !SetSections || !courses) {
    req.flash("error", "Missing parameters!")
    return res.redirect("/new")
  }

  if (SetSections.length === 0 && courses.length === 0 && electivesArr.length === 0 && customCourses.length === 0) {
    req.flash("error", "Need at least one course to create schedule!")
    return res.redirect("/new")
  }
  res.render("filterForm", { timeToInt, Term, SetSections, courses, electivesArr, customCourses, sHour, sMinute, stime, eHour, eMinute, etime, courses2, electivesFinal })
})

app.post("/schedules", async (req, res) => {
  let { setSections, sHour, sMinute, stime, eHour, eMinute, etime, Term, courses2, electivesFinal, customCourses } = req.body
  Term = Term.slice(0,6)
  if(!electivesFinal) electivesFinal = []
  if (sMinute.length === 0) sMinute = "00"
  if (eMinute.length === 0) eMinute = "00"
  req.session.sHour = sHour
  req.session.sMinute = sMinute
  req.session.stime = stime
  req.session.eHour = eHour
  req.session.eMinute = eMinute
  req.session.etime = etime
  if (!courses2) courses2 = []
  
  for (let i in courses2) {
    if (courses2[i].SeatsFilter === "true") courses2[i].SeatsFilter = true;
    else courses2[i].SeatsFilter = false;
    if (!courses2[i].ProfessorFilter) courses2[i].ProfessorFilter = []
    courses2[i].Elective = false
  }
  try{
    var throwError = false
    electivesFinal.forEach(elective => {
      elective.SeatsFilter ? elective.SeatsFilter = true : elective.SeatsFilter = false
      elective.ProfessorFilter = []
      elective.Elective = true
      if(!elective.courseFilter) {elective.courseFilter=[]; throwError = true}
    })
    req.session.electivesFinal = electivesFinal
    if(throwError) throw new Error("Must select at least one course for chosen electives!")
  } catch(err){
    req.flash("error", err.message)
    return res.redirect("/filter")
  }

  req.session.courses2 = courses2
  let PStartTime, PEndTime;
  if (sHour === "") PStartTime = null
  else PStartTime = timeToInt(sHour + ":" + sMinute, stime === "PM")

  if (eHour === "") PEndTime = null
  else PEndTime = timeToInt(eHour + ":" + eMinute, etime === "PM")

  setSections = JSON.parse(setSections)
  customCourses = JSON.parse(customCourses)
  let CustomSections = customCourses
  courses2 = courses2.concat(electivesFinal)
  try { 
    var Schedules = await getPermutations(Term, setSections, CustomSections, courses2, PStartTime, PEndTime)
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

app.get("/about", (req, res) => res.render("about"))