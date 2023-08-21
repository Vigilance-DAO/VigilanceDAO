Inexhaustive possible testcases !!
    1. Set up the contracts
    2. Should be able to buy votes
    3. Should be able to report domains
        a. Should be minted with reward token if first report
    4. Should be able the generate a manual verification request
        a. Should fail for degenerate case of going with majority
        b. Else a successful request with taking a validation fee
    5. Validator with NFT should be able to validate
        a. When accepted fee refunded with reward token minting
        b. Else fee not refunded and sent to treasury, 
            also against voters votes slashed
    6. Should be able to withdraw votes
        a. Burn reward tokens at the same time