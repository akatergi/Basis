var {
  Course,
  HasLab,
  IsLinked,
  IsRecitation,
  UpdateJSONs,
  CheckSectionWithFilters,
  CheckIfConflictingArray,
  compare,
  Check,
  ReadJSONFile,
  CodeToTerm,
  IntToTime,
  SearchByCRNs,
  BinarySearch,
  GetOneCourseWithNoFilter,
  SearchACRNOnline,
  GetProfs,
  GetDayOccurences,
  GetMaxTime,
  GetMinTime,
  Swap,
  GetDayDif,
  GetColor,
  validateSection,
  TimeToInt
} = require("./Tools.js")

async function GetCourse(Term, Courses, PStartTime, PEndTime){
  let CoursesToReturn = []
  let L = Courses[0].CourseName[0]
  let data = await ReadJSONFile(L)
  let MidCRN = data[0]
  let AllCoursesOfLetterL = data[1]
  let TermIsFall = (CodeToTerm(Term)[0] == "Fall")
  let n = AllCoursesOfLetterL.length
  for (let C of Courses){
    let CourseSubject = C.CourseName.slice(0,4)
    let CourseCode = C.CourseName.slice(4,C.length)
    let index = BinarySearch(Term, AllCoursesOfLetterL, CourseSubject, CourseCode, (TermIsFall ? 0:MidCRN), (TermIsFall ? MidCRN:n))
    let ListOfFilteredSections = []
    let ListOfFilteredRecitations = []
    while (index >= 0 && AllCoursesOfLetterL[index].Code === CourseCode) index--
    let NumberOfSections = 0
    let NumberOfRecitations = 0
    let LFilterConflictSeats = []
    let LFilterConflictProfessor = []
    let LFilterConflictStartTime = []
    let LFilterConflictFinishTime = []
    let LFilterConflictFinishLabTime = []
    let RFilterConflictSeats = []
    let RFilterConflictProfessor = []
    let RFilterConflictStartTime = []
    let RFilterConflictFinishTime = []
    let FoundNull = false
    let LatestSBeginTime = 0
    let EarliestSEndTime = 2400
    let LatestRBeginTime = 0
    let EarliestREndTime = 2400
    while (index < n - 1 && AllCoursesOfLetterL[++index].Code === CourseCode){
      let Section = AllCoursesOfLetterL[index]
      if (Section.BT1 === null || Section.ET1 === null){
        FoundNull = true
        continue}
      if (IsRecitation(Section)){
        if (CheckSectionWithFilters(Section, C.SeatsFilter, C.ProfessorFilter, PStartTime, PEndTime)){
          ListOfFilteredRecitations.push(Section)}
        else{
          if ((!C.SeatsFilter || Section.SeatsA > 0) == false) RFilterConflictSeats = RFilterConflictSeats.concat(Section.Section + "/" + Section.CRN)
          if ((PStartTime == null || Section.BT1 >= PStartTime) == false){
            if (LatestRBeginTime < Section.BT1) LatestRBeginTime = Section.BT1
            RFilterConflictStartTime = RFilterConflictStartTime.concat(Section.Section + "/" + Section.CRN)}
          if ((PEndTime == null || Section.ET1 <= PEndTime) == false){
            if (EarliestREndTime > Section.ET2) EarliestREndTime = Section.ET1
            RFilterConflictFinishTime = RFilterConflictFinishTime.concat(Section.Section + "/" + Section.CRN)}
        }
        NumberOfRecitations++
      }
      else{
        if (CheckSectionWithFilters(Section, C.SeatsFilter, C.ProfessorFilter, PStartTime, PEndTime)){
          ListOfFilteredSections.push(Section)}
        else{
          if ((!C.SeatsFilter || Section.SeatsA > 0) == false) LFilterConflictSeats = LFilterConflictSeats.concat(Section.Section + "/" + Section.CRN)
          if (C.ProfessorFilter.includes(Section.IName+" "+Section.ISName) == false) LFilterConflictProfessor = LFilterConflictProfessor.concat(Section.Section + "/" + Section.IName + " " + Section.ISName + "/" + Section.CRN)
          if ((PStartTime == null || Section.BT1 >= PStartTime) == false){
            if (LatestSBeginTime < Section.BT1) LatestSBeginTime = Section.BT1
            LFilterConflictStartTime = LFilterConflictStartTime.concat(Section.Section + "/" + Section.CRN)}
          if ((PEndTime == null || Section.ET1 <= PEndTime) == false){
            if (EarliestSEndTime > Section.ET1) EarliestSEndTime = Section.ET1
            LFilterConflictFinishTime = LFilterConflictFinishTime.concat(Section.Section + "/" + Section.CRN)}
          if ((PEndTime == null || !HasLab(Section) || Section.ET2 <= PEndTime) == false){
            if (EarliestSEndTime > Section.ET1) EarliestSEndTime = Section.ET2
            LFilterConflictFinishLabTime = LFilterConflictFinishLabTime.concat(Section.Section + "/" + Section.CRN)}
        }
        NumberOfSections++
      }
    }
    if (ListOfFilteredSections.length != 0 && NumberOfRecitations == 0) CoursesToReturn.push(ListOfFilteredSections)
    if (ListOfFilteredSections.length == 0){
      if (FoundNull) throw new Error("All sections had Null Start/End Times")
      let Reasons = ""
      if (LFilterConflictSeats != 0) Reasons += "Section/s with no available seats " + LFilterConflictSeats
      if (LFilterConflictProfessor != 0) Reasons += ((Reasons != "") ? "\n":"") + "Section/s with Filtered Professors " + LFilterConflictProfessor
      if (LFilterConflictStartTime != 0) Reasons += ((Reasons != "") ? "\n":"") + "Section/s that start before " + IntToTime(PStartTime) + ": " + LFilterConflictStartTime + ((LFilterConflictStartTime.length == NumberOfSections) ? "\nSuggestion: Set preferred start time to: " + IntToTime(LatestSBeginTime):"")
      if (LFilterConflictFinishTime != 0) Reasons += ((Reasons != "") ? "\n":"") + "Section/s that end after " + IntToTime(PEndTime) + ": " + LFilterConflictFinishTime + ((LFilterConflictFinishTime.length == NumberOfSections) ? "\nSuggestion: Set preferred end time to: " + IntToTime(EarliestSEndTime):"")
      if (LFilterConflictFinishLabTime != 0) Reasons += ((Reasons != "") ? "\n":"") + "Lab/s that end after " + IntToTime(PEndTime) + ": " + LFilterConflictFinishLabTime + ((LFilterConflictFinishLabTime.length == NumberOfSections) ? "\nSuggestion: Set preferred end time to: " + IntToTime(EarliestSEndTime):"")
      throw new Error(`No available section for\n${CourseSubject + CourseCode} that applies with given filter!\n` + Reasons)
    }
    if (NumberOfRecitations != 0){
      if (ListOfFilteredRecitations.length == 0){
        let Reasons = ""
        if (RFilterConflictSeats != 0) Reasons += "Recitation/s with no available seats " + RFilterConflictSeats
        if (RFilterConflictProfessor != 0) Reasons += ((Reasons != "") ? "\n":"") + "Recitation/s with Filtered Professors " + RFilterConflictProfessor 
        if (RFilterConflictStartTime != 0) Reasons += ((Reasons != "") ? "\n":"") + "Recitation/s that start before " + IntToTime(PStartTime) + ": " + RFilterConflictStartTime + ((RFilterConflictStartTime.length == NumberOfRecitations) ? "\nSuggestion: Set preferred start time to: " + IntToTime(LatestSBeginTime):"")
        if (RFilterConflictFinishTime != 0) Reasons += ((Reasons != "") ? "\n":"") + "Recitation/s that end after " + IntToTime(PEndTime) + ": " + RFilterConflictFinishTime + ((RFilterConflictFinishTime.length == NumberOfRecitations) ? "\nSuggestion: Set preferred end time to: " + IntToTime(EarliestSEndTime):"")
        throw new Error(`No available recitations for\n${CourseSubject + CourseCode} that applies with given filter!\n` + Reasons)
      }
    FinalListOfFilteredSections = []
    for (let S of ListOfFilteredSections){
      for (let R of ListOfFilteredRecitations){
        if (R.LCRN == S.CRN){
          S.LinkedSections.push(R)
        }
      }
      if (S.LinkedSections.length != 0){
        FinalListOfFilteredSections.push(S)
      }
    }
    if (FinalListOfFilteredSections.length == 0){
      let Reasons = "Available Sections:\n"
      for (let S of ListOfFilteredSections){
        Reasons += "/" + S.Section + S.CRN
      }
      Reasons += "\nAvailable Recitations:\n"
      for (let R of ListOfFilteredRecitations){
        Reasons += "/" + R.Section + R.CRN
      }
      throw new Error(`Available sections and available recitations but no section/linkedCRN combination available for\n${CourseSubject + CourseCode} that applies with given filter!\n${Reasons}`)}
    CoursesToReturn.push(FinalListOfFilteredSections)
    }
  }
  return CoursesToReturn
}

async function GetSections(Term, Courses, PStartTime, PEndTime){
  let ListOfSections = []

  let n = Courses.length
  Courses.sort(function(a,b){ //Sorts Courses in Alphabetical Order
    return a.CourseName.localeCompare(b.CourseName)
  })

  let index = 0
  while (index < n){
    let CurrentCourse = Courses[index]
    let CoursesToBeSearch = [CurrentCourse] //Here are the courses with the same letter
    while(index < n - 1 && Courses[index].CourseName[0] === Courses[index+1].CourseName[0]){ // Checks if the next Course has the same letter
      CurrentCourse = Courses[++index] //If they have the same letter, add to the list of courses to be searched
      CoursesToBeSearch.push(CurrentCourse)
    }
    index++
    let UnsortedCoursesOfSameLetter = await GetCourse(Term, CoursesToBeSearch, PStartTime, PEndTime)
    for (let SectionsPerCourse of UnsortedCoursesOfSameLetter){
      SectionsPerCourse.sort(function(x,y){
        return x.BT1 - y.BT1
      })
      ListOfSections.push(SectionsPerCourse) //After sorting List just add sorted list of this Course to our list of sections
    }
  }
  return ListOfSections
}

async function GetPermutations(Term, SetSections = [], CustomSections = [], Courses, PStartTime = null, PEndTime = null){
  let AllSections = await GetSections(Term, Courses, PStartTime, PEndTime)
  for (let Section of CustomSections){
    SetSections.push(Section)
  }
  CheckIfConflictingArray(SetSections, PStartTime, PEndTime) //throws an error if the SetCourses (CRNs given by user) are conflicting.
  var MaxTime = 0
  var MinTime = 2400
  var DayOccurences = [0,0,0,0,0,0]
  for (let Section of SetSections){
    MinTime = GetMinTime(Section, MinTime)
    MaxTime = GetMaxTime(Section, MaxTime)
    DayOccurences = GetDayOccurences(Section, DayOccurences)
  }
  let n = AllSections.length
  let ArrayOfPermutations = []
  var size = 0
  var PermWithLeastTimeDif = null
  var LeastTimeDif = 2400
  var PermWithLeastDays = null
  var MostDayDif = 0

  for (let Section of SetSections){
    if (!Section.Color) Section.Color = GetColor()
  }

  function rec(Perm, Min, Max, DO, index) {
    if (index == n){
      for (let Section of Perm){
        if (!Section.Color) Section.Color = GetColor()
      }
      ArrayOfPermutations.push(Perm)
      if (Max - Min < LeastTimeDif){
        LeastTimeDif = Max - Min
        PermWithLeastTimeDif = size}
      if (GetDayDif(DO) > MostDayDif){
        MostDayDif = GetDayDif(DO)
        PermWithLeastDays = size
      }
      size++
    }
    else{
      for (let Section of AllSections[index]){
        if (Check(Perm, Section)){
          if (IsLinked(Section)){
            for (let Recitation of Section.LinkedSections){
              if (Check(Perm, Recitation)) rec(Perm.concat(Section, Recitation), GetMinTime(Section, Min, Recitation), GetMaxTime(Section, Max, Recitation), GetDayOccurences(Section, DO, Recitation), index + 1)
            }
          }
          else{
            rec(Perm.concat(Section),GetMinTime(Section, Min),GetMaxTime(Section, Max), GetDayOccurences(Section, DO),index + 1)
          }
        }
      }
    }
  }
  rec(SetSections,MinTime,MaxTime,DayOccurences,0)

  if (ArrayOfPermutations.length == 0) throw new Error("No Permutations with the given sections available, try different courses")

  if (PermWithLeastDays == PermWithLeastTimeDif){
    Swap(ArrayOfPermutations, 0, PermWithLeastDays)
    console.log("First permutation has least Time Difference and Most Days Difference")
  }
  else{
    Swap(ArrayOfPermutations, 0, PermWithLeastTimeDif)
    Swap(ArrayOfPermutations, 1, PermWithLeastDays)
  }
  return ArrayOfPermutations
}
module.exports.GetPermutations = GetPermutations