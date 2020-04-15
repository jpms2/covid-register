MysqlClient = require("../database/MysqlClient")

class PacientSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(user, pacient) {
        var httpCode
        try {
            httpCode = await this.verifyPacientExistence(pacient.cpf)

            const addressID = await this.addressQuery(pacient)
            console.log("Address query OK, id is: " + addressID)
            const symptomsIDs = await this.symptomsQuery(pacient)
            console.log("Symptoms query OK, id is: " + JSON.stringify(symptomsIDs))
            const reportID = await this.reportQuery(pacient)
            console.log("Report query OK, id is: " + reportID)
            const pacientID = await this.pacientQuery(pacient, user, addressID, reportID)
            console.log("Pacient query OK, id is: " + pacientID)
            const reportSymptomQuery = await this.reportSymptomsQuery(reportID, symptomsIDs)
            console.log("Report Symptoms query OK, id is: " + JSON.stringify(reportSymptomQuery))

            return httpCode
        } catch (err) {
            if (err.code && err.errno) {
                if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
                    httpCode = 409
                } else {
                    httpCode = 500
                }
            }

            return httpCode
        }
    }

    async verifyPacientExistence(cpf) {
        const verifyQuery = ` SELECT cpf FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)

        console.log("pacient select returned: " + result)
    }

    async addressQuery(pacient) {
        const addressQuery = `INSERT INTO addresses (street, number, neighborhood, reference_unit) VALUES ('${pacient.address.street}', '${pacient.address.number}', '${pacient.address.neighborhood}', '${pacient.address.reference_unit}')`
        const resultAddress = await this.client.query(addressQuery)
        return resultAddress.insertId
    }

    async reportQuery(pacient) {
        const reportQuery = `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES ('${pacient.report.data_origin}', '${pacient.report.comorbidity}', '${pacient.report.covid_exam}', '${pacient.report.covid_result}', '${pacient.report.situation}', '${pacient.report.notification_date}', '${pacient.report.symptoms_start_date}')`
        const resultReport = await this.client.query(reportQuery)
        return resultReport.insertId
    }

    async symptomsQuery(pacient) {
        const symptomQueries = this.symptomQuery(pacient.report.symptoms)
        var symptomIDs = []
        
        for(var element of symptomQueries) {
            const resultSymptom = await this.client.query(element)
            symptomIDs.push(resultSymptom.insertId)
        }

        return symptomIDs
    }

    symptomQuery(symptoms) {
        var query = []

        symptoms.forEach(element => {
            query.push(`INSERT INTO symptoms (name) VALUES ('${element.name}')`)
        });

        return query
    }

    async reportSymptomsQuery(reportID, symptomsID) {
        var query
        var tableIDs = []

        for(var element in symptomsID) {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES ('${reportID}', '${symptomsID[element]}')`
            const id = await this.client.query(query)
            tableIDs.push(id.insertId)
        }

        return tableIDs
    }

    async pacientQuery(pacient, user, addressID, reportID) {
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES ('${pacient.cpf}', '${pacient.name}', '${pacient.mother_name}', '${pacient.sex}', '${pacient.sex_orientation}', '${pacient.phone_number}', '${pacient.birth_date}', '${addressID}', '${reportID}', '${user.username}')`
        const result = await this.client.query(pacientQuery)

        return result.insertId
    }
}

module.exports = PacientSerializer