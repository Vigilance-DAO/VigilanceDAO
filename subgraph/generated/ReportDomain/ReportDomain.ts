// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Initialized extends ethereum.Event {
  get params(): Initialized__Params {
    return new Initialized__Params(this);
  }
}

export class Initialized__Params {
  _event: Initialized;

  constructor(event: Initialized) {
    this._event = event;
  }

  get version(): i32 {
    return this._event.parameters[0].value.toI32();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Reported extends ethereum.Event {
  get params(): Reported__Params {
    return new Reported__Params(this);
  }
}

export class Reported__Params {
  _event: Reported;

  constructor(event: Reported) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get domain(): string {
    return this._event.parameters[1].value.toString();
  }

  get isScam(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }

  get reporter(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get createdOn(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get evidences(): string {
    return this._event.parameters[5].value.toString();
  }

  get comments(): string {
    return this._event.parameters[6].value.toString();
  }

  get stakeAmount(): BigInt {
    return this._event.parameters[7].value.toBigInt();
  }
}

export class Validated extends ethereum.Event {
  get params(): Validated__Params {
    return new Validated__Params(this);
  }
}

export class Validated__Params {
  _event: Validated;

  constructor(event: Validated) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get domain(): string {
    return this._event.parameters[1].value.toString();
  }

  get isScam(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }

  get reporter(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get validator(): Address {
    return this._event.parameters[4].value.toAddress();
  }

  get updatedon(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get validatorComments(): string {
    return this._event.parameters[6].value.toString();
  }

  get status(): string {
    return this._event.parameters[7].value.toString();
  }

  get rewardAmount(): BigInt {
    return this._event.parameters[8].value.toBigInt();
  }
}

export class ReportDomain extends ethereum.SmartContract {
  static bind(address: Address): ReportDomain {
    return new ReportDomain("ReportDomain", address);
  }

  getBalance(): BigInt {
    let result = super.call("getBalance", "getBalance():(uint256)", []);

    return result[0].toBigInt();
  }

  try_getBalance(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("getBalance", "getBalance():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isReported(domain: string, isScam: boolean): boolean {
    let result = super.call("isReported", "isReported(string,bool):(bool)", [
      ethereum.Value.fromString(domain),
      ethereum.Value.fromBoolean(isScam)
    ]);

    return result[0].toBoolean();
  }

  try_isReported(
    domain: string,
    isScam: boolean
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall("isReported", "isReported(string,bool):(bool)", [
      ethereum.Value.fromString(domain),
      ethereum.Value.fromBoolean(isScam)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  lockedAmount(): BigInt {
    let result = super.call("lockedAmount", "lockedAmount():(uint256)", []);

    return result[0].toBigInt();
  }

  try_lockedAmount(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("lockedAmount", "lockedAmount():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  reportID(): BigInt {
    let result = super.call("reportID", "reportID():(uint256)", []);

    return result[0].toBigInt();
  }

  try_reportID(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("reportID", "reportID():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  reward(): BigInt {
    let result = super.call("reward", "reward():(uint256)", []);

    return result[0].toBigInt();
  }

  try_reward(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("reward", "reward():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  stakingAmount(): BigInt {
    let result = super.call("stakingAmount", "stakingAmount():(uint256)", []);

    return result[0].toBigInt();
  }

  try_stakingAmount(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "stakingAmount",
      "stakingAmount():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get _governanceBadgeNFT(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _tokenContract(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _treasuryContract(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class ReportCall extends ethereum.Call {
  get inputs(): ReportCall__Inputs {
    return new ReportCall__Inputs(this);
  }

  get outputs(): ReportCall__Outputs {
    return new ReportCall__Outputs(this);
  }
}

export class ReportCall__Inputs {
  _call: ReportCall;

  constructor(call: ReportCall) {
    this._call = call;
  }

  get domain(): string {
    return this._call.inputValues[0].value.toString();
  }

  get isScam(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }

  get evidenceHashes(): Array<string> {
    return this._call.inputValues[2].value.toStringArray();
  }

  get comments(): string {
    return this._call.inputValues[3].value.toString();
  }
}

export class ReportCall__Outputs {
  _call: ReportCall;

  constructor(call: ReportCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RewardContributorsCall extends ethereum.Call {
  get inputs(): RewardContributorsCall__Inputs {
    return new RewardContributorsCall__Inputs(this);
  }

  get outputs(): RewardContributorsCall__Outputs {
    return new RewardContributorsCall__Outputs(this);
  }
}

export class RewardContributorsCall__Inputs {
  _call: RewardContributorsCall;

  constructor(call: RewardContributorsCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class RewardContributorsCall__Outputs {
  _call: RewardContributorsCall;

  constructor(call: RewardContributorsCall) {
    this._call = call;
  }
}

export class SetReportRewardCall extends ethereum.Call {
  get inputs(): SetReportRewardCall__Inputs {
    return new SetReportRewardCall__Inputs(this);
  }

  get outputs(): SetReportRewardCall__Outputs {
    return new SetReportRewardCall__Outputs(this);
  }
}

export class SetReportRewardCall__Inputs {
  _call: SetReportRewardCall;

  constructor(call: SetReportRewardCall) {
    this._call = call;
  }

  get _reportReward(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetReportRewardCall__Outputs {
  _call: SetReportRewardCall;

  constructor(call: SetReportRewardCall) {
    this._call = call;
  }
}

export class SetRewardCall extends ethereum.Call {
  get inputs(): SetRewardCall__Inputs {
    return new SetRewardCall__Inputs(this);
  }

  get outputs(): SetRewardCall__Outputs {
    return new SetRewardCall__Outputs(this);
  }
}

export class SetRewardCall__Inputs {
  _call: SetRewardCall;

  constructor(call: SetRewardCall) {
    this._call = call;
  }

  get _reward(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetRewardCall__Outputs {
  _call: SetRewardCall;

  constructor(call: SetRewardCall) {
    this._call = call;
  }
}

export class SetStakingAmountCall extends ethereum.Call {
  get inputs(): SetStakingAmountCall__Inputs {
    return new SetStakingAmountCall__Inputs(this);
  }

  get outputs(): SetStakingAmountCall__Outputs {
    return new SetStakingAmountCall__Outputs(this);
  }
}

export class SetStakingAmountCall__Inputs {
  _call: SetStakingAmountCall;

  constructor(call: SetStakingAmountCall) {
    this._call = call;
  }

  get _stakingAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetStakingAmountCall__Outputs {
  _call: SetStakingAmountCall;

  constructor(call: SetStakingAmountCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class ValidateCall extends ethereum.Call {
  get inputs(): ValidateCall__Inputs {
    return new ValidateCall__Inputs(this);
  }

  get outputs(): ValidateCall__Outputs {
    return new ValidateCall__Outputs(this);
  }
}

export class ValidateCall__Inputs {
  _call: ValidateCall;

  constructor(call: ValidateCall) {
    this._call = call;
  }

  get _reportId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get isAccepted(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }

  get comments(): string {
    return this._call.inputValues[2].value.toString();
  }
}

export class ValidateCall__Outputs {
  _call: ValidateCall;

  constructor(call: ValidateCall) {
    this._call = call;
  }
}
