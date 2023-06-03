exports.labelDisk = async (log) => {
	// Start preparing the labels
	const resourceNameArray = String(log.protoPayload.resourceName).split('/');
	const projectId = resourceNameArray[1];
	const zone = resourceNameArray[3];
	const diskName = resourceNameArray[5];
	const createdBy = String(
		log.protoPayload.authenticationInfo.principalEmail
	).replace(/[^a-z0-9_-]/g, '-');
	const labels = {
		'created-by': createdBy,
	};
	// End preparing the labels

	try {
		// Imports the Compute library
		const { DisksClient } = require('@google-cloud/compute').v1;
		// Instantiates a client
		const diskClient = new DisksClient();

		// Construct get request
		const getRequest = {
			disk: diskName,
			project: projectId,
			zone,
		};

		// Run  get request
		const getResponse = await diskClient.get(getRequest);

		if (getResponse[0].labels['created-by']) {
			console.log("Already has 'created-by' label. Exiting...");
			return;
		}

		// Construct set label request
		const setLabelRequest = {
			resource: diskName,
			project: projectId,
			zone,
			zoneSetLabelsRequestResource: {
				labelFingerprint: String(getResponse[0].labelFingerprint),
				labels: labels,
			},
		};

		// Run set label request
		const setLabelResponse = await diskClient.setLabels(setLabelRequest);
		console.log(JSON.stringify(labels));
		console.log(`Labels set for ${diskName} disk in project ${projectId}`);
	} catch (error) {
		console.log(
			`Error setting lables to ${diskName} disk in project ${projectId}.`
		);
		console.log(error);
	}
};
