const { DocumentPosition } = require("domutils");
const { json } = require("express/lib/response");
const {
  compare,
  sum,
  permutations,
  usolveDependencies,
  add
} = require("mathjs");
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
  resetColors,
  printArrayOfProfessors,
  compareTimeDifs
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
  let AllAcceptedSections = [];
  let AllSections = [];
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
    let [ListOfAllSections, ListOfAllRecitations] = [[], []];
    let [
      SectionsWithNoSeats,
      SectionWithConflictingStartTime,
      SectionWithConflictingFinishTime,
      SectionWithConflictingFinishLabTime
    ] = [[], [], [], []];
    let [
      RecitationsWithNoSeats,
      RecitationsWithConflictingStartTime,
      RecitationsWithConflictingEndTime
    ] = [[], [], []];
    let NumberOfSections =
      (NumberOfRecitations =
      NumberOfNulls =
      NumberOfSectionsWithProf =
        0);
    let [LatestSectionBeginTime, EarliestSectionEndTime] = [0, 2400];
    let [LatestRecitationBeginTime, EarliestRecitationEndTime] = [0, 2400];
    for (let Section of Sections) {
      if (!Section) continue;
      if (!Section.BT1 || Section.ET1 === null) {
        NumberOfNulls++;
        continue;
      }
      if (isRecitation(Section)) {
        ListOfAllRecitations.push(Section);
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
            RecitationsWithNoSeats.push(Section);
          if (!(!PStartTime || Section.BT1 >= PStartTime)) {
            if (LatestRecitationBeginTime < Section.BT1)
              LatestRecitationBeginTime = Section.BT1;
            RecitationsWithConflictingStartTime.push(Section);
          }
          if (!(!PEndTime || Section.ET1 <= PEndTime)) {
            if (EarliestRecitationEndTime > Section.ET2)
              EarliestRecitationEndTime = Section.ET1;
            RecitationsWithConflictingEndTime.push(Section);
          }
        }
        NumberOfRecitations++;
      } else {
        ListOfAllSections.push(Section);
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
          if (
            CourseFilterObject.ProfessorFilter.includes(
              Section.IName + " " + Section.ISName
            )
          ) {
            if (!(!CourseFilterObject.SeatsFilter || Section.SeatsA > 0))
              SectionsWithNoSeats.push(Section);
            if (!(!PStartTime || Section.BT1 >= PStartTime)) {
              if (LatestSectionBeginTime < Section.BT1)
                LatestSectionBeginTime = Section.BT1;
              SectionWithConflictingStartTime.push(Section);
            }
            if (!(!PEndTime || Section.ET1 <= PEndTime)) {
              if (EarliestSectionEndTime > Section.ET1)
                EarliestSectionEndTime = Section.ET1;
              SectionWithConflictingFinishTime.push(Section);
            }
            if (!(!PEndTime || !hasLab(Section) || Section.ET2 <= PEndTime)) {
              if (EarliestSectionEndTime > Section.ET1)
                EarliestSectionEndTime = Section.ET2;
              SectionWithConflictingFinishLabTime.push(Section);
            }
            NumberOfSectionsWithProf++;
          }
        }
        NumberOfSections++;
      }
    }
    if (ListOfFilteredSections.length != 0 && NumberOfRecitations == 0) {
      AllAcceptedSections.push(ListOfFilteredSections);
      AllSections.push(ListOfAllSections);
    }
    if (ListOfFilteredSections.length == 0 && !Elective) {
      if (NumberOfNulls == Sections.length)
        throw new Error("All sections had Null Start/End Times");
      let Reasons = "";
      if (SectionsWithNoSeats.length == NumberOfSectionsWithProf) {
        if (SectionsWithNoSeats.length == 1) {
          throw new Error(
            `The one ${CourseSubject + CourseCode} Section with ` +
              printArrayOfProfessors(CourseFilterObject.ProfessorFilter) +
              " has no available seats"
          );
        } else {
          throw new Error(
            `All ${CourseSubject + CourseCode} Sections with ` +
              printArrayOfProfessors(CourseFilterObject.ProfessorFilter) +
              " have no available seats"
          );
        }
      }
      if (SectionWithConflictingStartTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          SectionWithConflictingStartTime.length +
          ` Section${
            SectionWithConflictingStartTime.length > 1
              ? "s that start"
              : " that starts"
          } before ` +
          intToTime(PStartTime) +
          ":\n" +
          SectionWithConflictingStartTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (SectionWithConflictingFinishTime.length != NumberOfSections &&
          SectionWithConflictingFinishLabTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred start time to " +
              intToTime(LatestSectionBeginTime)
            : "");
      if (SectionWithConflictingFinishTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          SectionWithConflictingFinishTime.length +
          ` Section${
            SectionWithConflictingFinishTime.length > 1
              ? "s that end"
              : " that ends"
          } after ` +
          intToTime(PEndTime) +
          ":\n" +
          SectionWithConflictingFinishTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (SectionWithConflictingStartTime.length != NumberOfSections &&
          SectionWithConflictingFinishLabTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred end time to " +
              intToTime(EarliestSectionEndTime)
            : "");
      if (SectionWithConflictingFinishLabTime != 0)
        Reasons +=
          (Reasons != "" ? "\n" : "") +
          SectionWithConflictingFinishLabTime.length +
          ` Lab${
            SectionWithConflictingFinishLabTime.length > 1
              ? "s that end"
              : " that ends"
          } after ` +
          intToTime(PEndTime) +
          ":\n" +
          SectionWithConflictingFinishLabTime.map(
            (Section) => `Section ${Section.Section} (${Section.CRN})`
          ).join("\n") +
          (SectionWithConflictingStartTime.length != NumberOfSections &&
          SectionWithConflictingFinishTime.length != NumberOfSections
            ? "\nSuggestion: Set preferred end time to " +
              intToTime(EarliestSectionEndTime)
            : "");
      throw new Error(
        `No available section for ${
          CourseSubject + CourseCode
        } that applies with given filter!\n` + Reasons
      );
    }
    if (NumberOfRecitations != 0) {
      if (ListOfFilteredRecitations.length == 0 && !Elective) {
        let Reasons = "";
        if (RecitationsWithNoSeats.length == NumberOfRecitations) {
          throw new Error(
            `All ${
              CourseSubject + CourseCode
            } Recitations have no available seats`
          );
        }
        if (RecitationsWithConflictingStartTime != 0)
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            RecitationsWithConflictingStartTime.length +
            ` Recitation${
              RecitationsWithConflictingStartTime.length > 1
                ? "s that start"
                : " that starts"
            } before ` +
            intToTime(PStartTime) +
            ":\n" +
            RecitationsWithConflictingStartTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n") +
            (RecitationsWithConflictingEndTime.length != NumberOfRecitations
              ? "\nSuggestion: Set preferred start time to " +
                intToTime(LatestRecitationBeginTime)
              : "");
        if (RecitationsWithConflictingEndTime != 0)
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            RecitationsWithConflictingEndTime.length +
            ` Recitation${
              RecitationsWithConflictingEndTime.length > 1
                ? "s that end"
                : " that ends"
            } after ` +
            intToTime(PEndTime) +
            ":\n" +
            RecitationsWithConflictingEndTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join("\n") +
            (RecitationsWithConflictingStartTime.length != NumberOfRecitations
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
      FinalListOfFilteredSections = JSON.parse(
        JSON.stringify(FinalListOfFilteredSections)
      );
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
      for (let S of ListOfAllSections) {
        for (let R of ListOfAllRecitations) {
          if (
            R.LCRN.includes(S.CRN) &&
            !S.LinkedSections.map((x) => x.CRN).includes(R.CRN)
          )
            S.LinkedSections.push(R);
        }
      }

      if ((!Elective && FinalListOfFilteredSections.length != 0) || Elective) {
        AllAcceptedSections.push(FinalListOfFilteredSections);
        AllSections.push(ListOfAllSections);
      }
    }
  }
  return [AllAcceptedSections, AllSections];
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
  let ArrayOfAllSections = [];
  let ArrayOfUnsortedSections = await getArraysOfFilteredSections(
    Term,
    CourseFilterObjects,
    PStartTime,
    PEndTime
  );
  for (let UnsortedSections of ArrayOfUnsortedSections[0]) {
    UnsortedSections.sort((x, y) => x.BT1 - y.BT1);
    ArrayOfSections.push(UnsortedSections);
  }
  for (let UnsortedSections of ArrayOfUnsortedSections[1]) {
    UnsortedSections.sort((x, y) => x.BT1 - y.BT1);
    ArrayOfAllSections.push(UnsortedSections);
  }
  ArrayOfSections.sort((x, y) => x.length - y.length);
  ArrayOfAllSections.sort((x, y) => x.length - y.length);
  return [ArrayOfSections, ArrayOfAllSections];
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
  let ConvertedSections = await convertCourseNamesToSections(
    Term,
    CourseFilterObjects,
    PStartTime,
    PEndTime
  );
  let AllFilteredSections = ConvertedSections[0];
  let AllSections = ConvertedSections[1];
  let num = 1;
  for (let ArraySection of AllFilteredSections) {
    var sum = 0;
    for (let Section of ArraySection) {
      sum +=
        Section.LinkedSections.length == 0 ? 1 : Section.LinkedSections.length;
    }
    num *= sum;
  }
  if (num > 15000)
    throw new Error(
      ` Will not calculate ${num} schedules, use filters to lower amount of perms to get below 15000 schedules`
    );
  SetSections = SetSections.concat(CustomSections);
  checkIfConflictingArray(SetSections, PStartTime, PEndTime);
  var [MaxTime, MinTime, DayOccurences] = getMaxMinDO(SetSections);
  printStuff(AllFilteredSections);
  let n = AllFilteredSections.length;
  let ArrayOfPermutations = [];
  var size = 0;
  var PermWithLeastTimeDif = null;
  var LeastTimeDif = 2400;
  var PermWithLeastDays = null;
  var MostDayDif = 0;
  function getPermsRecursion(Perm, Min, Max, DO, index) {
    if (index == n) {
      Perm = [...JSON.parse(JSON.stringify(Perm))]; //deep copy
      resetColors();
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
    } else {
      for (let Section of AllFilteredSections[index]) {
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

  if (ArrayOfPermutations.length == 0) {
    let num2 = 1;
    for (let ArraySection of AllFilteredSections) {
      var sum2 = 0;
      for (let Section of ArraySection) {
        sum2 +=
          Section.LinkedSections.length == 0
            ? 1
            : Section.LinkedSections.length;
      }
      num2 *= sum2;
    }
    if (num2 > 30000)
      throw new Error(
        ` Will not calculate ${num2} schedules, remove a course or set a certain section`
      );
    function getPermsRecursionForAllSections(Perm, Min, Max, DO, index) {
      if (index == n) {
        ArrayOfPermutations.push(Perm);
        if (Max - Min < LeastTimeDif) {
          LeastTimeDif = Max - Min;
          PermWithLeastTimeDif = size;
        } else if (Max - Min === LeastTimeDif) {
          let CurrentDO = getMaxMinDO(
            ArrayOfPermutations[PermWithLeastDays]
          )[2];
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
      } else {
        for (let Section of AllSections[index]) {
          if (check(Perm, Section)) {
            if (isLinked(Section)) {
              for (let Recitation of Section.LinkedSections) {
                if (check(Perm, Recitation))
                  getPermsRecursionForAllSections(
                    Perm.concat(Section, Recitation),
                    getMinTime(Section, Min, Recitation),
                    getMaxTime(Section, Max, Recitation),
                    getDayOccurences(Section, DO, Recitation),
                    index + 1
                  );
              }
            } else
              getPermsRecursionForAllSections(
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
    getPermsRecursionForAllSections(
      SetSections,
      MinTime,
      MaxTime,
      DayOccurences,
      0
    );
    if (ArrayOfPermutations.length == 0) {
      throw new Error(
        "No Permutations with the given sections available, try different courses"
      );
    } else {
      let CoursesWithSeatsFilter = [];
      let FilteredProfessorsForEachCourse = {};
      for (let CourseFilterObject of CourseFilterObjects) {
        if (CourseFilterObject.SeatsFilter)
          CoursesWithSeatsFilter.push(CourseFilterObject.CourseName);
        FilteredProfessorsForEachCourse[CourseFilterObject.CourseName] =
          CourseFilterObject.ProfessorFilter;
      }
      ArrayOfPermutations = ArrayOfPermutations.map((x) => [
        x,
        getMaxMinDO(x)[0] - getMaxMinDO(x)[1]
      ]);
      ArrayOfPermutations.sort((x, y) => x[1] - y[1]);
      ArrayOfPermutations = ArrayOfPermutations.map((x) => x[0]);
      let PermutationsWithSeatAvailability = [];
      for (let Permutation of ArrayOfPermutations) {
        let validSeats = (validProfs = true);
        for (let Section of Permutation) {
          if (
            CoursesWithSeatsFilter.includes(Section.Subject + Section.Code) &&
            Section.SeatsA <= 0
          )
            validSeats = false;
          if (
            !FilteredProfessorsForEachCourse[Section.Subject + Section.Code].includes(
              Section.IName + " " + Section.ISName
            ) && !isRecitation(Section)
          )
            validProfs = false;
        }
        if (validSeats && validProfs) {
          let [PermMax, PermMin] = getMaxMinDO(Permutation);
          ProfessorsToChange = "";
          if (PermMin < PStartTime && PermMax > PEndTime)
            throw new Error(
              "No Permutations Available:\nSuggestion: Set Preferred StartTime to " +
                intToTime(PermMin) +
                "\n" +
                "Set Preferred EndTime to " +
                intToTime(PermMax)
            );
          if (PermMin < PStartTime)
            throw new Error(
              "No Permutations Available:\nSuggestion: Set Preferred StartTime to " +
                intToTime(PermMin)
            );
          if (PermMax > PEndTime)
            throw new Error(
              "No Permutations Available:\nSuggestion: Set Preferred EndTime to " +
                intToTime(PermMax)
            );
        } 
        if (validSeats) PermutationsWithSeatAvailability.push(Permutation);
      }
      if (PermutationsWithSeatAvailability.length != 0) {
        let MinNumberOfProfessorsToChange = 1000;
        let ArrayOfListOfAvailableUnselectedProfessorsPerCourse = [];
        for (let Permutation of PermutationsWithSeatAvailability) {
          let UnselectedProfessorsPerCourse = [];
          for (let Section of Permutation) {
            if (
              !FilteredProfessorsForEachCourse[Section.Subject + Section.Code].includes(
                Section.IName + " " + Section.ISName
              )
            ) {
              UnselectedProfessorsPerCourse.push(
                Section.Subject +
                  Section.Code +
                  ":" +
                  Section.IName +
                  " " +
                  Section.ISName
              );
            }
            if (UnselectedProfessorsPerCourse.length < MinNumberOfProfessorsToChange) {
              MinNumberOfProfessorsToChange = UnselectedProfessorsPerCourse.length;
              ArrayOfListOfAvailableUnselectedProfessorsPerCourse = [UnselectedProfessorsPerCourse];
            } else if (UnselectedProfessorsPerCourse.length == MinNumberOfProfessorsToChange)
              ArrayOfListOfAvailableUnselectedProfessorsPerCourse.push(UnselectedProfessorsPerCourse);
          }
        }
        var ProfessorsToChange = "";
        let first = true;
        let AddedUnselectedProfessors = [];
        for (let AvailableUnselectedProfessorsPerCourse of ArrayOfListOfAvailableUnselectedProfessorsPerCourse) {
          AvailableUnselectedProfessorsPerCourse.sort((a, b) => a.localeCompare(b));
          if (!AddedUnselectedProfessors.includes(JSON.stringify(AvailableUnselectedProfessorsPerCourse))) {
            if (first) first = false;
            else ProfessorsToChange += "\n or \n";
            AddedUnselectedProfessors.push(JSON.stringify(AvailableUnselectedProfessorsPerCourse));
            for (let AvailableUnselectedProfessor of AvailableUnselectedProfessorsPerCourse) {
              let Word = AvailableUnselectedProfessor.split(":");
              ProfessorsToChange += "-for " + Word[0] + " choose " + Word[1] + "\n";
            }
          }
        }
        throw new Error(
          "No Permutations Available:\nSuggestion: Select the following professors\n" +
            ProfessorsToChange
        );
      }
      throw new Error("No Permutations Exist: Must Change Courses!");
    }
  }

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
  // for (let Perm of Perms) {
  //   console.log(
  //     "----------------------------------\n" +
  //       Perm.map(
  //         (x) =>
  //           x.Subject +
  //           x.Code +
  //           " (" +
  //           intToTime(x.BT1) +
  //           ", " +
  //           intToTime(x.ET1) +
  //           ") " +
  //           x.Schedule1 +
  //           x.CRN
  //       ).join("\n")
  //   );
  // }
}
