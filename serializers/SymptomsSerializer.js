class SymptomsSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(symptoms) {
        const symptomQueries = this.symptomQuery(symptoms)
        const values = this.symptomQueryValue(symptoms)
        var symptomIDs = []
        
        for(var element in symptomQueries) {
            const resultSymptom = await this.client.query(symptomQueries[element], values[element])
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

    symptomQueryValue(symptoms) {
        var values = []

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