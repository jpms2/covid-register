PacientReportSerializer = require("./PacientReportSerializer")

class ReportSerializer {
    client;
    pacientReportSerializer

    constructor(mysqlClient) {
        this.client = mysqlClient
        this.pacientReportSerializer = new PacientReportSerializer(mysqlClient)
    }

    async create(cpf, report) {
        const reportQuery = `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES ('${report.data_origin}', '${report.comorbidity}', '${report.covid_exam === true ? 1 : 0}', '${report.covid_result}', '${report.situation}', '${report.notification_date}', '${report.symptoms_start_date}')`
        const resultReport = await this.client.query(reportQuery)
        await this.pacientReportSerializer.create(cpf, resultReport.insertId)
        return resultReport.insertId
    }

    async update(report) {
        if (report.data_origin) await this.updateReport(report.report_ID, "data_origin", report.data_origin)
        if (report.comorbidity) await this.updateReport(report.report_ID, "comorbidity", report.comorbidity)
        if (report.covid_exam) await this.updateReport(report.report_ID, "covid_exam", report.covid_exam === true ? 1 : 0)
        if (report.covid_result) await this.updateReport(report.report_ID, "covid_result", report.covid_result)
        if (report.situation) await this.updateReport(report.report_ID, "situation", report.situation)
        if (report.notification_date) await this.updateReport(report.report_ID, "notification_date", report.notification_date)
        if (report.symptoms_start_date) await this.updateReport(report.report_ID, "symptoms_start_date", report.symptoms_start_date)
    }

    async updateReport(report_ID, columnName, value) {
        const query = `UPDATE reports SET ${columnName}='${value}' WHERE report_ID='${report_ID}'`
        await this.client.query(query)
    }

    async find(report_ID) {
        const reportsQuery = `SELECT * FROM reports WHERE report_ID = '${report_ID}'`
        const reports = await this.client.query(reportsQuery)
        if (!reports.length) return {status: 500}

        return reports[0]
    }
}

module.exports = ReportSerializer