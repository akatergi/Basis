import { Course } from "./objects.js"
// import request from "request-promise";
// import cheerio from "cheerio";
const request = require("request-promise");
const cheerio = require("cheerio");
async function GetData(L) {
    const result = await request.get(`https://www-banner.aub.edu.lb/catalog/schd_${L}.htm`);
    const $ = cheerio.load(result);
    let A = [];
    $("body > p > table > tbody > tr").each((index, element) => {
      if (index > 4){
        A.push(new Course($($(element).find('td')[0]).text(), $($(element).find('td')[1]).text(), $($(element).find('td')[2]).text(), $($(element).find('td')[3]).text(), $($(element).find('td')[4]).text(), $($(element).find('td')[5]).text(), $($(element).find('td')[6]).text(), $($(element).find('td')[7]).text(), $($(element).find('td')[8]).text(), $($(element).find('td')[9]).text(), $($(element).find('td')[10]).text(), $($(element).find('td')[11]).text(), $($(element).find('td')[12]).text(), $($(element).find('td')[13]).text(), $($(element).find('td')[14]).text(), $($(element).find('td')[15]).text() + $($(element).find('td')[16]).text() + $($(element).find('td')[17]).text() + $($(element).find('td')[18]).text() + $($(element).find('td')[19]).text() + $($(element).find('td')[20]).text() + $($(element).find('td')[21]).text(), $($(element).find('td')[22]).text(), $($(element).find('td')[23]).text(), $($(element).find('td')[24]).text(), $($(element).find('td')[25]).text(), $($(element).find('td')[26]).text() + $($(element).find('td')[27]).text() + $($(element).find('td')[28]).text() + $($(element).find('td')[29]).text() + $($(element).find('td')[30]).text() + $($(element).find('td')[31]).text() + $($(element).find('td')[32]).text(), $($(element).find('td')[33]).text(), $($(element).find('td')[34]).text(), $($(element).find('td')[35]).text(), $($(element).find('td')[36]).text()))
    }});
    return A
  }

export {GetData}