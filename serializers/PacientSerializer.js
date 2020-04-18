MysqlClient = require("../database/MysqlClient")
ReportSerializer = require("./ReportSerializer")
AddressSerializer = require("./AddressSerializer")
SymptomsSerializer = require("./SymptomsSerializer")
ReportSymptomSerializer = require("./ReportSymptomSerializer")

class PacientSerializer {
    client;
    reportSerializer
    addressSerializer
    symptomsSerializer
    reportSymptomSerializer

    constructor(mysqlClient) {
        this.client = mysqlClient
        this.reportSerializer = new ReportSerializer(mysqlClient)
        this.addressSerializer = new AddressSerializer(mysqlClient)
        this.symptomsSerializer = new SymptomsSerializer(mysqlClient)
        this.reportSymptomSerializer = new ReportSymptomSerializer(mysqlClient)
    }

    async create(user, pacient) {
        var httpCode
        try {
            httpCode = await this.verifyPacientExistence(pacient.cpf)

            if (httpCode === 409) {
                return httpCode
            }

            const addressID = await this.addressSerializer.create(pacient.address)
            const symptomsIDs = await this.SymptomsSerializer.create(pacient.report.symptoms)
            const reportID = await this.reportSerializer.create(pacient.report)
            await this.pacientQuery(pacient, user, addressID, reportID)
            await this.reportSymptomSerializer.create(reportID, symptomsIDs)
            console.log("A new pacient has been recorded")

            return httpCode
        } catch (err) {
            console.log ('error', err.message, err.stack)
            return 500
        }
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
                const addressIDQuery = `SELECT address_ID AS value FROM pacients WHERE cpf = '${pacient.cpf}'`
                const address_ID_result = await this.client.query(addressIDQuery)
                const address_ID = address_ID_result[0].value
                if (pacient.address.street) await this.updateAddress(address_ID, "street", pacient.address.street)
                if (pacient.address.number) await this.updateAddress(address_ID, "number", pacient.address.number)
                if (pacient.address.complement) await this.updateAddress(address_ID, "complement", pacient.address.complement)
                if (pacient.address.neighborhood) await this.updateAddress(address_ID, "neighborhood", pacient.address.neighborhood)
                if (pacient.address.reference_unit) await this.updateAddress(address_ID, "reference_unit", pacient.address.reference_unit)
            }

            if (pacient.report) {
                const reportIDQuery = `SELECT report_ID AS value FROM pacients WHERE cpf = '${pacient.cpf}'`
                const report_ID_result = await this.client.query(reportIDQuery)
                const report_ID = report_ID_result[0].value
                if (pacient.report.data_origin) await this.updateReport(report_ID, "data_origin", pacient.report.data_origin)
                if (pacient.report.comorbidity) await this.updateReport(report_ID, "comorbidity", pacient.report.comorbidity)
                if (pacient.report.covid_exam) await this.updateReport(report_ID, "covid_exam", pacient.report.covid_exam === true ? 1 : 0)
                if (pacient.report.covid_result) await this.updateReport(report_ID, "covid_result", pacient.report.covid_result)
                if (pacient.report.situation) await this.updateReport(report_ID, "situation", pacient.report.situation)
                if (pacient.report.notification_date) await this.updateReport(report_ID, "notification_date", pacient.report.notification_date)
                if (pacient.report.symptoms_start_date) await this.updateReport(report_ID, "symptoms_start_date", pacient.report.symptoms_start_date)
            
                if(pacient.report.symptoms) {
                    const symptomsIDs = await this.symptomsQuery(pacient)
                    await this.reportSymptomsQuery(report_ID, symptomsIDs)
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

    async updateAddress(addressID, columnName, value) {
        const query = `UPDATE addresses SET ${columnName}='${value}' WHERE address_ID='${addressID}'`
        await this.client.query(query)
    }

    async updateReport(report_ID, columnName, value) {
        const query = `UPDATE reports SET ${columnName}='${value}' WHERE report_ID='${report_ID}'`
        await this.client.query(query)
    }

    async find(cpf) {
        const verifyQuery = ` SELECT * FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)
        if (!result.length) return {status: 409}
        var pacient = result[0]

        const addressQuery = `SELECT street, number, complement, neighborhood, reference_unit FROM addresses WHERE address_ID = '${pacient.address_ID}'`
        const address = await this.client.query(addressQuery)
        if (!address.length) return {status: 500}
        pacient.address = address[0]

        const reportsQuery = `SELECT data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date FROM reports WHERE report_ID = '${pacient.report_ID}'`
        const reports = await this.client.query(reportsQuery)
        if (!reports.length) return {status: 500}
        pacient.report = reports[0]

        pacient.report.symptoms = []
        const symptomsQuery = `SELECT symptom_ID FROM report_symptom WHERE report_ID = '${pacient.report_ID}'`
        const symptomIDs = await this.client.query(symptomsQuery)
        for(var element in symptomIDs) {
            var symptomQuery = `SELECT name FROM symptoms WHERE symptom_ID = '${symptomIDs[element].symptom_ID}'`
            const symptom = await this.client.query(symptomQuery)
            pacient.report.symptoms.push(symptom[0])
        }

        delete pacient.address.addressID
        delete pacient.report_ID
        delete pacient.address_ID
        pacient.report.covid_exam = pacient.report.covid_exam === 1

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
}

module.exports = PacientSerializer