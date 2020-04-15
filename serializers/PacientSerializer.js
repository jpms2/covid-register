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

            if (httpCode === 409) {
                return httpCode
            }

            const addressID = await this.addressQuery(pacient)
            const symptomsIDs = await this.symptomsQuery(pacient)
            const reportID = await this.reportQuery(pacient)
            await this.pacientQuery(pacient, user, addressID, reportID)
            await this.reportSymptomsQuery(reportID, symptomsIDs)

            return httpCode
        } catch (err) {
            console.log(JSON.stringify(err))
            return 500
        }
    }

    async find(cpf) {
        const verifyQuery = ` SELECT * FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)
        if (!result.length) return {status: 409}
        var pacient = result[0]

        const addressQuery = `SELECT * FROM addresses WHERE address_ID = '${pacient.address_ID}'`
        const address = await this.client.query(addressQuery)
        if (!address.length) return {status: 500}
        pacient.address = address[0]

        const reportsQuery = `SELECT * FROM reports WHERE report_ID = '${pacient.report_ID}'`
        const reports = await this.client.query(reportsQuery)
        if (!reports.length) return {status: 500}
        pacient.report = reports[0]

        pacient.report.symptoms = []
        const symptomsQuery = `SELECT symptom_ID FROM report_symptom WHERE report_ID = '${pacient.report_ID}'`
        const symptomIDs = await this.client.query(symptomsQuery)
        for(var element in symptomIDs) {
            console.log("Symptom id is: " + JSON.stringify(symptomIDs[element].symptom_ID))
            var symptomQuery = `SELECT name FROM symptoms WHERE symptom_ID = '${symptomIDs[element].symptom_ID}'`
            const symptom = await this.client.query(symptomQuery)
            console.log("Symptom is: " + JSON.stringify(symptom))
            pacient.report.symptoms.push(symptom[0])
        }

        delete pacient.address.addressID
        delete pacient.report_ID
        delete pacient.address_ID

        console.log("Pacient is: " + JSON.stringify(pacient))

        return {status : 200, pacient: pacient}
    }

    async verifyPacientExistence(cpf) {
        const verifyQuery = ` SELECT cpf FROM pacients WHERE cpf = '${cpf}'`
        const result = await this.client.query(verifyQuery)

        return !result.length ? 201 : 409
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
            const resultSymptom = await this.client.query(symptoms[element])
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
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES ('${pacient.cpf}', '${pacient.name}', '${pacient.mother_name}', '${pacient.sex}', '${pacient.sex_orientation}', '${pacient.phone_number}', '${pacient.birth_date}', '${addressID}', '${reportID}', '${user}')`
        const result = await this.client.query(pacientQuery)

        return result.insertId
    }
}

module.exports = PacientSerializer