MysqlClient = require("../database/MysqlClient")

class PacientSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(user, pacient) {
        var httpCode = 201
        console.log("Starting to query")
        try {
            const addressID = await this.addressQuery(pacient)
            console.log("Address query OK, id is: " + addressID)
            const symptomsIDs = await this.symptomsQuery(pacient)
            console.log("Symptoms query OK, id is: " + JSON.stringify(symptomsIDs))
                    /*await reportQuery(async reportID => {
                        console.log("Report query OK")
                        await reportSymptomsQuery(reportID, symptomsID, async () => { 
                            console.log("Report Symptoms query OK")
                        })
                        await pacientQuery(pacient, user, addressID, reportID, async () => {
                            console.log("Pacient query OK")
                            return httpCode
                        })
                    })
               */
        } catch (err) {
            throw err
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

    async addressQuery(pacient) {
        console.log("Querying address")
        const addressQuery = `INSERT INTO addresses (street, number, neighborhood, reference_unit) VALUES ('${pacient.address.street}', '${pacient.address.number}', '${pacient.address.neighborhood}', '${pacient.address.reference_unit}')`
        const resultAddress = await this.client.query(addressQuery)
        return resultAddress.insertId
    }

    async reportQuery() {
        console.log("Querying report")
        const reportQuery = `INSERT INTO reports (data_origin, comorbidity, covid_exam, covid_result, situation, notification_date, symptoms_start_date) VALUES '${pacient.report.data_origin}', '${pacient.report.comorbidity}', '${pacient.report.covid_exam}', '${pacient.report.covid_result}', '${pacient.report.situation}', '${pacient.report.notification_date}', '${pacient.report.symptoms_start_date}'`
        const resultReport = await this.client.query(reportQuery)
        return resultReport.insertId
    }

    async symptomsQuery(pacient) {
        console.log("Querying symptoms")
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
        console.log("Querying report symptoms")
        var query
        await symptomsID.forEach(async element => {
            query = `INSERT INTO report_symptom (report_ID, symptom_ID) VALUES '${reportID}', '${element}'`
            await this.client.query(query)
        })
    }

    async pacientQuery(pacient, user, addressID, reportID) {
        console.log("Querying pacient")
        const pacientQuery = `INSERT INTO pacients (cpf, name, mother_name, sex, sex_orientation, phone_number, birth_date, address_ID, report_ID, user) VALUES '${pacient.cpf}', '${pacient.name}', '${pacient.mother_name}', '${pacient.sex}', '${pacient.sex_orientation}', '${pacient.phone_number}', '${pacient.birth_date}', '${addressID}', '${reportID}', '${user.username}'`
        await this.client.query(pacientQuery)
    }
}

module.exports = PacientSerializer