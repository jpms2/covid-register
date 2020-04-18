class ReportSymptomSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(reportID, symptomsID) {
        var query
        var tableIDs = []

        for(var element in symptomsID) {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES ('${reportID}', '${symptomsID[element]}')`
            const id = await this.client.query(query)
            tableIDs.push(id.insertId)
        }

        return tableIDs
    }

    async find(report_ID) {
        const symptomsQuery = `SELECT symptom_ID FROM report_symptom WHERE report_ID = '${report_ID}'`
        const symptomIDs = await this.client.query(symptomsQuery)

        return symptomIDs
    }
}

module.exports = ReportSymptomSerializer