exports.labelComputeEngineInstance = async (log) => {
	// Start preparing the labels
	const resourceNameArray = String(log.protoPayload.resourceName).split('/');
	const projectId = resourceNameArray[1];
	const zone = resourceNameArray[3];
	const instanceName = resourceNameArray[5];
	const createdBy = String(
		log.protoPayload.authenticationInfo.principalEmail
	).replace(/[^a-z0-9_-]/g, '-');
	const labels = {
		'created-by': createdBy,
	};
	// End preparing the labels

	try {
		// Imports the Compute library
		const { InstancesClient } = require('@google-cloud/compute').v1;
		// Instantiates a client
		const computeClient = new InstancesClient();

		// Construct get request
		const getRequest = {
			instance: instanceName,
			project: projectId,
			zone,
		};

		// Run  get request
		const getResponse = await computeClient.get(getRequest);

		if (getResponse[0].labels['created-by']) {
			console.log("Already has 'created-by' label. Exiting...");
			return;
		}

		// Construct set label request
		const setLabelRequest = {
			instance: instanceName,
			project: projectId,
			zone,
			instancesSetLabelsRequestResource: {
				labelFingerprint: String(getResponse[0].labelFingerprint),
				labels: labels,
			},
		};

		// Run set label request
		const setLabelResponse = await computeClient.setLabels(setLabelRequest);
		console.log(JSON.stringify(labels));
		console.log(
			`Labels set for ${instanceName} instance in project ${projectId}`
		);
	} catch (error) {
		console.log(
			`Error setting lables to ${instanceName} VM in project ${projectId}.`
		);
		console.log(error);
	}
};
