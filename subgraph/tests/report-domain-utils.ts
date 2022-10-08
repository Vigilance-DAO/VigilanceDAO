import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Initialized,
  OwnershipTransferred,
  Reported,
  Validated
} from "../generated/ReportDomain/ReportDomain"

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createReportedEvent(
  id: BigInt,
  domain: string,
  isScam: boolean,
  reporter: Address,
  createdOn: BigInt,
  evidences: string,
  comments: string,
  stakeAmount: BigInt
): Reported {
  let reportedEvent = changetype<Reported>(newMockEvent())

  reportedEvent.parameters = new Array()

  reportedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam("domain", ethereum.Value.fromString(domain))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam("isScam", ethereum.Value.fromBoolean(isScam))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam("reporter", ethereum.Value.fromAddress(reporter))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam(
      "createdOn",
      ethereum.Value.fromUnsignedBigInt(createdOn)
    )
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam("evidences", ethereum.Value.fromString(evidences))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam("comments", ethereum.Value.fromString(comments))
  )
  reportedEvent.parameters.push(
    new ethereum.EventParam(
      "stakeAmount",
      ethereum.Value.fromUnsignedBigInt(stakeAmount)
    )
  )

  return reportedEvent
}

export function createValidatedEvent(
  id: BigInt,
  domain: string,
  isScam: boolean,
  reporter: Address,
  validator: Address,
  updatedon: BigInt,
  validatorComments: string,
  status: string,
  rewardAmount: BigInt
): Validated {
  let validatedEvent = changetype<Validated>(newMockEvent())

  validatedEvent.parameters = new Array()

  validatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam("domain", ethereum.Value.fromString(domain))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam("isScam", ethereum.Value.fromBoolean(isScam))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam("reporter", ethereum.Value.fromAddress(reporter))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam("validator", ethereum.Value.fromAddress(validator))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedon",
      ethereum.Value.fromUnsignedBigInt(updatedon)
    )
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam(
      "validatorComments",
      ethereum.Value.fromString(validatorComments)
    )
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromString(status))
  )
  validatedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardAmount",
      ethereum.Value.fromUnsignedBigInt(rewardAmount)
    )
  )

  return validatedEvent
}
