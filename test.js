// React
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

// Selectors
import { getFindingsInfo } from '@Redux/dataCollection/dataCollectionSelectors';

//Components
import KreatorCheckBox from '@Components/Kreator/Field/KreatorCheckbox/KreatorCheckbox';
import KreatorField from '@Components/Kreator/Field/KreatorField';
import KreatorDisplayText from '@Components/Kreator/Field/KreatorDisplayText';

// Constants
import { TabSaveTypes } from '@Constants/tabs.constants';
import { KreatorFieldTypeConstants } from '@Constants/kreator.constants';

import { Form } from 'antd';

// Styles
import { FindingCommentField, GridTemplateFindings, GridTemplateCAR } from './KreatorFindingsStyles';
import { TextStyle } from '../KreatorObservations/KreatorObservationStyles';

import KreatorObservations from '../KreatorObservations/KreatorObservations';

const KreatorFindings = (props) => {
	const { fromPreviousVisit = false } = props;
	const auditLines = useSelector((state) => state.data.auditLines);
	const auditLine = Object.values(auditLines).find((audit) => audit?.Id === props.inspection?.lineId);
	let serviceType = auditLine?.SCI_VisitType__c;
	const { findingQuestions, findings } = useSelector((state) => getFindingsInfo(state, { inspection: props.inspection }));
	const [findingsSelected, setFindingsSelected] = useState([]);
	const correctiveActionRequiredChange = (commentKey, e) => {
		const tempFindingsSelected = [...findingsSelected];
		const tempIdx = tempFindingsSelected.indexOf(commentKey);
		if (tempIdx >= 0) {
			tempFindingsSelected.splice(tempIdx, 1);
		} else {
			tempFindingsSelected.push(commentKey);
		}

		setFindingsSelected(tempFindingsSelected);
	};

	return (
		<>
			{!fromPreviousVisit && (
				<div type="Findings">
					{findingQuestions?.length ? (
						<>
							{findingQuestions.map((finding) => {
								let ratingValue = finding?.question?.rating;
								const correctiveActionFields = finding?.question?.comments?.map((comment) => {
									if (comment.isParent) {
										const fieldId = `${finding.questionId}-${comment.key}`;
										const savePath = [`${fieldId}-checked`];
										savePath.unshift('findings');

										const relatedFinding = {};
										if (findings && Object.keys(findings)?.length) {
											Object.keys(findings).forEach((relFindingKey) => {
												if (relFindingKey.includes(fieldId)) {
													const split = relFindingKey.split('-');
													const subKey = split[split.length - 1];
													relatedFinding[subKey] = findings[relFindingKey];
													relatedFinding.key = relFindingKey;
												}
											});
										}

										const isProposing = !findingsSelected?.length ? !!relatedFinding?.checked : findingsSelected.includes(comment.key) ? true : !!relatedFinding?.checked;
										const proposedCARDate = () => {
											return (
												<KreatorField
													fieldId={`${fieldId}-proposedActionDate`}
													forceCheck
													value={relatedFinding.proposedActionDate}
													tablabel={TabSaveTypes.Findings}
													fieldType={KreatorFieldTypeConstants.DATE_TIME}
													validation={() => null}
													showFields="Date"
													errorMessage="Sample Field Error Message"
													showErrorMessage={false}
													disabled={false}
													readyOnly={false}
												/>
											);
										};
										const dateCorrectedValue = () => {
											return (
												<KreatorField
													fieldId={`${fieldId}-dateCorrected`}
													forceCheck
													value={relatedFinding.dateCorrected}
													tablabel={TabSaveTypes.Findings}
													fieldType={KreatorFieldTypeConstants.DATE_TIME}
													showFields="Date"
													validation={() => null}
													errorMessage="Sample Field Error Message"
													showErrorMessage={false}
													disabled={false}
													readyOnly={false}
												/>
											);
										};
										return (
											<>
											
											{isProposing ? (
													<>
												<KreatorField
													fieldId={`${fieldId}-comment`}
													value={relatedFinding.comment ?? comment.description}
													tablabel={TabSaveTypes.Findings}
													fieldType={KreatorFieldTypeConstants.MULTI_LINE_TEXT}
													validation={() => null}
													errorMessage="Sample Field Error Message"
													showErrorMessage={false}
													disabled={false}
													readyOnly={false}
												/>

												<FindingCommentField>
													<Form.Item name={savePath} initialValue={isProposing}>
														<KreatorCheckBox isChecked={isProposing} onChange={(e) => correctiveActionRequiredChange(comment.key, e)} label={'Corrective Action Required'} on findingSelected />
													</Form.Item>
												</FindingCommentField>

														<GridTemplateCAR>
															<KreatorDisplayText textValue="Proposed Corrective Action Date: " />
															<KreatorDisplayText textValue={proposedCARDate()} />
														</GridTemplateCAR>

														<GridTemplateCAR>
															<KreatorDisplayText textValue="Date Corrected: " />
															<KreatorDisplayText textValue={dateCorrectedValue()} />
														</GridTemplateCAR>
													</>
												): null}
											</>
										);
									}
								});
								const commentWasAddedInCurrentAli = finding?.question?.comments.length && finding?.question?.comments.find((comment) => comment.isParent === true);
								if (commentWasAddedInCurrentAli)
									return (
										<div>
											<TextStyle>
												<GridTemplateFindings>
													<KreatorDisplayText textValue="Question: " />
													<KreatorDisplayText textValue={`${finding?.question?.QuestionId} ${finding?.question?.QuestionTitle}`} />
												</GridTemplateFindings>
												{finding?.question?.answer && (
													<GridTemplateFindings>
														<KreatorDisplayText textValue="Response: " />
														<KreatorDisplayText textValue={finding?.question?.answer} />
													</GridTemplateFindings>
												)}
												<GridTemplateFindings>
													<KreatorDisplayText textValue="Rating: " />
													<KreatorDisplayText textValue={ratingValue ?? 'N/A'} />
												</GridTemplateFindings>
												<GridTemplateFindings>
													<KreatorDisplayText textValue="Comment: " />
													<KreatorDisplayText textValue={correctiveActionFields} />
												</GridTemplateFindings>
											</TextStyle>
										</div>
									);
							})}
						</>
					) : (
						serviceType !== 'CAR Follow-up' && <div>No Findings found</div>
					)}
				</div>
			)}
			{(serviceType === 'CAR Follow-up' || fromPreviousVisit) && <KreatorObservations questionsFromFindings={findingQuestions} {...props}></KreatorObservations>}
		</>
	);
};

export default KreatorFindings;
