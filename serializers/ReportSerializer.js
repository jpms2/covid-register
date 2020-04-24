PacientReportSerializer = require("./PacientReportSerializer")
SymptomsSerializer = require("./SymptomsSerializer")
ReportSymptomSerializer = require("./ReportSymptomSerializer")

class ReportSerializer {
    client;
    pacientReportSerializer

    constructor(mysqlClient) {
        this.client = mysqlClient
        this.pacientReportSerializer = new PacientReportSerializer(mysqlClient)
        this.symptomsSerializer = new SymptomsSerializer(mysqlClient)
        this.reportSymptomSerializer = new ReportSymptomSerializer(mysqlClient)
    }

    async create(cpf, report) {
        const reportQuery = this.reportQuery(report)
        const values = this.reportQueryValues(report)
        const resultReport = await this.client.query(reportQuery, values)
        await this.pacientReportSerializer.create(cpf, resultReport.insertId)
        
        return resultReport.insertId
    }

    async createSubsequent(cpf, report) {
        var httpCode = await this.verifyPacientExistence(cpf)
        if (httpCode === 409) return httpCode

        try {
            const reportQuery = this.reportQuery(report)
            const values = this.reportQueryValues(report)
            const resultReport = await this.client.query(reportQuery, values)
            const symptomsIDs = await this.symptomsSerializer.create(resultReport.insertId, report.symptoms)
            await this.pacientReportSerializer.create(cpf, resultReport.insertId)
            await this.reportSymptomSerializer.create(resultReport.insertId, symptomsIDs)
            console.log("Finished saving new report")

            return httpCode
        } catch (err) {
            console.log ('error', err.message, err.stack)
            return 500
        }
    }

    reportQuery(report) {
        if (report.covid_exam) {
            return `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES (?, ?, ?, ?, ?, ?, ?)`
        } else {
            return `INSERT INTO reports (data_origin, comorbidity, covid_exam, situation, notification_date, symptoms_start_date) VALUES (?, ?, ?, ?, ?, ?)`
        }
    }

    reportQueryValues(report) {
        if (report.covid_exam) {
            return [report.data_origin, report.comorbidity, report.covid_exam === true ? 1 : 0, report.covid_result, report.situation, report.notification_date, report.symptoms_start_date]
        } else {
            return [report.data_origin, report.comorbidity, report.covid_exam === true ? 1 : 0, report.situation, report.notification_date, report.symptoms_start_date]
        }
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
        const query = `UPDATE reports SET ${columnName}=? WHERE report_ID=?`
        const values = [value, report_ID]

        await this.client.query(query, values)
    }

    async find(report_ID) {
        const reportsQuery = `SELECT * FROM reports WHERE report_ID = ?`
        const values = [report_ID]
        const reports = await this.client.query(reportsQuery, values)
        if (!reports.length) return {status: 500}

        return reports[0]
    }

    async verifyPacientExistence(cpf) {
        const verifyQuery = ` SELECT cpf FROM pacients WHERE cpf = ?`
        const values = [cpf]
        const result = await this.client.query(verifyQuery, values)

        return result.length ? 201 : 409
    }
}

module.exports = ReportSerializer