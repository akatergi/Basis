const { DocumentPosition } = require("domutils");
var {
  Course,
  hasLab,
  isLinked,
  isRecitation,
  checkSectionWithFilters,
  checkIfConflictingArray,
  check,
  intToTime,
  getProfessors,
  getDayOccurences,
  getMaxTime,
  getMinTime,
  swap,
  getDayDif,
  getColor,
  readCourses,
  searchByCRNs,
  readElectives,
  codeToTerm,
  getMaxMinDO,
  resetColors
} = require("./Tools.js");

/**This function filters all our sections and contains most of the error handling.
 * It loops over each CourseFilterObject and then starts looping over its sections.
 * If Course is an elective (i.e. CourseFilterObject.Elective == true) then just get the elective sections,
 * otherwise get the course sections using its course subject and code.
 * After that we loop over the sections and count over the conflicts and return them if we have any errors.
 * This function throws an error for one of five cases:
 * -If no section exists for a certain Course
 * -If all sections have null begin and end times
 * -If no lectures exist with the given filters
 * -If no recitations exist with the given filters
 * -If lectures and recitations exist but there isn't any linked section correlation available
 * @param {string} Term 6 Digit Term Code e.g., 202220, 202110
 * @param {{CourseName: string, SeatsFilter: boolean, ProfessorFilter: Array, Elective: boolean}[]} CourseFilterObjects
 * Array of CourseFilter Objects. Each Filter Object contains 4 Attributes:
 * 1- CourseName string: e.g., 'EECE230', 'CMPS211', 'MATH251' if CourseFilterObject is not an elective, Otherwise:
 * switch (CourseName)
 * case "SS1" => Social Sciences 1
 * case "SS2" => Social Sciences 2
 * case "NS" => Natural Sciences
 * case "H1" => Humanities 1
 * case "H2" => Humanities 2
 * case "QT" => Quantitative Thought
 * 2- SeatsFilter boolean: filters out sections with no available seats if set to true, ignores seat availability if false
 * 3- ProfesserFilter Array of string: e.g., ['Louay Bazzi', 'Ibrahim Issa'] contains names of selected professors,
 * if left empty then no professor is fitlered out
 * 4- Elective boolean: is set to true if our CourseFilter Object is for electives, false otherwise
 * @param  {?number} PStartTime=null Preferred Start Time, filters out all sections that start before it (null by Default)
 * @param  {?number} PEndTime=null Preferred End Time, filters out all sections that end after it (null by Default)
 * @returns {Array.<Array.<Course>} Array of filtered sections to be sorted
 */
async function getArraysOfFilteredSections(
  Term,
  CourseFilterObjects,
  PStartTime,
  PEndTime
) {
  const Courses = await readCourses(Term);
  const Electives = await readElectives(Term);
  let CoursesToReturn = [];
  for (let CourseFilterObject of CourseFilterObjects) {
    let Sections;
    let Elective = CourseFilterObject.Elective;
    if (Elective) Sections = Electives[CourseFilterObject.CourseName];
    else {
      var CourseSubject = CourseFilterObject.CourseName.slice(0, 4);
      var CourseCode = CourseFilterObject.CourseName.slice(4);
      Sections = Courses[Term][CourseSubject][CourseCode];
      if (!Sections)
        throw new Error(
          `No Section for ${CourseSubject + CourseCode} in the ${
            codeToTerm(Term)[0]
          } term`
        );
    }
    let [ListOfFilteredSections, ListOfFilteredRecitations] = [[], []];
    let [
      LFilterConflictSeats,
      LFilterConflictStartTime,
      LFilterConflictFinishTime,
      LFilterConflictFinishLabTime
    ] = [[], [], [], []];
    let [
      RFilterConflictSeats,
      RFilterConflictStartTime,
      RFilterConflictFinishTime
    ] = [[], [], []];
    let NumberOfSections = (NumberOfRecitations = NumberOfNulls = 0);
    let [LatestSectionBeginTime, EarliestSectionEndTime] = [0, 2400];
    let [LatestRecitationBeginTime, EarliestRecitationEndTime] = [0, 2400];
    for (let Section of Sections) {
      if (!Section) continue;
      if (!Section.BT1 || Section.ET1 === null) {
        NumberOfNulls++;
        continue;
      }
      if (isRecitation(Section)) {
        if (
          checkSectionWithFilters(
            Section,
            CourseFilterObject.SeatsFilter,
            CourseFilterObject.ProfessorFilter,
            PStartTime,
            PEndTime,
            CourseFilterObject.Elective
          )
        )
          ListOfFilteredRecitations.push(Section);
        else if (!Elective) {
          if (!(!CourseFilterObject.SeatsFilter || Section.SeatsA > 0))
            RFilterConflictSeats.push(Section);
          if (!(!PStartTime || Section.BT1 >= PStartTime)) {
            if (LatestRecitationBeginTime < Section.BT1)
              LatestRecitationBeginTime = Section.BT1;
            RFilterConflictStartTime.push(Section);
          }
          if (!(!PEndTime || Section.ET1 <= PEndTime)) {
            if (EarliestRecitationEndTime > Section.ET2)
              EarliestRecitationEndTime = Section.ET1;
            RFilterConflictFinishTime.push(Section);
          }
        }
        NumberOfRecitations++;
      } else {
        if (
          checkSectionWithFilters(
            Section,
            CourseFilterObject.SeatsFilter,
            CourseFilterObject.ProfessorFilter,
            PStartTime,
            PEndTime,
            CourseFilterObject.Elective
          )
        )
          ListOfFilteredSections.push(Section);
        else if (!Elective) {
          if (!(!CourseFilterObject.SeatsFilter || Section.SeatsA > 0))
            LFilterConflictSeats.push(Section);
          if (!(!PStartTime || Section.BT1 >= PStartTime)) {
            if (LatestSectionBeginTime < Section.BT1)
              LatestSectionBeginTime = Section.BT1;
            LFilterConflictStartTime.push(Section);
          }
          if (!(!PEndTime || Section.ET1 <= PEndTime)) {
            if (EarliestSectionEndTime > Section.ET1)
              EarliestSectionEndTime = Section.ET1;
            LFilterConflictFinishTime.push(Section);
          }
          if (!(!PEndTime || !hasLab(Section) || Section.ET2 <= PEndTime)) {
            if (EarliestSectionEndTime > Section.ET1)
              EarliestSectionEndTime = Section.ET2;
            LFilterConflictFinishLabTime.push(Section);
          }
        }
        NumberOfSections++;
      }
    }
    if (ListOfFilteredSections.length != 0 && NumberOfRecitations == 0)
      CoursesToReturn.push(ListOfFilteredSections);
    if (ListOfFilteredSections.length == 0 && !Elective) {
      if (NumberOfNulls == Sections.length)
        throw new Error("All sections had Null Start/End Times");
      let Reasons = "";
      if (LFilterConflictSeats != 0)
        Reasons +=
          LFilterConflictSeats.length +
          " Section" +
          (LFilterConflictSeats.length > 1 ? "s" : "") +
          " with no available seats " +
          LFilterConflictSeats;
      if (LFilterConflictStartTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          LFilterConflictStartTime.length +
          ` Section${
            LFilterConflictStartTime.length > 1
              ? "s that start"
              : " that starts"
          } before ` +
          intToTime(PStartTime) +
          ":\n" +
          LFilterConflictStartTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (LFilterConflictFinishTime.length != NumberOfSections &&
          LFilterConflictFinishLabTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred start time to " +
              intToTime(LatestSectionBeginTime)
            : "");
      if (LFilterConflictFinishTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          LFilterConflictFinishTime.length +
          ` Section${
            LFilterConflictFinishTime.length > 1 ? "s that end" : " that ends"
          } after ` +
          intToTime(PEndTime) +
          ":\n" +
          LFilterConflictFinishTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (LFilterConflictStartTime.length != NumberOfSections &&
          LFilterConflictFinishLabTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred end time to " +
              intToTime(EarliestSectionEndTime)
            : "");
      if (LFilterConflictFinishLabTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          LFilterConflictFinishLabTime.length +
          ` Lab${
            LFilterConflictFinishLabTime.length > 1
              ? "s that end"
              : " that ends"
          } after ` +
          intToTime(PEndTime) +
          ":\n" +
          LFilterConflictFinishLabTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (LFilterConflictStartTime.length != NumberOfSections &&
          LFilterConflictFinishTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred end time to " +
              intToTime(EarliestSectionEndTime)
            : "");
      throw new Error(
        `No available section for\n${
          CourseSubject + CourseCode
        } that applies with given filter!\n` + Reasons
      );
    }
    if (NumberOfRecitations != 0) {
      if (ListOfFilteredRecitations.length == 0 && !Elective) {
        let Reasons = "";
        if (RFilterConflictSeats != 0)
          Reasons +=
            RFilterConflictSeats +
            " Recitation" +
            (RFilterConflictSeats.length > 1 ? "s" : "") +
            " with no available seats " +
            RFilterConflictSeats;
        if (RFilterConflictStartTime != 0)
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            RFilterConflictStartTime.length +
            ` Recitation${
              RFilterConflictStartTime.length > 1
                ? "s that start"
                : " that starts"
            } before ` +
            intToTime(PStartTime) +
            ":\n" +
            RFilterConflictStartTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n") +
            (RFilterConflictFinishTime.length != NumberOfRecitations
              ? "\nSuggestion: Set preferred start time to " +
                intToTime(LatestRecitationBeginTime)
              : "");
        if (RFilterConflictFinishTime != 0)
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            RFilterConflictFinishTime.length +
            ` Recitation${
              RFilterConflictFinishTime.length > 1 ? "s that end" : " that ends"
            } after ` +
            intToTime(PEndTime) +
            ":\n" +
            RFilterConflictFinishTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n") +
            (RFilterConflictStartTime.length != NumberOfRecitations
              ? "\nSuggestion: Set preferred end time to " +
                intToTime(EarliestRecitationEndTime)
              : "");
        throw new Error(
          `No available recitations for\n${
            CourseSubject + CourseCode
          } that applies with given filter!\n` + Reasons
        );
      }
      let FinalListOfFilteredSections = [];
      for (let S of ListOfFilteredSections) {
        for (let R of ListOfFilteredRecitations) {
          if (R.LCRN.includes(S.CRN)) S.LinkedSections.push(R);
        }
        if (S.LinkedSections) FinalListOfFilteredSections.push(S);
      }
      if (!FinalListOfFilteredSections && !Elective) {
        throw new Error(`Available sections and available recitations but no section/linkedCRN combination available for\n
            ${CourseSubject + CourseCode} that applies with given filter!\n
            Available Sections:\n
            + ${ListOfFilteredSections.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n")}
            + "\nAvailable Recitations:\n"
            + ${ListOfFilteredRecitations.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n")}`);
      }

      if ((!Elective && FinalListOfFilteredSections.length != 0) || Elective)
        CoursesToReturn.push(FinalListOfFilteredSections);
    }
  }
  return CoursesToReturn;
}

/**This functions main purpose is so sort our filtered sections after conversion and before permuting,
 * the importance of sorting is evident during the permuting phase of the algorithm by computing time conflicts sooner
 * @param  {string} Term 6 Digit Term Code e.g., 202220, 202110
 * @param  {{CourseName: string, SeatsFilter: boolean, ProfessorFilter: Array, Elective: boolean}[]} CourseFilterObjects
 * Array of CourseFilter Objects. Each Filter Object contains 4 Attributes:
 * 1- CourseName string: e.g., 'EECE230', 'CMPS211', 'MATH251' if CourseFilterObject is not an elective, Otherwise:
 * switch (CourseName)
 * case "SS1" => Social Sciences 1
 * case "SS2" => Social Sciences 2
 * case "NS" => Natural Sciences
 * case "H1" => Humanities 1
 * case "H2" => Humanities 2
 * case "QT" => Quantitative Thought
 * 2- SeatsFilter boolean: filters out sections with no available seats if set to true, ignores seat availability if false
 * 3- ProfesserFilter Array of string: e.g., ['Louay Bazzi', 'Ibrahim Issa'] contains names of selected professors,
 * if left empty then no professor is fitlered out
 * 4- Elective boolean: is set to true if our CourseFilter Object is for electives, false otherwise
 * @param  {?number} PStartTime=null Preferred Start Time, filters out all sections that start before it (null by Default)
 * @param  {?number} PEndTime=null Preferred End Time, filters out all sections that end after it (null by Default)
 * @returns {Array.<Array.<Course>} Array of filtered and sorted sections to be permuted
 */
async function convertCourseNamesToSections(
  Term,
  CourseFilterObjects,
  PStartTime,
  PEndTime
) {
  let ArrayOfSections = [];
  CourseFilterObjects.sort((x, y) => x.CourseName.localeCompare(y.CourseName));
  let ArrayOfUnsortedSections = await getArraysOfFilteredSections(
    Term,
    CourseFilterObjects,
    PStartTime,
    PEndTime
  );
  for (let UnsortedSections of ArrayOfUnsortedSections) {
    UnsortedSections.sort((x, y) => x.BT1 - y.BT1);
    ArrayOfSections.push(UnsortedSections);
  }
  return ArrayOfSections;
}

/**This is the main function to be exported to the backend.
 * It takes all the inputs, converts them accordingly, validates that there are no inputted errors, and permutes all filtered sections.
 * It also makes the first permutation be the one with the least time difference and the second with the most day difference
 * @param  {string} Term 6 Digit Term Code e.g., 202220, 202110
 * @param  {Object[]} [SetSections=[]] Array of Course Objects that were set by the user using their CRNs (Empty by Default)
 * @param  {Object[]} [CustomSections=[]] Array of Course Objects that were custom made by the user (Empty by Default)
 * @param  {{CourseName: string, SeatsFilter: boolean, ProfessorFilter: Array, Elective: boolean}[]}CourseFilterObjects
 * Array of CourseFilter Objects. Each Filter Object contains 4 Attributes:
 * 1- CourseName string: e.g., 'EECE230', 'CMPS211', 'MATH251' if CourseFilterObject is not an elective, Otherwise:
 * switch (CourseName)
 * case "SS1" => Social Sciences 1
 * case "SS2" => Social Sciences 2
 * case "NS" => Natural Sciences
 * case "H1" => Humanities 1
 * case "H2" => Humanities 2
 * case "QT" => Quantitative Thought
 * 2- SeatsFilter boolean: filters out sections with no available seats if set to true, ignores seat availability if false
 * 3- ProfesserFilter Array of string: e.g., ['Louay Bazzi', 'Ibrahim Issa'] contains names of selected professors,
 * if left empty then no professor is fitlered out
 * 4- Elective boolean: is set to true if our CourseFilter Object is for electives, false otherwise
 * @param  {?number} PStartTime=null Preferred Start Time, filters out all sections that start before it (null by Default)
 * @param  {?number} PEndTime=null Preferred End Time, filters out all sections that end after it (null by Default)
 * @returns {Array.<Array.<Course>>} Array of Permutations, each permutation is unique and contains one of each course
 */
async function getPermutations(
  Term,
  SetSections = [],
  CustomSections = [],
  CourseFilterObjects,
  PStartTime = null,
  PEndTime = null
) {
  let AllSections = await convertCourseNamesToSections(
    Term,
    CourseFilterObjects,
    PStartTime,
    PEndTime
  );
  SetSections = SetSections.concat(CustomSections);
  checkIfConflictingArray(SetSections, PStartTime, PEndTime);
  var [MaxTime, MinTime, DayOccurences] = getMaxMinDO(SetSections);
  let n = AllSections.length;
  let ArrayOfPermutations = [];
  var size = 0;
  var PermWithLeastTimeDif = null;
  var LeastTimeDif = 2400;
  var PermWithLeastDays = null;
  var MostDayDif = 0;
  function getPermsRecursion(Perm, Min, Max, DO, index) {
    if (index == n) {
      Perm = [...JSON.parse(JSON.stringify(Perm))]; //deep copy
      resetColors()
      for (let Section of Perm) Section.Color = getColor();
      ArrayOfPermutations.push(Perm);
      if (Max - Min < LeastTimeDif) {
        LeastTimeDif = Max - Min;
        PermWithLeastTimeDif = size;
      } else if (Max - Min === LeastTimeDif) {
        let CurrentDO = getMaxMinDO(ArrayOfPermutations[PermWithLeastDays])[2];
        if (getDayDif(DO) > getDayDif(CurrentDO)) PermWithLeastTimeDif = size;
      }
      if (getDayDif(DO) > MostDayDif) {
        MostDayDif = getDayDif(DO);
        PermWithLeastDays = size;
      } else if (getDayDif(DO) === MostDayDif) {
        let [CurrentMax, CurrentMin] = getMaxMinDO(
          ArrayOfPermutations[PermWithLeastDays]
        );
        if (CurrentMax - CurrentMin > Max - Min) PermWithLeastDays = size;
      }
      size++;
      if (size > 5000) throw new Error("Too many permutations, add more filters please")
    } else {
      for (let Section of AllSections[index]) {
        if (check(Perm, Section)) {
          if (isLinked(Section)) {
            for (let Recitation of Section.LinkedSections) {
              if (check(Perm, Recitation))
                getPermsRecursion(
                  Perm.concat(Section, Recitation),
                  getMinTime(Section, Min, Recitation),
                  getMaxTime(Section, Max, Recitation),
                  getDayOccurences(Section, DO, Recitation),
                  index + 1
                );
            }
          } else
            getPermsRecursion(
              Perm.concat(Section),
              getMinTime(Section, Min),
              getMaxTime(Section, Max),
              getDayOccurences(Section, DO),
              index + 1
            );
        }
      }
    }
  }
  getPermsRecursion(SetSections, MinTime, MaxTime, DayOccurences, 0);

  if (ArrayOfPermutations.length == 0)
    //TODO: Add cases to errors
    throw new Error(
      "No Permutations with the given sections available, try different courses"
    );

  if (PermWithLeastDays == PermWithLeastTimeDif) {
    swap(ArrayOfPermutations, 0, PermWithLeastDays);
  } else {
    let IndexToBeSwapped = PermWithLeastDays === 0 ? PermWithLeastTimeDif : 1;
    swap(ArrayOfPermutations, 0, PermWithLeastTimeDif);
    swap(ArrayOfPermutations, IndexToBeSwapped, PermWithLeastDays);
  }

  return ArrayOfPermutations;
}
module.exports.getPermutations = getPermutations;

function printStuff(Perms) {
  for (let Perm of Perms) {
    console.log(
      "----------------------------------\n" +
        Perm.map(
          (x) =>
            x.Subject +
            x.Code +
            " (" +
            intToTime(x.BT1) +
            ", " +
            intToTime(x.ET1) +
            ") " +
            x.Schedule1 +
            x.CRN
        ).join("\n")
    );
  }
}

async function giveNamesGetObjects(Term, CourseNames) {
  let A = [];
  for (let CN of CourseNames) {
    let S = CN.slice(0, 4);
    let C = CN.slice(4);
    A.push({
      CourseName: CN,
      SeatsFilter: false,
      ProfessorFilter: await getProfessors(Term, S, C),
      Elective: false
    });
  }
  return A;
}

async function test() {
  let TestTerm = "202220";
  let TestCRNs = [];
  let TestCustomCourses = [];
  let TestCourses = [
    {
      CourseName: "EECE311",
      SeatsFilter: false,
      ProfessorFilter: await getProfessors(TestTerm, "EECE", "311"),
      Elective: false
    },
    {
      CourseName: "EECE321",
      SeatsFilter: false,
      ProfessorFilter: await getProfessors(TestTerm, "EECE", "321"),
      Elective: false
    },
    {
      CourseName: "H1",
      SeatsFilter: true,
      ProfessorFilter: [],
      Elective: true
    }
  ];

  let setSections = await searchByCRNs(TestTerm, TestCRNs);
  let Perms = await getPermutations(
    TestTerm,
    setSections,
    TestCustomCourses,
    TestCourses,
    900,
    null
  );
  console.log("\n\n\n\n\n\nPermutations are", Perms.length);
  printStuff(Perms);
}
