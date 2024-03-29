const {
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
  getDayDif,
  getColor,
  readCourses,
  searchByCRNs,
  readElectives,
  codeToTerm,
  getMaxMinDO,
  resetColors,
  printArrayOfProfessors,
  compareTimeDifs,
  getUpperCampusDif
} = require("./Tools.js");

ElectivesDictionary = {
  SS1: "Social Sciences I",
  SS2: "Social Sciences II",
  H1: "Humanities I",
  H2: "Humanities II",
  NS: "Natural Sciences",
  Ar: "Arabic Communication Skills",
  En: "English Communication Skills",
  QT: "Quantitative Thought"
};

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
 * 3- ProfessorFilter Array of string: e.g., ['Louay Bazzi', 'Ibrahim Issa'] contains names of selected professors,
 * if left empty then no professor is filtered out
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
  let CoursesWithAllStartConflict = [];
  let CoursesWithAllEndConflict = [];
  let CoursesWithStartConflict = [];
  let CoursesWithEndConflict = [];
  for (let CourseFilterObject of CourseFilterObjects) {
    let Sections;
    let Elective = CourseFilterObject.Elective;
    if (Elective)
      Sections = Electives[CourseFilterObject.CourseName].filter((x) =>
        CourseFilterObject.courseFilter.includes(x.Subject)
      );
    else {
      var CourseSubject = CourseFilterObject.CourseName.slice(0, 4);
      var CourseCode = CourseFilterObject.CourseName.slice(4);
      Sections = Courses[Term][CourseSubject][CourseCode];
      if (!Sections)
        throw new Error(
          `No Section for ${CourseSubject + CourseCode} in the ${
            codeToTerm(Term)[0]
          } terms`
        );
    }
    let [ListOfFilteredSections, ListOfFilteredRecitations] = [[], []];
    let [ListOfAllSections, ListOfAllRecitations] = [[], []];
    let [
      SectionsWithNoSeats,
      SectionsWithConflictingStartTime,
      SectionsWithConflictingFinishTime,
      SectionsWithConflictingFinishLabTime
    ] = [[], [], [], []];
    let [
      RecitationsWithNoSeats,
      RecitationsWithConflictingStartTime,
      RecitationsWithConflictingEndTime
    ] = [[], [], []];
    let NumberOfRecitations = (NumberOfNulls = NumberOfSectionsWithProf = 0);
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
          else {
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
        else {
          if (
            Elective ||
            CourseFilterObject.ProfessorFilter.includes(
              Section.IName + " " + Section.ISName
            )
          ) {
            let ConflictsWithBeginTime = false;
            if (!(!CourseFilterObject.SeatsFilter || Section.SeatsA > 0))
              SectionsWithNoSeats.push(Section);
            else {
              if (!(!PStartTime || Section.BT1 >= PStartTime)) {
                ConflictsWithBeginTime = true;
                if (LatestSectionBeginTime < Section.BT1) {
                  LatestSectionBeginTime = Section.BT1;
                  SectionWithLatestBeginTime = Section;
                }
                SectionsWithConflictingStartTime.push(Section);
              }
              if (!(!PEndTime || Section.ET1 <= PEndTime)) {
                if (
                  EarliestSectionEndTime > Section.ET1 &&
                  !ConflictsWithBeginTime
                ) {
                  EarliestSectionEndTime = Section.ET1;
                  SectionWithEarliestSectionEndTime = Section;
                }
                SectionsWithConflictingFinishTime.push(Section);
              }
              if (!(!PEndTime || !hasLab(Section) || Section.ET2 <= PEndTime)) {
                if (
                  EarliestSectionEndTime > Section.ET1 &&
                  !ConflictsWithBeginTime
                )
                  EarliestSectionEndTime = Section.ET2;
                SectionsWithConflictingFinishLabTime.push(Section);
              }
            }
            NumberOfSectionsWithProf++;
          }
        }
      }
    }
    if (ListOfFilteredSections.length != 0 && NumberOfRecitations == 0) {
      AllAcceptedSections.push(ListOfFilteredSections);
      AllSections.push(ListOfAllSections);
    }
    if (ListOfFilteredSections.length == 0) {
      let Reasons = "";
      if (Elective) {
        if (NumberOfNulls == Sections.length)
          throw new Error(
            `All selected ${
              ElectivesDictionary[CourseFilterObject.CourseName]
            } sections had Null Start/End Times`
          );
        if (SectionsWithNoSeats.length == NumberOfSectionsWithProf) {
          let SubjectsNames = CourseFilterObject.courseFilter;
          let n = SubjectsNames.length;
          if (SubjectsNames.length == 1)
            throw new Error(
              `All ${SubjectsNames[0]} electives have no available seats`
            );
          throw new Error(
            `All ${
              SubjectsNames.slice(0, n - 1).join(", ") +
              ", and " +
              SubjectsNames[n - 1]
            } electives have no available seats`
          );
        }
        if (SectionsWithConflictingStartTime.length == NumberOfSectionsWithProf)
          throw new Error(
            `All selected ${
              ElectivesDictionary[CourseFilterObject.CourseName]
            } electives start before ${intToTime(
              PStartTime
            )}\n Suggestion: Set preferred start time to ${intToTime(
              LatestSectionBeginTime
            )}`
          );
        if (
          SectionsWithConflictingFinishTime.length == NumberOfSectionsWithProf
        )
          throw new Error(
            `All selected electives finish after ${intToTime(
              PEndTime
            )}\n Suggestion: Set preferred end time to ${intToTime(
              EarliestSectionEndTime
            )}`
          );
        let Suggestions = [];
        if (SectionsWithConflictingStartTime.length != 0) {
          Reasons +=
            SectionsWithConflictingStartTime.length +
            ` Section${
              SectionsWithConflictingStartTime.length > 1
                ? "s that start"
                : " that starts"
            } before ` +
            intToTime(PStartTime);
          Suggestions.push(
            "Set preferred start time to " + intToTime(LatestSectionBeginTime)
          );
        }
        if (SectionsWithConflictingFinishTime.length != 0) {
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            SectionsWithConflictingFinishTime.length +
            ` Section${
              SectionsWithConflictingFinishTime.length > 1
                ? "s that finish"
                : " that finish"
            } after ` +
            intToTime(PEndTime);
          Suggestions.push(
            "Set preferred finish time to " + intToTime(EarliestSectionEndTime)
          );
        }
        throw new Error(
          `No available sections${
            CourseFilterObject.SeatsFilter ? " with available seats" : ""
          } for selected electives that applies with given filter!\n` +
            Reasons +
            "\n" +
            Suggestions.join("\n or ")
        );
      } else {
        if (NumberOfNulls == Sections.length)
          throw new Error(
            `All ${
              CourseSubject + CourseCode
            } sections had Null Start/End Times`
          );
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
        if (
          SectionsWithConflictingStartTime.length == NumberOfSectionsWithProf
        ) {
          CoursesWithAllStartConflict.push({
            CourseName: CourseSubject + CourseCode,
            Time: LatestSectionBeginTime
          });
          continue;
        }
        // throw new Error(
        //   `All ${
        //     CourseSubject + CourseCode
        //   } sections start before ${intToTime(
        //     PStartTime
        //   )}\n Suggestion: Set preferred start time to ${intToTime(
        //     LatestSectionBeginTime
        //   )}`
        // );
        if (
          SectionsWithConflictingFinishTime.length == NumberOfSectionsWithProf
        ) {
          CoursesWithAllEndConflict.push({
            CourseName: CourseSubject + CourseCode,
            Time: EarliestSectionEndTime
          });
          continue;
        }
        // throw new Error(
        //   `All ${
        //     CourseSubject + CourseCode
        //   } sections finish after ${intToTime(
        //     PEndTime
        //   )}\n Suggestion: Set preferred end time to ${intToTime(
        //     EarliestSectionEndTime
        //   )}`
        // );
        let Suggestions = [];
        let SuggestedEndTime = false;
        if (SectionsWithConflictingStartTime != 0) {
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            SectionsWithConflictingStartTime.length +
            ` Section${
              SectionsWithConflictingStartTime.length > 1
                ? "s that start"
                : " that starts"
            } before ` +
            intToTime(PStartTime) +
            ": " +
            SectionsWithConflictingStartTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ");
          Suggestions.push(
            "Set preferred start time to " + intToTime(LatestSectionBeginTime)
          );
        }
        if (SectionsWithConflictingFinishTime != 0) {
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            SectionsWithConflictingFinishTime.length +
            ` Section${
              SectionsWithConflictingFinishTime.length > 1
                ? "s that end"
                : " that ends"
            } after ` +
            intToTime(PEndTime) +
            ": " +
            SectionsWithConflictingFinishTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ");
          Suggestions.push(
            "Set preferred end time to " + intToTime(EarliestSectionEndTime)
          );
          SuggestedEndTime = true;
        }
        if (SectionsWithConflictingFinishLabTime != 0) {
          Reasons +=
            (Reasons != "" ? "\n" : "") +
            SectionsWithConflictingFinishLabTime.length +
            ` Lab${
              SectionsWithConflictingFinishLabTime.length > 1
                ? "s that end"
                : " that ends"
            } after ` +
            intToTime(PEndTime) +
            ": " +
            SectionsWithConflictingFinishLabTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ");
          if (!SuggestedEndTime) {
            Suggestions.push(
              "Set preferred end time to " + intToTime(EarliestSectionEndTime)
            );
          }
        }
        throw new Error(
          `No available section for ${
            CourseSubject + CourseCode
          } that applies with given filter!\n` +
            Reasons +
            "\nSuggestions:\n" +
            Suggestions.join("\n or ")
        );
      }
    }
    if (NumberOfRecitations != 0) {
      //TODO: finish error handling on recitations
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
            ": " +
            RecitationsWithConflictingStartTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ") +
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
            ": " +
            RecitationsWithConflictingEndTime.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ") +
            (RecitationsWithConflictingStartTime.length != NumberOfRecitations
              ? "\nSuggestion: Set preferred end time to " +
                intToTime(EarliestRecitationEndTime)
              : "");
        throw new Error(
          `No available recitations for ${
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
            Available Sections:
            + ${ListOfFilteredSections.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ")}
            + "\nAvailable Recitations:"
            + ${ListOfFilteredRecitations.map(
              (Section) => `Section ${Section.Section} (${Section.CRN})`
            ).join(" - ")}`);
      }
      //TODO: finish error handling in this case
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
  let Suggestions = [];
  let CourseNamesThatStartBefore = [];
  let SuggestedStartTime = null;
  let CourseNamesThatFinishAfter = [];
  let SuggestedEndTime = null;
  if (CoursesWithAllStartConflict.length) {
    for (let CObject of CoursesWithAllStartConflict) {
      CourseNamesThatStartBefore.push(CObject.CourseName);
      if (!SuggestedStartTime || CObject.Time < SuggestedStartTime)
        SuggestedStartTime = CObject.Time;
    }
    throw new Error(
      `All sections for ${printArrayOfProfessors(
        CourseNamesThatStartBefore
      )} start before ${intToTime(PStartTime)}\n` +
        `Set preferred start time to ${intToTime(SuggestedStartTime)}`
    );
  }
  if (CoursesWithAllEndConflict.length) {
    for (let CObject of CoursesWithAllEndConflict) {
      CourseNamesThatFinishAfter.push(CObject.CourseName);
      if (!SuggestedEndTime || CObject.Time > SuggestedEndTime)
        SuggestedEndTime = CObject.Time;
    }
    throw new Error(
      `All sections for ${printArrayOfProfessors(
        CourseNamesThatFinishAfter
      )} finish after ${intToTime(PEndTime)}\n` +
        `Set preferred end time to ${intToTime(SuggestedEndTime)}`
    );
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
 * 3- ProfessorFilter Array of string: e.g., ['Louay Bazzi', 'Ibrahim Issa'] contains names of selected professors,
 * if left empty then no professor is filtered out
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
  var ConvertedSections = [];
  var AllFilteredSections = [];
  var AllSections = [];
  if (CourseFilterObjects.length != 0) {
    ConvertedSections = await convertCourseNamesToSections(
      Term,
      CourseFilterObjects,
      PStartTime,
      PEndTime
    );
    AllFilteredSections = ConvertedSections[0];
    AllSections = ConvertedSections[1];
  } else {
  }
  let num = 1;
  for (let ArraySection of AllFilteredSections) {
    var sum = 0;
    for (let Section of ArraySection) {
      sum +=
        Section.LinkedSections.length == 0 ? 1 : Section.LinkedSections.length;
    }
    num *= sum;
  }
  if (num > 20000)
    throw new Error(
      ` Will not calculate ${num} schedules, use filters to lower amount of perms to get below 15000 schedules`
    );
  SetSections = SetSections.concat(CustomSections);
  checkIfConflictingArray(SetSections, PStartTime, PEndTime);
  var [MaxTime, MinTime, DayOccurences] = getMaxMinDO(SetSections);
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
      } else if (Max - Min === LeastTimeDif && PermWithLeastDays) {
        let CurrentDO = getMaxMinDO(ArrayOfPermutations[PermWithLeastDays])[2];
        if (getDayDif(DO) > getDayDif(CurrentDO)) PermWithLeastTimeDif = size;
      }
      if (getDayDif(DO) > MostDayDif) {
        MostDayDif = getDayDif(DO);
        PermWithLeastDays = size;
      } else if (getDayDif(DO) === MostDayDif && PermWithLeastDays) {
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
        let Available = false;
        for (let Section of AllSections[index]) {
          if (check(Perm, Section)) {
            if (isLinked(Section)) {
              for (let Recitation of Section.LinkedSections) {
                if (check(Perm, Recitation)) {
                  Available = true;
                  getPermsRecursionForAllSections(
                    Perm.concat(Section, Recitation),
                    getMinTime(Section, Min, Recitation),
                    getMaxTime(Section, Max, Recitation),
                    getDayOccurences(Section, DO, Recitation),
                    index + 1
                  );
                }
              }
            } else {
              Available = true;
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
        if (!Available)
          throw new Error(
            `No Section for ${
              AllSections[index][0].Subject + AllSections[index][0].Code
            } that fits with your schedule`
          );
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
        "No Permutations with the given sections available, full conflict"
      );
    } else {
      let CoursesWithSeatsFilter = [];
      let FilteredProfessorsForEachCourse = {};
      for (let CourseFilterObject of CourseFilterObjects) {
        if (CourseFilterObject.Elective) continue;
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
          if (SetSections.includes(Section)) continue;
          if (
            CoursesWithSeatsFilter.includes(Section.Subject + Section.Code) &&
            Section.SeatsA <= 0
          )
            validSeats = false;
          if (
            FilteredProfessorsForEachCourse[Section.Subject + Section.Code] &&
            !FilteredProfessorsForEachCourse[
              Section.Subject + Section.Code
            ].includes(Section.IName + " " + Section.ISName) &&
            !isRecitation(Section)
          )
            validProfs = false;
        }
        if (validSeats && validProfs) {
          let [PermMax, PermMin] = getMaxMinDO(Permutation);
          let ErrorMessage = "No Permutations Available:\n";
          if (PermMin < PStartTime && PStartTime)
            ErrorMessage +=
              "Suggestion: Set Preferred StartTime to " +
              intToTime(PermMin) +
              "\n";
          if (PermMax > PEndTime && PEndTime)
            ErrorMessage +=
              "Suggestion: Set Preferred EndTime to " + intToTime(PermMax);
          throw new Error(ErrorMessage);
        }
        if (validSeats) PermutationsWithSeatAvailability.push(Permutation);
      }
      if (PermutationsWithSeatAvailability.length != 0) {
        let MinNumberOfProfessorsToChange = 1000;
        let ArrayOfListOfAvailableUnselectedProfessorsPerCourse = [];
        for (let Permutation of PermutationsWithSeatAvailability) {
          let UnselectedProfessorsPerCourse = [];
          for (let Section of Permutation) {
            if (SetSections.includes(Section)) continue;
            if (
              FilteredProfessorsForEachCourse[Section.Subject + Section.Code] &&
              !FilteredProfessorsForEachCourse[
                Section.Subject + Section.Code
              ].includes(Section.IName + " " + Section.ISName) &&
              !isRecitation(Section)
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
          }
          if (
            UnselectedProfessorsPerCourse.length < MinNumberOfProfessorsToChange
          ) {
            MinNumberOfProfessorsToChange =
              UnselectedProfessorsPerCourse.length;
            ArrayOfListOfAvailableUnselectedProfessorsPerCourse = [
              UnselectedProfessorsPerCourse
            ];
          } else if (
            UnselectedProfessorsPerCourse.length ==
            MinNumberOfProfessorsToChange
          )
            ArrayOfListOfAvailableUnselectedProfessorsPerCourse.push(
              UnselectedProfessorsPerCourse
            );
        }
        let ProfessorsToChange = "";
        let AddedUnselectedProfessors = [];
        let count = 1;
        for (
          let i = 1;
          i < ArrayOfListOfAvailableUnselectedProfessorsPerCourse.length;
          i++
        ) {
          let AvailableUnselectedProfessorsPerCourse =
            ArrayOfListOfAvailableUnselectedProfessorsPerCourse[i];
          AvailableUnselectedProfessorsPerCourse.sort((a, b) =>
            a.localeCompare(b)
          );
          if (
            !AddedUnselectedProfessors.includes(
              JSON.stringify(AvailableUnselectedProfessorsPerCourse)
            )
          ) {
            ProfessorsToChange += count + ": ";
            count++;
            AddedUnselectedProfessors.push(
              JSON.stringify(AvailableUnselectedProfessorsPerCourse)
            );
            ProfessorsToChange +=
              AvailableUnselectedProfessorsPerCourse.map((x) =>
                x.split(":").join(": ")
              ).join(";\t") + "\n";
          }
          if (count == 7) break;
        }
        throw new Error(
          "No Permutations Available:\nSuggestion: Select any of the following combination of professors\n" +
            ProfessorsToChange
        );
      }
      throw new Error("No Permutations Exist: Must Change Courses!");
    }
  }
  return ArrayOfPermutations;
}
module.exports.getPermutations = getPermutations;
