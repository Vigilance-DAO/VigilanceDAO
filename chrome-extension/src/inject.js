const mixpanel = require("mixpanel-browser")
const { ethers } = require("ethers")
const EthDater = require("ethereum-block-by-date")
const { MIXPANEL_PROJECT_ID, projectId, API_KEY, MUMBAI_RPC_URL } = require("../constants")

async function getCountFor30days(todayDate, toAddress, options) {
  var lastMonth = new Date(todayDate)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const dd = String(lastMonth.getDate()).padStart(2, "0")
  const mm = String(lastMonth.getMonth() + 1).padStart(2, "0")
  const yyyy = lastMonth.getFullYear()
  const startDate = yyyy + "-" + mm + "-" + dd

  await fetch(
    `https://cors-everywhere-8awq.onrender.com/https://mixpanel.com/api/2.0/events/properties?project_id=${projectId}&event=Transaction&name=toAddress&values=%5B%22${toAddress}%22%5D&type=unique&unit=year&from_date=${startDate}&to_date=${todayDate}&format=json`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      if (response["data"]["values"][toAddress] == undefined) {
        console.log("No Transactions in the last 30 days")
      } else {
        console.log(
          "Transactions in the last 30 days: " +
            response["data"]["values"][toAddress][startDate]
        )
      }
    })
    .catch((err) => console.error(err))
}

async function getCountFor24hours(todayDate, toAddress, options) {
  var yesterday = new Date(todayDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const dd = String(yesterday.getDate()).padStart(2, "0")
  const mm = String(yesterday.getMonth() + 1).padStart(2, "0")
  const yyyy = yesterday.getFullYear()
  const startDate = yyyy + "-" + mm + "-" + dd

  await fetch(
    `https://cors-everywhere-8awq.onrender.com/https://mixpanel.com/api/2.0/events/properties?project_id=${projectId}&event=Transaction&name=toAddress&values=%5B%22${toAddress}%22%5D&type=unique&unit=month&from_date=${startDate}&to_date=${todayDate}&format=json`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      if (response["data"]["values"][toAddress] == undefined) {
        console.log("No Transactions in the last 24 hours")
      } else {
        console.log(
          "Transactions in the last 24 hours: " +
            response["data"]["values"][toAddress][startDate]
        )
      }
    })
    .catch((err) => console.error(err))
}

async function getDrainedAccounts(today, toAddress, options) {
  var count = 0

  var dd = String(today.getUTCDate()).padStart(2, "0")
  var mm = String(today.getUTCMonth() + 1).padStart(2, "0")
  var yyyy = today.getUTCFullYear()
  var todayDate = yyyy + "-" + mm + "-" + dd

  var lastWeek = new Date(todayDate)
  lastWeek.setDate(lastWeek.getDate() - 7)
  dd = String(lastWeek.getDate()).padStart(2, "0")
  mm = String(lastWeek.getMonth() + 1).padStart(2, "0")
  yyyy = lastWeek.getFullYear()
  startDate = yyyy + "-" + mm + "-" + dd
  var Accounts

  await fetch(
    `https://cors-everywhere-8awq.onrender.com/https://data.mixpanel.com/api/2.0/export?project_id=${projectId}&from_date=${startDate}&to_date=${todayDate}&event=%5B%22Transaction%22%5D&where=properties%5B%22toAddress%22%5D%20%3D%3D%20%22${toAddress}%22`,
    options
  )
    .then((response) => response.text())
    .then((text) => {
      const lines = text.split("\n")
      lines.pop()
      Accounts = lines.map((line) => {
        const data = JSON.parse(line)
        return [data.properties.$user_id, data.properties.time]
      })
    })
    .catch((err) => console.error(err))

  const provider = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL)

  const dater = new EthDater(provider)

  const balanceCheckPromises = Accounts.map(async (account) => {
    const startTime = new Date(account[1] * 1000)
    const endTime = new Date((account[1] + 10 * 60) * 1000)

    const startBlock = await dater.getDate(startTime, true)
    const endBlock = await dater.getDate(endTime)

    const startBalance = await provider.getBalance(
      account[0],
      startBlock.block
    )
    const endBalance = await provider.getBalance(account[0], endBlock.block)

    if (endBalance.isZero() && !startBalance.isZero()) {
      count++
    }
  })

  await Promise.all(balanceCheckPromises)

  console.log("Drained Accounts in the last 7 days: " + count)
}

function checkAddress(toAddress) {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, "0")
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const yyyy = today.getFullYear()
  const todayDate = yyyy + "-" + mm + "-" + dd

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: API_KEY,
    },
  }

  getCountFor30days(todayDate, toAddress, options)
  getCountFor24hours(todayDate, toAddress, options)
  getDrainedAccounts(today, toAddress, options)
}

(function() {
  const metamaskRequest = window.ethereum.request
  window.ethereum.request = async (params) => {
    if (params.method === "eth_sendTransaction") {
      const { to, from, value, data } = params.params[0]
      checkAddress(to)

      mixpanel.init(MIXPANEL_PROJECT_ID, { debug: true })
      mixpanel.identify(from)
      mixpanel.track("Transaction", {
        toAddress: to,
        value: value,
        data: data,
      })
    }
    return await metamaskRequest({ ...params })
  }
})()
