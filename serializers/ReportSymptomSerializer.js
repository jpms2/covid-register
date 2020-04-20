class ReportSymptomSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(reportID, symptomsID) {
        var query
        var values
        var tableIDs = []

        if (!symptomsID) return tableIDs

        for(var element in symptomsID) {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES (?, ?)`
            values = [reportID, symptomsID[element]]
            const id = await this.client.query(query, values)
            tableIDs.push(id.insertId)
        }

        return tableIDs
    }

    async find(report_ID) {
        const symptomsQuery = `SELECT symptom_ID FROM report_symptom WHERE report_ID = ?`
        const values = [report_ID]
        const symptomIDs = await this.client.query(symptomsQuery, values)

        return symptomIDs
    }
}

module.exports = ReportSymptomSerializer