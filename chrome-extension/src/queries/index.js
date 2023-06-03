export function FETCH_REPORTS(count,address) {
    return `query {
        reports(first: ${count}, where: {reporter: "${address}"}) {
            id
            isScam
            reporter
            comments
            evidences
            createdon
            domain
            rewardAmount
            stakeAmount
            status
            updatedon
            validator
            validatorComments
          }
      }`;
}

export function FETCH_REPORTS_BY_DOMAIN(domain) {
    return `query {
        reports(
            orderBy: id
            orderDirection: desc
            where: {domain: "${domain}"}
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