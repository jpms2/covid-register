class SymptomsSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(reportID, symptoms) {
        const symptomQueries = this.symptomQuery(symptoms)
        const values = this.symptomQueryValue(symptoms)
        var symptomIDs = []
        
        const filteredSymptoms = await this.symptomsOf(reportID)
        for(var element in symptomQueries) {
            if (!filteredSymptoms.length || await this.symptomIsNotRepeated(filteredSymptoms, symptoms[element])) {
                const resultSymptom = await this.client.query(symptomQueries[element], values[element])
                symptomIDs.push(resultSymptom.insertId)
            }
        }

        return symptomIDs
    }

    async symptomsOf(reportID) {
        const query = `SELECT symptom_ID FROM report_symptom WHERE report_ID = ?`
        const values = [reportID]
        const result = this.client.query(query, values)

        return result
    }

    async symptomIsNotRepeated(filteredSymptoms, symptom) {
        for (const filteredSymptom of filteredSymptoms) {
            const query = `SELECT * FROM symptoms WHERE name = ? AND symptom_ID = ?`
            const values = [symptom.name, filteredSymptom.symptom_ID]
            const symptoms = await this.client.query(query, values)

            if (symptoms.length) return false
        }

        return true
    }

    symptomQuery(symptoms) {
        var query = []

        if (!symptoms || !symptoms.length) return query

        symptoms.forEach(element => {
            query.push(`INSERT INTO symptoms (name) VALUES ('${element.name}')`)
        });

        return query
    }

    symptomQueryValue(symptoms) {
        var values = []

        if (!symptoms || !symptoms.length) return values

        symptoms.forEach(element => {
            values.push([element.name])
        });

        return values
    }

    async find(symptomIDs) {
        var symptoms = []

        for(var element in symptomIDs) {
            var symptomQuery = `SELECT name FROM symptoms WHERE symptom_ID = ?`
            var values = [symptomIDs[element].symptom_ID]
            const symptom = await this.client.query(symptomQuery, values)
            symptoms.push(symptom[0])
        }

        return symptoms
    }
}

module.exports = SymptomsSerializer