class PacientReportSerializer {
    client;

    constructor(mysqlClient) {
        this.client = mysqlClient
    }

    async create(cpf, report_ID) {
        const query = `INSERT INTO pacient_report (pacient_ID, report_ID) VALUES ('${cpf}', '${report_ID}')`
        await this.client.query(query);
    }

    async find(cpf) {
        const query = `SELECT report_ID FROM  pacient_report WHERE pacient_ID = '${cpf}'`
        const reports = await this.client.query(query)

        return reports
    }
}

module.exports = PacientReportSerializer