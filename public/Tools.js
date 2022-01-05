const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const { max } = require("lodash");

function OverLap(S1,F1,S2,F2){
  return S1 < F2 && S2 < F1
}
module.exports.OverLap = OverLap

function HasLab(Section){
  return Section.Schedule2 != ""
}
module.exports.HasLab = HasLab

function IsLinked(Section){
  return Section.LCRN[0] != ""
}
module.exports.IsLinked = IsLinked

function IsRecitation(Section){
  return !isNumberorL(Section.Section)
}
module.exports.IsRecitation = IsRecitation

function UpdateJSONs(){
  for (let L of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") WriteJSONFileL(L)
}
module.exports.UpdateJSONs = UpdateJSONs

function CheckSectionWithFilters(Section, SeatsFilter, ProfsFilter, PStartTime, PEndTime){
  return ((!SeatsFilter || Section.SeatsA > 0) && (IsRecitation(Section) || ProfsFilter.includes(Section.IName+" "+Section.ISName)) && (PStartTime == null || Section.BT1 >= PStartTime) && (PEndTime == null || Section.ET1 <= PEndTime) && (PEndTime == null || !HasLab(Section) || Section.ET2 <= PEndTime))
}
module.exports.CheckSectionWithFilters = CheckSectionWithFilters

function CheckIfConflictingArray(Sections, PBT, PET){
  for (let i = 0; i < Sections.length - 1; i++){
    if (Sections[i].BT1 < PBT && PBT != null) throw new Error(`Section: ${Sections[i].Subject + Sections[i].Code + "-" + Sections[i].Section + "(" + Sections[i].CRN + ")"} starts before ${IntToTime(PBT)}`)
    if (Sections[i].ET1 > PET && PET != null) throw new Error(`Section: ${Sections[i].Subject + Sections[i].Code + "-" + Sections[i].Section + "(" + Sections[i].CRN + ")"} starts after ${IntToTime(PET)}`)
    if (HasLab(Sections[i]) && PET != null && PET < Sections[i].ET2) throw new Error(`Lab of Section: ${Sections[i].Subject + Sections[i].Code + "-" + Sections[i].Section + "(" + Sections[i].CRN + ")"} starts before ${IntToTime(PET)}`)
    if (!Check(Sections.slice(0,i), Sections[i])) throw new Error("Given CRNs are conflicting")
  }
}
module.exports.CheckIfConflictingArray = CheckIfConflictingArray

function Swap(Arr, index1, index2){
  if (index1 == index2) return
  let temp = Arr[index1]
  Arr[index1] = Arr[index2]
  Arr[index2] = temp
}
module.exports.Swap = Swap

function GetMinTime(Section, MinTime, Recitation = {BT1: 2400}){
  let min = Math.min(Section.BT1, Recitation.BT1)
  if (min < MinTime) MinTime = min
  if (HasLab(Section) && Section.BT2 < MinTime) MinTime = Section.BT2
  return MinTime
}
module.exports.GetMinTime = GetMinTime

function GetMaxTime(Section, MaxTime, Recitation = {ET1: 0}){
  let max = Math.max(Section.ET1, Recitation.ET1)
  if (max > MaxTime) MaxTime = max
  if (HasLab(Section) && Section.ET2 > MaxTime) MaxTime = Section.ET2
  return MaxTime
}
module.exports.GetMaxTime = GetMaxTime

const colorsConst = ["#FF370A", "#0AFF37", "#F8FF00", "#2AB7CA", "#AD00FF", "#FAD9C1", "#FEB2A8", "#FFFF64", "#FF00CE", "#0090FF", "#00FFFD", "#B5FF00", "#FFAAA5", "#FF9A91", "#65C3BA"]
let colors = ["#FF370A", "#0AFF37", "#F8FF00", "#2AB7CA", "#AD00FF", "#FAD9C1", "#FEB2A8", "#FFFF64", "#FF00CE", "#0090FF", "#00FFFD", "#B5FF00", "#FFAAA5", "#FF9A91", "#65C3BA"]

function GetColor() {
  if (colors.length) return colors.splice(Math.floor(Math.random() * colors.length), 1)[0]
  else {
      colors = colorsConst
      return colors.splice(Math.floor(Math.random() * colors.length), 1)[0]
  }
}
module.exports.GetColor = GetColor

function GetDayDif(DO){
  let min = DO[0]
  let max = DO[0]
  for (let i of DO){
    if (i < min) min = i
    if (i > max) max = i
  }
  return max - min
}
module.exports.GetDayDif = GetDayDif

function IntersectingDays(S1, S2){
  for (let Day1 of S1){
    for (let Day2 of S2){
      if (Day1 === Day2) return true
    }
  }
  return false
}
module.exports.IntersectingDays = IntersectingDays

function compare(a,b){ // returns true if a < b lexographically
  for (let i = 0; i < Math.max(a.length, b.length); i++){
    let x = a.charCodeAt(i)
    let y = b.charCodeAt(i)
    if (x === y)continue
    else if (x < y)return true
    else if (x > y)return false
    else return a.length < b.length
  }
}
module.exports.compare = compare

function Check(ArrayOfSections, Section){
  for (let CurrentSection of ArrayOfSections){
    if (IntersectingDays(CurrentSection.Schedule1, Section.Schedule1) && OverLap(CurrentSection.BT1,CurrentSection.ET1,Section.BT1,Section.ET1)) return false
    if (!HasLab(ArrayOfSections) && HasLab(Section) && IntersectingDays(CurrentSection.Schedule1, Section.Schedule2) && OverLap(CurrentSection.BT1,CurrentSection.ET1,Section.BT2,Section.ET2)) return false
    if (HasLab(ArrayOfSections) && HasLab(Section) && IntersectingDays(CurrentSection.Schedule2, Section.Schedule2) && OverLap(CurrentSection.BT2,CurrentSection.ET2,Section.BT2,Section.ET2)) return false
    if (HasLab(ArrayOfSections) && HasLab(Section) && IntersectingDays(CurrentSection.Schedule2, Section.Schedule2) && OverLap(CurrentSection.BT2,CurrentSection.ET2,Section.BT2,Section.ET2)) return false
  }
  return true
}
module.exports.Check = Check

async function WriteJSONFileL(L){
  let AllCoursesOfLetterL = await GetData(L)
  fs.writeFileSync("./JSON Files/" + L + ".json", JSON.stringify(AllCoursesOfLetterL))
}
module.exports.WriteJSONFileL = WriteJSONFileL

async function ReadJSONFile(L){
  let path = "./JSON Files/" + L + ".json"
  if (!fs.existsSync(path)) await WriteJSONFileL(L)
  return JSON.parse(fs.readFileSync(path))
}
module.exports.ReadJSONFile = ReadJSONFile

async function GetProfs(Term, CourseSubject, CourseCode){
  let Sections = await GetOneCourseWithNoFilter(Term, CourseSubject, CourseCode)
  let ListOfProfs = []
  for (let Section of Sections){
    let Professor = Section.IName + " " + Section.ISName
    if (!ListOfProfs.includes(Professor) && !(IsRecitation(Section))) ListOfProfs.push(Professor)
  }
  return ListOfProfs
}
module.exports.GetProfs = GetProfs

function CodeToTerm(Code){
  let Year = Code.slice(0,4)
  let Term = Code.slice(4,6)
  if (Term == "10") Term = "Fall"
  else if (Term == "20") Term = "Spring"
  else Term = "Summer"
  return [Term, Year]
}
module.exports.CodeToTerm = CodeToTerm

function IntToTime(I){
  let S = String(I)
  let n = S.length
  let Minutes = S.slice(n-2,n)
  let Hours = S.slice(0,n-2)
  if (Hours == "12") return Hours + ":" + Minutes + " PM"
  else if (I < 1200) return Hours + ":" + Minutes + " AM"
  else return String(parseInt(Hours) - 12) + ":" + Minutes + " PM"
}
module.exports.IntToTime = IntToTime

function isNumberorL(N){
  for (let digit of N){
    digitIsNumber = false
    for (let number of "1234567890L"){
      if (digit == number){
        digitIsNumber = true
        continue
      }
    }
    if (!digitIsNumber) return false
  }
  return true
}
module.exports.isNumberorL = isNumberorL

async function GetData(L){ // Web Scraping
  const result = await request.get(`https://www-banner.aub.edu.lb/catalog/schd_${L}.htm`)
  const $ = cheerio.load(result)
  let AllCoursesOfLetterL = [null,[]]
  let Found = false
  $("body > p > table > tbody > tr").each((index, element) => {
    if (index > 4){
      if ($($(element).find('td')[0]).text().slice(0,4) != "Fall"){
        if (!Found){
          Found = true
          AllCoursesOfLetterL[0] = index - 5
        }
      }
      AllCoursesOfLetterL[1].push(new Course($($(element).find('td')[0]).text(), $($(element).find('td')[1]).text(), $($(element).find('td')[2]).text(), $($(element).find('td')[3]).text(), $($(element).find('td')[4]).text(), $($(element).find('td')[5]).text(), $($(element).find('td')[6]).text(), $($(element).find('td')[7]).text(), $($(element).find('td')[8]).text(), $($(element).find('td')[9]).text(), $($(element).find('td')[10]).text(), $($(element).find('td')[11]).text(), $($(element).find('td')[12]).text(), $($(element).find('td')[13]).text(), $($(element).find('td')[14]).text(), $($(element).find('td')[15]).text() + $($(element).find('td')[16]).text() + $($(element).find('td')[17]).text() + $($(element).find('td')[18]).text() + $($(element).find('td')[19]).text() + $($(element).find('td')[20]).text() + $($(element).find('td')[21]).text(), $($(element).find('td')[22]).text(), $($(element).find('td')[23]).text(), $($(element).find('td')[24]).text(), $($(element).find('td')[25]).text(), $($(element).find('td')[26]).text() + $($(element).find('td')[27]).text() + $($(element).find('td')[28]).text() + $($(element).find('td')[29]).text() + $($(element).find('td')[30]).text() + $($(element).find('td')[31]).text() + $($(element).find('td')[32]).text(), $($(element).find('td')[33]).text(), $($(element).find('td')[34]).text(), $($(element).find('td')[35]).text(), $($(element).find('td')[36]).text()))
  }})
  return AllCoursesOfLetterL
}
module.exports.GetData = GetData

async function SearchByCRNs(Term, CRNs){
  for (let CRN of CRNs){
    if (CRN.length != 5) throw new Error(`CRN: ${CRN} does not exist, must be of length 5`)
    if (CRN[0] != Term[4]) throw new Error(`CRN: ${CRN} does not exist whithin the ${CodeToTerm(Term)[0]} term`)
  }

  let n = CRNs.length
  if (n == 0) return []
  let TermIsFall = (CodeToTerm(Term)[0] == "Fall")
  let SectionsToReturn = []
  for (let L of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){
    let data = await ReadJSONFile(L)
    let FirstSpringCRN = data[0]
    let AllCoursesOfLetterL = data[1]
    for (let index = (TermIsFall ? 0 : FirstSpringCRN); index < (TermIsFall ? FirstSpringCRN : AllCoursesOfLetterL.length); index++){
      let Section = AllCoursesOfLetterL[index]
      for (let i = 0 ; i < CRNs.length ; i++){
        if (Section.CRN === CRNs[i]){
          CRNs.splice(i,1)
          if (Section.BT1 == null || Section.ET1 == null) throw new Error(`Section of CRN: ${Section.CRN} has no Begin and End Time`)
          SectionsToReturn.push(Section)
          if (SectionsToReturn.length == n) return SectionsToReturn
        }
      }
    }
  }
  throw new Error(`${CRNs + ((CRNs.length == 1) ? "does":"do")} not exist`)
}
module.exports.SearchByCRNs = SearchByCRNs

async function SearchACRNOnline(Term, CRN){
  const result = await request.get(`https://www-banner.aub.edu.lb/pls/weba/bwckschd.p_disp_detail_sched?term_in=${Term}&crn_in=${CRN}`)
  const $ = cheerio.load(result)
    try{
      let CourseName = $("th").text().split(" - ")[2].split(" ")
      let CourseSubject = CourseName[0]
      let CourseCode = CourseName[1]
      let AllCoursesOfLetterL = await GetOneCourseWithNoFilter(Term, CourseSubject, CourseCode)
      for (let Courses of AllCoursesOfLetterL){
        if (Courses.CRN == CRN) return Courses
      }}
  catch(e){
    throw new Error("CRN does not exist whithin this Term");
  }
}
module.exports.SearchACRNOnline = SearchACRNOnline

async function GetOneCourseWithNoFilter(Term, CourseSubject, CourseCode){
  let SectionsToReturn = []
  let L = CourseSubject[0]
  let data = await ReadJSONFile(L)
  let MidCRN = data[0]
  let AllCoursesOfLetterL = data[1]
  let TermIsFall = (CodeToTerm(Term)[0] == "Fall")
  let n = AllCoursesOfLetterL.length
  let index = BinarySearch(Term, AllCoursesOfLetterL, CourseSubject, CourseCode, (TermIsFall ? 0:MidCRN), (TermIsFall ? MidCRN:n))
  while (index >= 0 && AllCoursesOfLetterL[index].Code === CourseCode) index--
  while (index < n - 1 && AllCoursesOfLetterL[++index].Code === CourseCode) SectionsToReturn.push(AllCoursesOfLetterL[index])
  return SectionsToReturn
}
module.exports.GetOneCourseWithNoFilter = GetOneCourseWithNoFilter

function GetDayOccurences(Section, Days, Recitation = {Schedule1: ""}){
  let Occurences = []
  for (let Day of Days) Occurences.push(Day)
  for (let Day of Section.Schedule1){
    if (Day == "M") Occurences[0]++
    else if (Day == "T") Occurences[1]++
    else if (Day == "W") Occurences[2]++
    else if (Day == "R") Occurences[3]++
    else if (Day == "F") Occurences[4]++
    else if (Day == "S") Occurences[5]++
  }
  for (let Day of Recitation.Schedule1){
    if (Day == "M") Occurences[0]++
    else if (Day == "T") Occurences[1]++
    else if (Day == "W") Occurences[2]++
    else if (Day == "R") Occurences[3]++
    else if (Day == "F") Occurences[4]++
    else if (Day == "S") Occurences[5]++
  }
  if (HasLab(Section)){
    for (let Day of Section.Schedule2){
      if (Day == "M") Occurences[0]++
      else if (Day == "T") Occurences[1]++
      else if (Day == "W") Occurences[2]++
      else if (Day == "R") Occurences[3]++
      else if (Day == "F") Occurences[4]++
      else if (Day == "S") Occurences[5]++
  }}
  return Occurences
}
module.exports.GetDayOccurences = GetDayOccurences

function BinarySearch(Term, AllCoursesOfLetterL, CourseSubject, CourseCode, low, high){
  let oldMid = -1
  while (true){
    oldMid = mid
    var mid = parseInt((high + low)/2)
    if (oldMid === mid) throw new Error(`Course section for\n${CourseSubject + CourseCode} has not been found in this semester!`)
    let SectionAtMid = AllCoursesOfLetterL[mid]
    if (SectionAtMid.Term === Term){
      if (SectionAtMid.Subject === CourseSubject){
        if (SectionAtMid.Code === CourseCode) return mid
        else{
          if (compare(SectionAtMid.Code, CourseCode)) low = mid
          else high = mid
        }
      }
      else{
        if (compare(SectionAtMid.Subject, CourseSubject)) low = mid
        else high = mid
      }
    }
    else{
      if (CodeToTerm(Term)[1] != CodeToTerm(SectionAtMid.Term)[1]) throw new Error(`Searching in Old Term.\nCurrent Term: ${String(parseInt(CodeToTerm(SectionAtMid.Term)[1])-1)} - ${CodeToTerm(SectionAtMid.Term)[1]}\nSearched Term: ${String(parseInt(CodeToTerm(Term)[1])-1)} - ${CodeToTerm(Term)[1]}`)
      let TermName = CodeToTerm(Term)[0]
      let SectionTerm = CodeToTerm(SectionAtMid.Term)[0]
      if (TermName === "Fall") high = mid
      else if (TermName === "Spring"){
        if (SectionTerm === "Fall") low = mid
        else high = mid // if SectionTerm === "Summer"
      }
      else low = mid // If TermName === "Summer" then if our TermName is wrong then just finish search
    }
  }
}
module.exports.BinarySearch = BinarySearch

function TimeToInt(Time, PM){// 09:30
  Time = Time.split(":")
  let Hours = Time[0]
  let Mins = Time[1]
  return parseInt(Hours)*100 + parseInt(Mins) + ((Hours != "12" && PM == true) ? 1200:0)
}
module.exports.TimeToInt = TimeToInt

class Course {
  constructor(Term, CRN, Subject, Code, Section, Title, CH, BH, College, SeatsT, SeatsA, BT1, ET1, Buil1, R1, Schedule1, BT2, ET2, Buil2, R2, Schedule2, IName, ISName, LCRN) {
    this.Term = Term.slice(Term.length-7,Term.length-1)
    this.CRN = CRN
    this.Subject = Subject
    this.Code = Code
    this.Section = Section
    this.Title = Title
    this.CH = parseInt(CH)
    this.BH = parseInt(BH)
    this.College = College
    this.SeatsT = parseInt(SeatsT)
    this.SeatsA = parseInt(SeatsA)
    this.BT1 = parseInt(BT1)
    this.ET1 = parseInt(ET1)
    this.Buil1 = Buil1
    this.R1 = R1
    this.Schedule1 = Schedule1.replaceAll(".", "")
    this.BT2 = parseInt(BT2)
    this.ET2 = parseInt(ET2)
    this.Buil2 = Buil2
    this.R2 = R2
    this.Schedule2 = Schedule2.replaceAll(".", "")
    this.IName = IName
    this.ISName = ISName
    this.LCRN = LCRN.split(", or ")
    this.LinkedSections = []
    this.Color = null
    }
  }
module.exports.Course = Course