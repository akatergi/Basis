const express = require("express")
const app = express()
const path = require("path")
const request = require("request-promise");
const cheerio = require("cheerio");
app.use(express.json());

app.use(express.static(__dirname + "/public"));
app.listen(3000, () => console.log("Listening on port 3000"))

// app.use(e => console.log(e))

app.get("/",(req,res)=>{
    const Course = require("./public/objects")

    async function GetData(L) {
        const result = await request.get(`https://www-banner.aub.edu.lb/catalog/schd_${L}.htm`);
        const $ = cheerio.load(result);
        let A = [];
        $("body > p > table > tbody > tr").each((index, element) => {
            if (index > 4) {
                A.push(new Course.Course($($(element).find('td')[0]).text(), $($(element).find('td')[1]).text(), $($(element).find('td')[2]).text(), $($(element).find('td')[3]).text(), $($(element).find('td')[4]).text(), $($(element).find('td')[5]).text(), $($(element).find('td')[6]).text(), $($(element).find('td')[7]).text(), $($(element).find('td')[8]).text(), $($(element).find('td')[9]).text(), $($(element).find('td')[10]).text(), $($(element).find('td')[11]).text(), $($(element).find('td')[12]).text(), $($(element).find('td')[13]).text(), $($(element).find('td')[14]).text(), $($(element).find('td')[15]).text() + $($(element).find('td')[16]).text() + $($(element).find('td')[17]).text() + $($(element).find('td')[18]).text() + $($(element).find('td')[19]).text() + $($(element).find('td')[20]).text() + $($(element).find('td')[21]).text(), $($(element).find('td')[22]).text(), $($(element).find('td')[23]).text(), $($(element).find('td')[24]).text(), $($(element).find('td')[25]).text(), $($(element).find('td')[26]).text() + $($(element).find('td')[27]).text() + $($(element).find('td')[28]).text() + $($(element).find('td')[29]).text() + $($(element).find('td')[30]).text() + $($(element).find('td')[31]).text() + $($(element).find('td')[32]).text(), $($(element).find('td')[33]).text(), $($(element).find('td')[34]).text(), $($(element).find('td')[35]).text(), $($(element).find('td')[36]).text()))
            }
        });
        return A
    }
    
    GetData("F").then(E=>console.log(E))
    res.render("index.ejs")
})

app.get("/dog", (req, res) => {
    res.json({
        bob:10,
        adel:10,
        ben:{
            age:14,
            name:"ben"
        }
    })
})