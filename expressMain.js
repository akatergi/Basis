const express = require("express")
const app = express()
const path = require("path")
const request = require("request-promise");
const cheerio = require("cheerio");
const {Course} = require("./public/objects")
app.use(express.json());

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

// app.use(e => console.log(e))

app.get("/",(req,res)=>{
    res.render("index.ejs")
})
