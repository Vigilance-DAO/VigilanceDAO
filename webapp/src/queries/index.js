export function FETCH_REPORTS(status) {
    return `query {
        reports(where: {status: "${status}"}) {
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
export function FETCH_OPEN_REPORTS() {
    return `query {
        reports(where: {status: null}) {
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
