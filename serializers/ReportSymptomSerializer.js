class ReportSymptomSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(reportID, symptomsID) {
        console.log("SymptomReportSerializer - Report ID listed for update is: " + reportID)
        var query
        var tableIDs = []

        for(var element in symptomsID) {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES ('${reportID}', '${symptomsID[element]}')`
            const id = await this.client.query(query)
            tableIDs.push(id.insertId)
        }

        return tableIDs
    }
}

module.exports = ReportSymptomSerializer