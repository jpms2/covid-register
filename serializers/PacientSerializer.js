MysqlClient = require("../database/MysqlClient")
ReportSerializer = require("./ReportSerializer")
AddressSerializer = require("./AddressSerializer")
SymptomsSerializer = require("./SymptomsSerializer")
ReportSymptomSerializer = require("./ReportSymptomSerializer")
PacientReportSerializer = require("./PacientReportSerializer")

class PacientSerializer {
    client;
    reportSerializer
    addressSerializer
    symptomsSerializer
    reportSymptomSerializer
    pacientReportSerializer

    constructor(mysqlClient) {
        this.client = mysqlClient
        this.reportSerializer = new ReportSerializer(mysqlClient)
        this.addressSerializer = new AddressSerializer(mysqlClient)
        this.symptomsSerializer = new SymptomsSerializer(mysqlClient)
        this.reportSymptomSerializer = new ReportSymptomSerializer(mysqlClient)
        this.pacientReportSerializer = new PacientReportSerializer(mysqlClient)
    }

    async create(user, pacient) {
        var httpCode
        try {
            httpCode = await this.verifyPacientExistence(pacient.cpf)

            if (httpCode === 409) {
                return httpCode
            }

            const addressID = await this.addressSerializer.create(pacient.address)
            const symptomsIDs = await this.symptomsSerializer.create(pacient.report.symptoms)
            const reportID = await this.reportSerializer.create(pacient.cpf, pacient.report)
            await this.pacientQuery(pacient, user, addressID, reportID)
            await this.reportSymptomSerializer.create(reportID, symptomsIDs)
            console.log("A new pacient has been recorded")

            return httpCode
        } catch (err) {
            console.log ('error', err.message, err.stack)
            return 500
        }
    }

    async verifyPacientExistence(cpf) {
        const verifyQuery = ` SELECT cpf FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)

        return !result.length ? 201 : 409
    }

    async pacientQuery(pacient, user, addressID, reportID) {
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES ('${pacient.cpf}', '${pacient.name}', '${pacient.mother_name}', '${pacient.sex}', '${pacient.sex_orientation}', '${pacient.phone_number}', '${pacient.birth_date}', '${addressID}', '${reportID}', '${user}')`
        const result = await this.client.query(pacientQuery)

        return result.insertId
    }

    async update(pacient) {
        if (!pacient.cpf) return 409
        try {
            if (pacient.name) await this.updatePacient(pacient.cpf, "name", pacient.name)
            if (pacient.mother_name) await this.updatePacient(pacient.cpf, "mother_name", pacient.mother_name)
            if (pacient.sex) await this.updatePacient(pacient.cpf, "sex", pacient.sex)
            if (pacient.sex_orientation) await this.updatePacient(pacient.cpf, "sex_orientation", pacient.sex_orientation)
            if (pacient.phone_number) await this.updatePacient(pacient.cpf, "phone_number", pacient.phone_number)
            if (pacient.birth_date) await this.updatePacient(pacient.cpf, "birth_date", pacient.birth_date)

            if (pacient.address) {
                this.addressSerializer.update(pacient.cpf, pacient.address)
            }

            if (pacient.reports) {
                for (const report of pacient.reports) {
                    await this.reportSerializer.update(report)
                    if(report.symptoms) {
                        const symptomsIDs = await this.symptomsSerializer.create(report.symptoms)
                        await this.reportSymptomSerializer.create(report.report_ID, symptomsIDs)
                    }
                }
            }
        } catch(err) {
            console.log ('error', err.message, err.stack)
            return 500
        }

        console.log("A pacient has been updated")
        return 201
    }

    async updatePacient(cpf, columnName, value) {
        const query = `UPDATE pacients SET ${columnName}='${value}' WHERE cpf='${cpf}' `
        await this.client.query(query)
    }

    async find(cpf) {
        const verifyQuery = ` SELECT * FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)
        if (!result.length) return {status: 409}
        var pacient = result[0]

        const address = await this.addressSerializer.find(pacient.address_ID)
        if (address.status) return {status: 500}
        pacient.address = address

        const report_IDs = await this.pacientReportSerializer.find(pacient.cpf)

        var reports = []

        for (const element of report_IDs) {
            var report = await this.reportSerializer.find(element.report_ID)
            if (report.status) return {status: 500}

            report.symptoms = []

            const symptomIDs = await this.reportSymptomSerializer.find(element.report_ID)

            const symptoms = await this.symptomsSerializer.find(symptomIDs)
            report.symptoms = symptoms

            report.covid_exam = report.covid_exam == 1

            reports.push(report)
        }

        pacient.reports = reports

        return {status : 200, pacient: pacient}
    }

    async list(list) {
        const totalPacientsQuery = `SELECT COUNT(*) AS pacientsCount FROM pacients`
        const totalPacients = await this.client.query(totalPacientsQuery)
        const offset = list.page_size * (list.page_index - 1)
        var listQuery = `SELECT pac.cpf, pac.name, addr.reference_unit, rep.notification_date FROM pacients AS pac INNER JOIN addresses AS addr ON pac.address_ID = addr.address_ID INNER JOIN reports AS rep ON pac.report_ID = rep.report_ID`
        
        if (list.order_by) {
            var orderBy
            switch (list.order_by) {
                case "cpf":
                    orderBy = "pac." + list.order_by
                    break
                case "name":
                    orderBy = "pac." + list.order_by
                    break
                case "reference_unit":
                    orderBy = "addr." + list.order_by
                    break
                case "notification_date":
                    orderBy = "rep." + list.order_by
                    break;
                default:
                    console.log("No implementation for this ordenation")
                    break;
            }
            listQuery = listQuery + ` ORDER BY ${list.order_by}`
        }

        listQuery = listQuery + ` LIMIT ${list.page_size} OFFSET ${offset}`
        const result = await this.client.query(listQuery)

        return {total_pacients: totalPacients[0].pacientsCount, pacients: result}
    }
}

module.exports = PacientSerializer