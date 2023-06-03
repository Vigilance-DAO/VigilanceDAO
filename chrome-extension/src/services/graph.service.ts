import { request, gql } from 'graphql-request'

export default class TheGraph {
    static ENDPOINT = process.env.REACT_APP_THEGRAPH_URL

    static _sendRequest(query: string) {
        request(TheGraph.ENDPOINT, query).then((data) => console.log('graph', data)).catch(err => console.log('graph err', err))
    }

    static getReports() {
        const query = gql`
            {
                reports(first: 5) {
                    id
                    domain
                    isScam
                    reporter
                }
            }
            `
        return this._sendRequest(query)
    }
}