exports.labelSnapshots = async (log) => {
	// Start preparing the labels
	const resourceNameArray = String(log.protoPayload.resourceName).split('/');
	const projectId = resourceNameArray[1];
	const snapshotName = resourceNameArray[4];
	const createdBy = String(
		log.protoPayload.authenticationInfo.principalEmail
	).replace(/[^a-z0-9_-]/g, '-');
	const labels = {
		'created-by': createdBy,
	};
	// End preparing the labels

	try {
		const { SnapshotsClient } = require('@google-cloud/compute').v1;
		const snapshotsClient = new SnapshotsClient();

		// Construct get request
		const getRequest = {
			snapshot: snapshotName,
			project: projectId,
		};

		// Run  get request
		const getResponse = await snapshotsClient.get(getRequest);

		if (getResponse[0].labels['created-by']) {
			console.log("Already has 'created-by' label. Exiting...");
			return;
		}

		// Construct set label request
		const setLabelRequest = {
			resource: snapshotName,
			project: projectId,
			globalSetLabelsRequestResource: {
				labelFingerprint: String(getResponse[0].labelFingerprint),
				labels: labels,
			},
		};

		// Run set label request
		const setLabelResponse = await snapshotsClient.setLabels(setLabelRequest);
		console.log(JSON.stringify(labels));
		console.log(
			`Labels set for ${snapshotName} snapshot in project ${projectId}`
		);
	} catch (error) {
		console.log(
			`Error setting lables to ${snapshotName} snapshot in project ${projectId}.`
		);
		console.log(error);
	}
};
