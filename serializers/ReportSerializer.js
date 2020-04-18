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

    async update(cpf, report) {
        const reportIDQuery = `SELECT report_ID AS value FROM pacients WHERE cpf = '${cpf}'`
        const report_ID_result = await this.client.query(reportIDQuery)
        const report_ID = report_ID_result[0].value
        if (report.data_origin) await this.updateReport(report_ID, "data_origin", report.data_origin)
        if (report.comorbidity) await this.updateReport(report_ID, "comorbidity", report.comorbidity)
        if (report.covid_exam) await this.updateReport(report_ID, "covid_exam", report.covid_exam === true ? 1 : 0)
        if (report.covid_result) await this.updateReport(report_ID, "covid_result", report.covid_result)
        if (report.situation) await this.updateReport(report_ID, "situation", report.situation)
        if (report.notification_date) await this.updateReport(report_ID, "notification_date", report.notification_date)
        if (report.symptoms_start_date) await this.updateReport(report_ID, "symptoms_start_date", report.symptoms_start_date)

        return report_ID
    }

    async updateReport(report_ID, columnName, value) {
        const query = `UPDATE reports SET ${columnName}='${value}' WHERE report_ID='${report_ID}'`
        await this.client.query(query)
    }

    async find(report_ID) {
        const reportsQuery = `SELECT data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date FROM reports WHERE report_ID = '${report_ID}'`
        const reports = await this.client.query(reportsQuery)
        if (!reports.length) return {status: 500}

        return reports[0]
    }
}

module.exports = ReportSerializer