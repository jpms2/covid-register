MysqlClient = require("../database/MysqlClient")

class PacientSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(user, pacient) {
        var httpCode = 201

        try {
            const addressID = await addressQuery()
            var symptomIDs = new Array()
            symptomsID = await symptomsQuery()

            
            const reportID = await reportQuery()
            await reportSymptomsQuery(reportID, symptomIDs)

            await pacientQuery(pacient, user, addressID, reportID)
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

    async addressQuery() {
        const addressQuery = `INSERT INTO addresses (street, number, neighborhood, reference_unit) VALUES ('${pacient.address.street}', '${pacient.address.number}', '${pacient.address.neighborhood}', '${pacient.address.reference_unit}')`
        const resultAddress = await this.client.query(addressQuery)
            return resultAddress.insertId
    }

    async reportQuery() {
        const reportQuery = `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES '${pacient.report.data_origin}', '${pacient.report.comorbidity}', '${pacient.report.covid_exam}', '${pacient.report.covid_result}', '${pacient.report.situation}', '${pacient.report.notification_date}', '${pacient.report.symptoms_start_date}'`
        const resultReport = await this.client.query(reportQuery)
        return resultReport.insertId
    }

    async symptomsQuery() {
        const symptomQueries = symptomQuery(pacient.report.symptoms)
        var symptomIDs = new Array()
        await symptomQueries.forEach(async element => {
            const resultSymptom = await this.client.query(element)
            symptomIDs.push(resultSymptom.insertId)
        })

        return symptomsIDs
    }

    symptomQuery(symptoms) {
        var query = new Array()

        symptoms.forEach(element => {
            query.push(`INSERT INTO symptoms (name) VALUES '${element.name}'`)
        });

        return query
    }

    async reportSymptomsQuery(reportID, symptomsID) {
        var query
        await symptomsID.forEach(async element => {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES '${reportID}', '${element}'`
            await this.client.query(query)
        })
    }

    async pacientQuery(pacient, user, addressID, reportID) {
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES '${pacient.cpf}', '${pacient.name}', '${pacient.mother_name}', '${pacient.sex}', '${pacient.sex_orientation}', '${pacient.phone_number}', '${pacient.birth_date}', '${addressID}', '${reportID}', '${user.username}'`
        await this.client.query(pacientQuery)
    }
}

module.exports = PacientSerializer