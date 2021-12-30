const express = require("express")
const app = express()
const path = require("path")
const request = require("request-promise");
const cheerio = require("cheerio");
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

app.get("/filter", (req, res) => {
  console.log(req.query)
  res.send("test")
})

app.get("/schedules", (req, res) => {
  let { Schedules } = require("./Schedules")
  res.render("index.ejs", { Schedules })
})