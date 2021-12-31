const express = require("express")
const app = express()
const path = require("path")
const request = require("request-promise");
const cheerio = require("cheerio");
const {GetProfs} = require("./public/Tools")
app.use(express.json());

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

app.get("/new", (req, res) => {
  res.render("scheduleForm")

})

app.get("/filter", async (req, res) => {
  let {Term, setCRNs, sections} = req.query
  if(!setCRNs) setCRNs = []
  console.log(setCRNs)
  let courses = []
  for(let section of sections){
    let profs = await GetProfs(Term, section.slice(0,4), section.slice(4,section.length));
    courses.push({CourseName:section, Professors:profs})
  }
  res.render("filterForm",{Term, setCRNs, courses})
})

app.get("/schedules", (req, res) => {
  let { Schedules } = require("./Schedules")
  res.render("index.ejs", { Schedules })
})

app.get("/test", (req,res) => {
  console.log(req.query)
  res.send("hi")
})