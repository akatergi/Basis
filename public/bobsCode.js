const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs")

class Course {
  constructor(Term, CRN, Subject, Code, Section, Title, CH, BH, College, SeatsT, SeatsA, BT1, ET1, Buil1, R1, Schedule1, BT2, ET2, Buil2, R2, Schedule2, IName, ISName, LCRN) {
    this.Term = Term.slice(0,Term.length-8)
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
    }
  }

async function GetData(L) {
  const result = await request.get(`https://www-banner.aub.edu.lb/catalog/schd_${L}.htm`)
  const $ = cheerio.load(result)
  let A = []
  $("body > p > table > tbody > tr").each((index, element) => {
    if (index > 4){
      A.push(new Course($($(element).find('td')[0]).text(), $($(element).find('td')[1]).text(), $($(element).find('td')[2]).text(), $($(element).find('td')[3]).text(), $($(element).find('td')[4]).text(), $($(element).find('td')[5]).text(), $($(element).find('td')[6]).text(), $($(element).find('td')[7]).text(), $($(element).find('td')[8]).text(), $($(element).find('td')[9]).text(), $($(element).find('td')[10]).text(), $($(element).find('td')[11]).text(), $($(element).find('td')[12]).text(), $($(element).find('td')[13]).text(), $($(element).find('td')[14]).text(), $($(element).find('td')[15]).text() + $($(element).find('td')[16]).text() + $($(element).find('td')[17]).text() + $($(element).find('td')[18]).text() + $($(element).find('td')[19]).text() + $($(element).find('td')[20]).text() + $($(element).find('td')[21]).text(), $($(element).find('td')[22]).text(), $($(element).find('td')[23]).text(), $($(element).find('td')[24]).text(), $($(element).find('td')[25]).text(), $($(element).find('td')[26]).text() + $($(element).find('td')[27]).text() + $($(element).find('td')[28]).text() + $($(element).find('td')[29]).text() + $($(element).find('td')[30]).text() + $($(element).find('td')[31]).text() + $($(element).find('td')[32]).text(), $($(element).find('td')[33]).text(), $($(element).find('td')[34]).text(), $($(element).find('td')[35]).text(), $($(element).find('td')[36]).text()))
  }})
  return A
}

function compare(a,b){ // returns true if a < b
  for (let i = 0; i < 4; i++){
    let x = a.charCodeAt(i)
    let y = b.charCodeAt(i)
    if (x === y){
      continue
    }
    else if (x < y){
      return true
    }
    else{
      return false
    }
  }
}

async function WriteJ(L){
  let A = await GetData(L)
  var json = JSON.stringify(A);
  fs.writeFileSync(L + ".json", json)
}
//gets all sections of a certain list of same letter courses
async function readCourse(Term, Courses, CoursesFiltered, SeatsFilter, ProfsFilter, PStartTime, PEndTime){
  let Final = []
  let L = Courses[0][0]

  if (!fs.existsSync("./" + L + ".json")){
    await WriteJ(L)
  }

  let data = fs.readFileSync(L + ".json")
  let A = JSON.parse(data)

  for (let C of Courses){
    let CourseSubject = C.slice(0,4)
    let CourseCode = C.slice(4,C.length)
    let Result = []
    let n = A.length
    let low = 0
    let high = n
    let Found = false
    let oldMid = -1
    while (true){
      oldMid = mid
      var mid = parseInt((high + low)/2)
      if (oldMid === mid){break}
      if (A[mid].Term.slice(0,Term.length) == Term){
        if (A[mid].Subject === CourseSubject){
          if (A[mid].Code === CourseCode){
            Found = true
            break // we got the right mid, now expand on both ends
          }
          else{
            
            if (compare(A[mid].Code, CourseCode)){
              low = mid
            }
            else{
              high = mid
            }
          }
        }
        else{
          if (compare(A[mid].Subject, CourseSubject)){
            low = mid
          }
          else{
            high = mid
          }
        }
      }
      else{
        if (Term === "Fall"){
          high = mid;
        }
        else{
          low = mid;
        }
      }
    }

    if (!Found){
      let Obj = {
        "Name":CourseSubject + CourseCode,
      }
      Result.push(Obj)
    }
    else{
      let ListOfRecitation = []
      let start = mid
      while (start >= 0 && A[start].Code === CourseCode){
        start--
      }
      while (start < n - 1 && A[++start].Code === CourseCode){
        let sec = A[start]
        //if this is asserted then we can add the section
        //if course is not filtered or all filters are not broken
        if (!CoursesFiltered.includes(C) || ((!SeatsFilter || sec.SeatsA > 0) && (!ProfsFilter.includes(sec.IName+sec.ISName)) && (PStartTime == null || sec.BT1 >= PStartTime) && (PEndTime == null || sec.ET1 <= PEndTime) && (!HasLab(sec) || sec.ET2 <= PEndTime) )){
          if (A[start].CH != 0) Result.push(A[start])
        else ListOfRecitation.push(A[start])
        }
      }
      Temp = []
      for (let Sec of Result){
        for (let Res of ListOfRecitation){
          if (Res.LCRN == Sec.CRN){
            Sec.LinkedSections.push(Res)
          }
        }
        if (Sec.LinkedSections.length != 0 || ListOfRecitation == 0){
          Temp.push(Sec)
        }
      }
    }
    if (Temp.length == 0){
      let Obj = {
        "Name":CourseSubject + CourseCode,}
      Temp.push(Obj)}
    
    Final.push(Temp)
  }
  
  return Final
}

async function GetSections(Term, Courses, CoursesFiltered, SeatsFilter, ProfsFilter, PStartTime, PEndTime){
  let X = []

  Courses.sort(function(a,b){
    return a.localeCompare(b)
  })
  let i = 0
  while (i < Courses.length){
    let curr = Courses[i]
    let Temp = [curr]
    while(i < Courses.length - 1 && Courses[i][0] === Courses[i+1][0]){
      curr = Courses[++i]
      Temp.push(curr)
    }
    i++
    let A = await readCourse(Term, Temp, CoursesFiltered, SeatsFilter, ProfsFilter, PStartTime, PEndTime)
    for (let a of A){
      a.sort(function(x,y){
        return x.ET1 - y.ET1
      })
      X.push(a)
    }
  }
  for (let x of X){
    if (x.length === 1 && x[0].Term === undefined){
      console.log(x[0].Subject + x[0].Code + " has no sections with the given conditions (Term + Filters)") //we have to inform the user here!!!!!
    }
    else{
    for (let y of x){
      // console.log(y.Term.slice(0,Term.length), y.CRN, y.Subject, y.Code, y.BT1, y.ET1, y.Schedule1)
    }}
  }
  return X
}

async function SearchByCRN(CRN){
  for (let L of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){
    if (!fs.existsSync("./" + L + ".json")){
      await WriteJ(L)
    }
  
    let data = fs.readFileSync(L + ".json")
    let A = JSON.parse(data)
    for (let course of A){
      if (course.CRN === CRN){
        return course
      }
    }
  }
  return null
}

async function SearchByCRNGivenLetter(CRN, L){
  if (!fs.existsSync("./" + L + ".json")){
    await WriteJ(L)
  }

  let data = fs.readFileSync(L + ".json")
  let A = JSON.parse(data)
  for (let course of A){
    if (course.CRN === CRN){
      return course
    }
  }
}

function Days(S1, S2){
  for (let x of S1){
    for (let y of S2){
      if (x === y){
        return true
      }
    }
  }
  return false
}

function HasLab(Cours){
  if (Cours.Schedule2 != "") return true
  return false
}

function HasRecitation(Cours){
  if (Cours.LCRN[0] != "") return true
  return false
}

function OverLap(S1,F1,S2,F2){
  return S1 <= F2 && S2 <= F1
}

function Check(A, C){
  for (let i of A){
    if (Days(i.Schedule1, C.Schedule1) && OverLap(i.BT1,i.ET1,C.BT1,C.ET1)) return false
    if (!HasLab(A) && HasLab(C) && Days(i.Schedule1, C.Schedule2) && OverLap(i.BT1,i.ET1,C.BT2,C.ET2)) return false
    if (HasLab(A) && !HasLab(C) && Days(i.Schedule2, C.Schedule2) && OverLap(i.BT2,i.ET2,C.BT2,C.ET2)) return false
    if (HasLab(A) && HasLab(C) && Days(i.Schedule2, C.Schedule2) && OverLap(i.BT2,i.ET2,C.BT2,C.ET2)) return false
  }
  return true
}

async function GetPermutations(Term, SetCRNS = [], Courses, CoursesFiltered = [], SeatsFilter = true, ProfsFilter = [], PStartTime = null, PEndTime = null){
  let A = await GetSections(Term, Courses, CoursesFiltered, SeatsFilter, ProfsFilter, PStartTime, PEndTime)
  let SetCourses = []
  for (let CR of SetCRNS){
    let Cs = await SearchByCRN(CR)
    SetCourses.push(Cs)
  } //assume given CRNs are not conflicting and exist must fix later
  let n = A.length
  let Result = []
  async function rec(Perm, index) {
    if (index == n){
      Result.push(Perm)
    }
    else{
      for (let Section of A[index]){
        if (Check(Perm, Section)){
          if (HasRecitation(Section)){
            for (let Recitation of Section.LinkedSections){
              if (Check(Perm, Recitation)) rec(Perm.concat(Section, Recitation), index + 1)
            }
          }
          else{
            rec(Perm.concat(Section), index + 1)
          }
        }
      }
    }
  }
  return Result
}

module.exports.Course = Course

module.exports.GetPermutations = GetPermutations