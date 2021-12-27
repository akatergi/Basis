const express = require("express")
const app = express()
const path = require("path")
const request = require("request-promise");
const cheerio = require("cheerio");
const { Course, GetPermutations } = require("./public/bobsCode")
app.use(express.json());

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

app.post("/schedules", (req, res) => {
    let Schedules = "Schedules"
    res.redirect("/schedules")
})

app.get("/", (req,res)=>{
    res.render("scheduleForm")
})

app.get("/schedules", (req, res) => {
    // const scheduleConfig = req.query.scheduleConfig
    // const Schedules = scheduleConfig
    let Schedules = [[
        {
          Term: 'Spring 2021-2022',
          CRN: '21186',
          Subject: 'EECE',
          Code: '338',
          Section: '1',
          Title: 'Theory of Computation',
          CH: 3,
          BH: 3,
          College: 'EA',
          SeatsT: 15,
          SeatsA: 25,
          BT1: 1100,
          ET1: 1215,
          Buil1: 'BECHTA',
          R1: '111',
          Schedule1: 'TR',
          BT2: null,
          ET2: null,
          Buil2: '.',
          R2: '.',
          Schedule2: '',
          IName: 'Louay',
          ISName: 'Bazzi',
          LCRN: [ '' ],
          LinkedSections: []
        },
        {
          Term: 'Spring 2021-2022',
          CRN: '20913',
          Subject: 'CVSP',
          Code: '202',
          Section: '4',
          Title: 'Medieval,Islamic& Renais.civil',
          CH: 3,
          BH: 3,
          College: 'AS',
          SeatsT: 23,
          SeatsA: 0,
          BT1: 930,
          ET1: 1045,
          Buil1: 'NICELY',
          R1: '101',
          Schedule1: 'TR',
          BT2: null,
          ET2: null,
          Buil2: '.',
          R2: '.',
          Schedule2: '',
          IName: 'Tony',
          ISName: 'Nasrallah',
          LCRN: [ '' ],
          LinkedSections: []
        }
      ]]
    res.render("index.ejs", { Schedules })
})

app.post("/:CRN", (req, res) => {
    const { CRN } = req.params;
    console.log(CRN);
    res.redirect("/")
})