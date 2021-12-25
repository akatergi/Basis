class Course{
    constructor(Term, CRN, Subject, Code, Section, Title, CH, BH, College, SeatsT, SeatsA, BT1, ET1, Buil1, R1, Schedule1, BT2, ET2, Buil2, R2, Schedule2, IName, ISName, LCRN) {
        this.Term = Term
        this.CRN = CRN
        this.Subject = Subject
        this.Code = Code
        this.Section = Section
        this.Title = Title
        this.CH = CH
        this.BH = BH
        this.College = College
        this.SeatsT = SeatsT
        this.SeatsA = SeatsA
        this.BT1 = BT1
        this.ET1 = ET1
        this.Buil1 = Buil1
        this.R1 = R1
        this.Schedule1 = Schedule1
        this.BT2 = BT2
        this.ET2 = ET2
        this.Buil2 = Buil2
        this.R2 = R2
        this.Schedule2 = Schedule2
        this.IName = IName
        this.ISName = ISName
        this.LCRN = LCRN
    }
}

// export {Course}
module.exports.Course = Course