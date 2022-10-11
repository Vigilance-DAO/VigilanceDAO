export function FETCH_REPORTS() {
    return `query {
        reports(first: 5) {
            id
            domain
            isScam
            reporter
            createdon
            evidences
            status
          }
      }`;
}

export function FETCH_REPORTS_BY_DOMAIN(domain) {
    return `query {
        reports(
            orderBy: id
            orderDirection: desc
            where: {domain: "${domain}", status: "ACCEPTED"}
            first:1
        ){
            id
            createdon
            comments
            evidences
            domain
            isScam
            reporter
            rewardAmount
            status
            stakeAmount
            updatedon
            validator
            validatorComments
        }
    }`;
}   