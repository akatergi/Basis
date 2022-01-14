const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const math = require("mathjs");

const overLap = (S1, F1, S2, F2) => S1 < F2 && S2 < F1;
module.exports.overLap = overLap;

const hasLab = ({ Schedule2 }) => Boolean(Schedule2);
module.exports.hasLab = hasLab;

const isLinked = ({ LCRN }) => Boolean(LCRN.length);
module.exports.isLinked = isLinked;

const isRecitation = ({ Section }) => !isNumberorL(Section);
module.exports.isRecitation = isRecitation;

const checkSectionWithFilters = (
  Section,
  SeatsFilter,
  ProfessorFilter,
  PStartTime,
  PEndTime,
  Elective
) =>
  (!SeatsFilter || Section.SeatsA > 0) &&
  (isRecitation(Section) ||
    ProfessorFilter.includes(Section.IName + " " + Section.ISName) ||
    Elective) &&
  (!PStartTime || Section.BT1 >= PStartTime) &&
  (!PEndTime || Section.ET1 <= PEndTime) &&
  (!PEndTime || !hasLab(Section) || Section.ET2 <= PEndTime);
module.exports.checkSectionWithFilters = checkSectionWithFilters;

function checkIfConflictingArray(Sections, PBT, PET) {
  for (let i = 0; i < Sections.length; i++) {
    if (!Sections[i].BT1) throw new Error(`Section: ${
      Sections[i].Subject + Sections[i].Code + " (" + Sections[i].CRN + ")"
    } has no Start Time`
  );
  if (!Sections[i].ET1) throw new Error(`Section: ${
    Sections[i].Subject + Sections[i].Code + " (" + Sections[i].CRN + ")"
  } has no Begin Time`
);
    if (Sections[i].BT1 < PBT && PBT)
      throw new Error(
        `Section: ${
          Sections[i].Subject + Sections[i].Code + " (" + Sections[i].CRN + ")"
        } starts before ${intToTime(PBT)}`
      );
    if (Sections[i].ET1 > PET && PET)
      throw new Error(
        `Section: ${
          Sections[i].Subject + Sections[i].Code + " (" + Sections[i].CRN + ")"
        } starts after ${intToTime(PET)}`
      );
    if (hasLab(Sections[i]) && PET && PET < Sections[i].ET2)
      throw new Error(
        `Lab of Section: ${
          Sections[i].Subject + Sections[i].Code + " (" + Sections[i].CRN + ")"
        } starts before ${intToTime(PET)}`
      );
    if (i != 0 && !check(Sections.slice(0, i), Sections[i])) {
      if (Sections[i].CRN.slice(0, 4) == "CUST")
        throw new Error("Given Custom Courses are conflicting with Set CRNs");
      throw new Error("Given CRNs are conflicting");
    }
  }
}
module.exports.checkIfConflictingArray = checkIfConflictingArray;

function swap(Arr, index1, index2) {
  if (index1 == index2) return;
  let temp = Arr[index1];
  Arr[index1] = Arr[index2];
  Arr[index2] = temp;
}
module.exports.swap = swap;

function getMinTime(Section, MinTime, Recitation = { BT1: 2400 }) {
  let min = Math.min(Section.BT1, Recitation.BT1);
  if (min < MinTime) MinTime = min;
  if (hasLab(Section) && Section.BT2 < MinTime) MinTime = Section.BT2;
  return MinTime;
}
module.exports.getMinTime = getMinTime;

function getMaxTime(Section, MaxTime, Recitation = { ET1: 0 }) {
  let max = Math.max(Section.ET1, Recitation.ET1);
  if (max > MaxTime) MaxTime = max;
  if (hasLab(Section) && Section.ET2 > MaxTime) MaxTime = Section.ET2;
  return MaxTime;
}
module.exports.getMaxTime = getMaxTime;

const colorsConst = [
  "#8FFF7D",
  "#7DFFED",
  "#AC7DFF",
  "#7D8FFF",
  "#FF6666",
  "#FFB366",
  "#FF66DC",
  "#4667FF",
  "#FF0096",
  "#FF0016",
  "#FF6900",
  "#17FF00",
  "#00E39F",
  "#B237B7"
];
let colors = [...colorsConst];

function resetColors() {
  colors = [...colorsConst];
}
module.exports.resetColors = resetColors;

function getColor() {
  if (colors.length) {
    return colors.splice(Math.floor(Math.random() * colors.length), 1)[0];
  } else {
    colors = [...colorsConst];
    return colors.splice(Math.floor(Math.random() * colors.length), 1)[0];
  }
}
module.exports.getColor = getColor;

function printArrayOfProfessors(ArrayOfProfessors) {
  let n = ArrayOfProfessors.length;
  let output = ArrayOfProfessors[0];
  if (n == 1) return output;
  for (let i in ArrayOfProfessors) {
    if (i == n - 1) output += ", and " + ArrayOfProfessors[n - 1];
    else if (i != 0) output += ", " + ArrayOfProfessors[i];
  }
  return output;
}
module.exports.printArrayOfProfessors = printArrayOfProfessors;

function compareTimeDifs(Perm1, Perm2) {
  let dif1 = getMaxMinDO(Perm1)[0] - getMaxMinDO(Perm1)[1];
  let dif2 = getMaxMinDO(Perm2)[0] - getMaxMinDO(Perm2)[1];
  return dif1 - dif2;
}
module.exports.compareTimeDifs = compareTimeDifs;

function getMaxMinDO(ArrayOfSections) {
  let MaxTime = 0;
  let MinTime = 2400;
  let DayOccurences = [0, 0, 0, 0, 0, 0];
  for (let Section of ArrayOfSections) {
    MinTime = getMinTime(Section, MinTime);
    MaxTime = getMaxTime(Section, MaxTime);
    DayOccurences = getDayOccurences(Section, DayOccurences);
  }
  return [MaxTime, MinTime, DayOccurences];
}
module.exports.getMaxMinDO = getMaxMinDO;

function getDayDif(DO) {
  console.log(DO, math.std(DO))
  return math.std(DO);
}
module.exports.getDayDif = getDayDif;

function intersectingDays(S1, S2) {
  for (let Day1 of S1) for (let Day2 of S2) if (Day1 === Day2) return true;
  return false;
}
module.exports.intersectingDays = intersectingDays;

function compare(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    let x = a.charCodeAt(i);
    y = b.charCodeAt(i);
    if (x === y) continue;
    else if (x < y) return true;
    else if (x > y) return false;
    else return a.length < b.length;
  }
}
module.exports.compare = compare;

function check(ArrayOfSections, Section) {
  for (let CurrentSection of ArrayOfSections) {
    if (
      CurrentSection.Subject + CurrentSection.Code ===
      Section.Subject + Section.Code
    )
      return false;
    if (
      intersectingDays(CurrentSection.Schedule1, Section.Schedule1) &&
      overLap(CurrentSection.BT1, CurrentSection.ET1, Section.BT1, Section.ET1)
    )
      return false;
    if (
      hasLab(Section) &&
      intersectingDays(CurrentSection.Schedule1, Section.Schedule2) &&
      overLap(CurrentSection.BT1, CurrentSection.ET1, Section.BT2, Section.ET2)
    )
      return false;
    if (
      hasLab(CurrentSection) &&
      hasLab(Section) &&
      intersectingDays(CurrentSection.Schedule2, Section.Schedule2) &&
      overLap(CurrentSection.BT2, CurrentSection.ET2, Section.BT2, Section.ET2)
    )
      return false;
    if (
      hasLab(CurrentSection) &&
      intersectingDays(CurrentSection.Schedule2, Section.Schedule1) &&
      overLap(CurrentSection.BT2, CurrentSection.ET2, Section.BT1, Section.ET1)
    )
      return false;
  }
  return true;
}
module.exports.check = check;

function codeToTerm(Code) {
  let Year = Code.slice(0, 4),
    Term = Code.slice(4);
  if (Term == "10") Term = "Fall";
  else if (Term == "20") Term = "Spring";
  else Term = "Summer";
  return [Term, Year];
}
module.exports.codeToTerm = codeToTerm;

function intToTime(I) {
  let S = String(I),
    n = S.length,
    Minutes = S.slice(n - 2),
    Hours = S.slice(0, n - 2);
  if (Hours == "12") return Hours + ":" + Minutes + " PM";
  else if (I < 1200) return Hours + ":" + Minutes + " AM";
  else return String(parseInt(Hours) - 12) + ":" + Minutes + " PM";
}
module.exports.intToTime = intToTime;

function timeToInt(Time, PM) {
  Time = Time.split(":");
  let Hours = Time[0],
    Mins = Time[1];
  return (
    parseInt(Hours) * 100 +
    parseInt(Mins) +
    (Hours != "12" && PM == true ? 1200 : 0)
  );
}
module.exports.timeToInt = timeToInt;

function isNumberorL(N) {
  for (let digit of N) {
    digitIsNumber = false;
    for (let number of "1234567890L") {
      if (digit == number) {
        digitIsNumber = true;
        continue;
      }
    }
    if (!digitIsNumber) return false;
  }
  return true;
}
module.exports.isNumberorL = isNumberorL;

function addSectionToCourses(Courses, Section) {
  let [Term, Subject, Code] = [Section.Term, Section.Subject, Section.Code];
  if (Courses[Term]) {
    if (Courses[Term][Subject]) {
      if (Courses[Term][Subject][Code])
        Courses[Term][Subject][Code].push(Section);
      else {
        Courses[Term][Subject][Code] = [];
        addSectionToCourses(Courses, Section);
      }
    } else {
      Courses[Term][Subject] = {};
      addSectionToCourses(Courses, Section);
    }
  } else {
    Courses[Term] = {};
    addSectionToCourses(Courses, Section);
  }
}

function addToOccurences(DO, Schedule) {
  const WeekDays = "MTWRFS";
  for (let Day of Schedule) DO[WeekDays.indexOf(Day)]++;
}

function getDayOccurences(Section, Days, Recitation = { Schedule1: "" }) {
  let Occurences = [...Days];
  addToOccurences(Occurences, Section.Schedule1);
  addToOccurences(Occurences, Recitation.Schedule1);
  if (hasLab(Section)) addToOccurences(Occurences, Section.Schedule2);
  return Occurences;
}
module.exports.getDayOccurences = getDayOccurences;

async function readCourses(Term) {
  let path = `./public/bobsFolder/${codeToTerm(Term)[1]}/Courses.json`;
  if (!fs.existsSync(path)) await getCoursesAndCRNs(Term);
  return JSON.parse(fs.readFileSync(path));
}
module.exports.readCourses = readCourses;

async function readCRNs(Term) {
  let path = `./public/bobsFolder/${codeToTerm(Term)[1]}/CRNs.json`;
  if (!fs.existsSync(path)) await getCoursesAndCRNs(Term);
  return JSON.parse(fs.readFileSync(path));
}
module.exports.readCRNs = readCRNs;

async function readElectives(Term) {
  let path = `./public/bobsFolder/${codeToTerm(Term)[[1]]}/${
    codeToTerm(Term)[0]
  }/Electives.json`;
  if (!fs.existsSync(path)) await getElectives(Term);
  return JSON.parse(fs.readFileSync(path));
}
module.exports.readElectives = readElectives;

async function searchByCRNs(Term, CRNsToBeConverted) {
  let CRNs = await readCRNs(Term);
  for (let i in CRNsToBeConverted) {
    let CRN = CRNsToBeConverted[i];
    if (CRN.length != 5)
      throw new Error(`CRN: ${CRN} does not exist, must be of length 5`);
    if (CRN[0] != Term[4])
      throw new Error(
        `CRN: ${CRN} cannot exist whithin the ${
          codeToTerm(Term)[0]
        } term, since it starts with ${CRN[0]}`
      );
    if (!CRNs[CRN]) throw new Error(`CRN: ${CRN} does not exist`);
    else {
      CRNsToBeConverted[i] = CRNs[CRN];
    }
  }
  return CRNsToBeConverted;
}
module.exports.searchByCRNs = searchByCRNs;

async function getProfessors(Term, CourseSubject, CourseCode) {
  try {
    var Sections = (await readCourses(Term))[Term][CourseSubject][CourseCode];
  } catch {
    throw new Error(`Could not find a course with Subject ${CourseSubject}!`);
  }
  if (!Sections)
    throw new Error(
      `No Sections for ${CourseSubject + CourseCode} in the ${
        codeToTerm(Term)[0]
      } semester`
    );
  let ListOfProfs = [];
  for (let Section of Sections) {
    let Professor = Section.IName + " " + Section.ISName;
    if (!ListOfProfs.includes(Professor) && !isRecitation(Section))
      ListOfProfs.push(Professor);
  }
  return ListOfProfs;
}
module.exports.getProfessors = getProfessors;

async function getCoursesAndCRNs(Term) {
  let Courses = {};
  let CRNs = {};
  for (let Letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const result = await request.get(
      `https://www-banner.aub.edu.lb/catalog/schd_${Letter}.htm`
    );
    const $ = cheerio.load(result);
    $("body > p > table > tbody > tr").each((index, element) => {
      if (index > 4) {
        let Section = new Course(
          $($(element).find("td")[0]).text(),
          $($(element).find("td")[1]).text(),
          $($(element).find("td")[2]).text(),
          $($(element).find("td")[3]).text(),
          $($(element).find("td")[4]).text(),
          $($(element).find("td")[5]).text(),
          $($(element).find("td")[6]).text(),
          $($(element).find("td")[7]).text(),
          $($(element).find("td")[8]).text(),
          $($(element).find("td")[9]).text(),
          $($(element).find("td")[10]).text(),
          $($(element).find("td")[11]).text(),
          $($(element).find("td")[12]).text(),
          $($(element).find("td")[13]).text(),
          $($(element).find("td")[14]).text(),
          $($(element).find("td")[15]).text() +
            $($(element).find("td")[16]).text() +
            $($(element).find("td")[17]).text() +
            $($(element).find("td")[18]).text() +
            $($(element).find("td")[19]).text() +
            $($(element).find("td")[20]).text() +
            $($(element).find("td")[21]).text(),
          $($(element).find("td")[22]).text(),
          $($(element).find("td")[23]).text(),
          $($(element).find("td")[24]).text(),
          $($(element).find("td")[25]).text(),
          $($(element).find("td")[26]).text() +
            $($(element).find("td")[27]).text() +
            $($(element).find("td")[28]).text() +
            $($(element).find("td")[29]).text() +
            $($(element).find("td")[30]).text() +
            $($(element).find("td")[31]).text() +
            $($(element).find("td")[32]).text(),
          $($(element).find("td")[33]).text(),
          $($(element).find("td")[34]).text(),
          $($(element).find("td")[35]).text(),
          $($(element).find("td")[36]).text()
        );
        addSectionToCourses(Courses, Section);
        CRNs[$($(element).find("td")[1]).text()] = Section;
      }
    });
  }
  fs.writeFileSync(
    `./public/bobsFolder/${codeToTerm(Term)[1]}/Courses.json`,
    JSON.stringify(Courses)
  );
  fs.writeFileSync(
    `./public/bobsFolder/${codeToTerm(Term)[1]}/CRNs.json`,
    JSON.stringify(CRNs)
  );
}
module.exports.getCoursesAndCRNs = getCoursesAndCRNs;

D = {
  "Social Sciences I": "SS1",
  "Social Sciences II": "SS2",
  "Humanities I": "H1",
  "Humanities II": "H2",
  "Natural Sciences": "NS",
  "Arabic Communication Skills": "Ar",
  "English Communication Skills": "En",
  "Quantitative Thought": "QT"
};

async function getElectives(Term) {
  let Electives = {
    SS1: [],
    SS2: [],
    NS: [],
    H1: [],
    H2: [],
    Ar: [],
    En: [],
    QT: []
  };
  let CRNs = await readCRNs(Term);
  Term = codeToTerm(Term);
  const $ = cheerio.load(
    fs.readFileSync(
      `./public/bobsFolder/${Term[1]}/${Term[0]}/GeneralEducation.html`
    )
  );
  $("body > table > tbody > tr").each((index, element) => {
    if (index > 0) {
      Electives[D[$($(element).find("td")[4]).text().trim()]].push(
        CRNs[$($(element).find("td")[1]).text().trim()]
      );
    }
  });
  fs.writeFileSync(
    `./public/bobsFolder/${Term[1]}/${Term[0]}/Electives.json`,
    JSON.stringify(Electives)
  );
}
module.exports.getElectives = getElectives;

class Course {
  constructor(
    Term,
    CRN,
    Subject,
    Code,
    Section,
    Title,
    CH,
    BH,
    College,
    SeatsT,
    SeatsA,
    BT1,
    ET1,
    Buil1,
    R1,
    Schedule1,
    BT2,
    ET2,
    Buil2,
    R2,
    Schedule2,
    IName,
    ISName,
    LCRN
  ) {
    this.Term = Term.slice(-7, -1);
    this.CRN = CRN;
    this.Subject = Subject;
    this.Code = Code;
    this.Section = Section;
    this.Title = Title;
    this.CH = parseInt(CH);
    this.BH = parseInt(BH);
    this.College = College;
    this.SeatsT = parseInt(SeatsT);
    this.SeatsA = parseInt(SeatsA);
    this.BT1 = parseInt(BT1);
    this.ET1 = parseInt(ET1);
    this.Buil1 = Buil1;
    this.R1 = R1;
    this.Schedule1 = Schedule1.replaceAll(".", "");
    this.BT2 = parseInt(BT2);
    this.ET2 = parseInt(ET2);
    this.Buil2 = Buil2;
    this.R2 = R2;
    this.Schedule2 = Schedule2.replaceAll(".", "");
    this.IName = IName;
    this.ISName = ISName;
    this.LCRN = LCRN.split(", or ").map((x) => x.slice(0, 5));
    if (this.LCRN.length == 1 && this.LCRN[0] == "") this.LCRN = [];
    this.LinkedSections = [];
    this.Color = null;
  }
}
module.exports.Course = Course;
