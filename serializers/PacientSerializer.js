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
            const reportID = await this.reportSerializer.create(pacient.cpf, pacient.report)
            const symptomsIDs = await this.symptomsSerializer.create(reportID, pacient.report.symptoms)
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
        const verifyQuery = ` SELECT cpf FROM pacients WHERE cpf = ?`
        const values = [cpf]
        const result = await this.client.query(verifyQuery, values)

        return !result.length ? 201 : 409
    }

    async pacientQuery(pacient, user, addressID, reportID) {
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        const values = [pacient.cpf, pacient.name, pacient.mother_name, pacient.sex, pacient.sex_orientation, pacient.phone_number, pacient.birth_date, addressID, reportID, user]
        const result = await this.client.query(pacientQuery, values)

        return result.insertId
    }

    async update(pacient) {
        const existence = await this.verifyPacientExistence(pacient.cpf)
        if (!pacient.cpf) return 409
        if (existence === 201) return 409
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
                for (const reportObject of pacient.reports) {
                    const report = reportObject.report
                    await this.reportSerializer.update(report)
                    if(report.symptoms) {
                        const symptomsIDs = await this.symptomsSerializer.create(report.report_ID, report.symptoms)
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
        const query = `UPDATE pacients SET ${columnName}=? WHERE cpf=? `
        const values = [value, cpf]
        await this.client.query(query, values)
    }

    async find(cpf) {
        const verifyQuery = ` SELECT * FROM pacients WHERE cpf = ?`
        const values = [cpf]
        const result = await this.client.query(verifyQuery, values)
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

            reports.push({report: report})
        }

        pacient.reports = reports

        return {status : 200, pacient: pacient}
    }

    async list(list) {
        const totalPacientsQuery = `SELECT COUNT(*) AS pacientsCount FROM pacients`
        const totalPacients = await this.client.query(totalPacientsQuery)
        const offset = list.page_size * (list.page_index - 1)
        var listQuery = `SELECT pac.cpf, pac.name, addr.reference_unit, rep.notification_date FROM pacients AS pac INNER JOIN addresses AS addr ON pac.address_ID = addr.address_ID INNER JOIN reports AS rep ON pac.report_ID = rep.report_ID`

        if (list.filter_by) {
            listQuery = listQuery + this.addFilterByQuery(list.filter_by)
        }

        if (list.order_by) {
            listQuery = listQuery + this.addOrderByQuery(list.order_by)
        }

        listQuery = listQuery + ` LIMIT ${list.page_size} OFFSET ${offset}`
        console.log(listQuery)
        const result = await this.client.query(listQuery)

        return {total_pacients: totalPacients[0].pacientsCount, pacients: result}
    }

    addFilterByQuery(filter_by) {
        var filterBy
        if (filter_by.cpf) {
            filterBy = `WHERE pac.cpf LIKE '%${filter_by.cpf}%'` 
        }

        if (filter_by.name) {
            filterBy = filterBy + ` AND pac.name LIKE '%${filter_by.name}%'`
        }

        if (filter_by.reference_unit) {
            filterBy = filterBy + ` AND addr.reference_unit LIKE '%${filter_by.reference_unit}%'`
        }

        if (filter_by.notification_date) {
            filterBy = filterBy + ` AND addr.notification_date LIKE '%${filter_by.notification_date}%'`
        }

        return filterBy
    }

    addOrderByQuery(order_by) {
        var orderBy
            switch (order_by) {
                case "cpf":
                    orderBy = "pac." + order_by
                    break
                case "name":
                    orderBy = "pac." + order_by
                    break
                case "reference_unit":
                    orderBy = "addr." + order_by
                    break
                case "notification_date":
                    orderBy = "rep." + order_by
                    break;
                default:
                    console.log("No implementation for this ordenation")
                    break;
            }
            return ` ORDER BY ${order_by}`
    }
}

module.exports = PacientSerializer