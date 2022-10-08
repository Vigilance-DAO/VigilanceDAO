import {
  Reported,
  Validated
} from "../generated/ReportDomain/ReportDomain"
import { Report } from "../generated/schema"

export function handleReported(event: Reported): void {
  let report = Report.load(event.params.id.toString())
  if(!report) {
    report = new Report(event.params.id.toString())
  }
  report.reporter = event.params.reporter
  report.domain = event.params.domain.toString()
  report.isScam = event.params.isScam
  report.evidences = event.params.evidences
  report.stakeAmount = event.params.stakeAmount
  report.comments = event.params.comments
  report.createdon = event.params.createdOn
  report.save()
}

export function handleValidated(event: Validated): void {
  let report = Report.load(event.params.id.toString())
  if(!report) {
    return
  }
  report.reporter = event.params.reporter
  report.domain = event.params.domain.toString()
  report.isScam = event.params.isScam
  report.validator = event.params.validator
  report.updatedon = event.params.updatedon
  report.validatorComments = event.params.validatorComments
  report.rewardAmount = event.params.rewardAmount
  report.status = event.params.status
  report.rewardAmount = event.params.rewardAmount
  report.save()
}
