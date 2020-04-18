class ReportSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(report) {
        const reportQuery = `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES ('${report.data_origin}', '${report.comorbidity}', '${report.covid_exam === true ? 1 : 0}', '${report.covid_result}', '${report.situation}', '${report.notification_date}', '${report.symptoms_start_date}')`
        const resultReport = await this.client.query(reportQuery)
        return resultReport.insertId
    }
}

module.exports = ReportSerializer