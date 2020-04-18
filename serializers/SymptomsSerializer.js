class SymptomsSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(symptoms) {
        const symptomQueries = this.symptomQuery(symptoms)
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

    async find(symptomIDs) {
        var symptoms = []

        for(var element in symptomIDs) {
            var symptomQuery = `SELECT name FROM symptoms WHERE symptom_ID = '${symptomIDs[element].symptom_ID}'`
            const symptom = await this.client.query(symptomQuery)
            symptoms.push(symptom[0])
        }

        return symptoms
    }
}

module.exports = SymptomsSerializer