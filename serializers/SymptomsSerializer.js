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
}

module.exports = SymptomsSerializer