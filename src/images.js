exports.labelImages = async (log) => {
	// Start preparing the labels
	const resourceNameArray = String(log.protoPayload.resourceName).split('/');
	const projectId = resourceNameArray[1];
	const imageName = resourceNameArray[4];
	const createdBy = String(
		log.protoPayload.authenticationInfo.principalEmail
	).replace(/[^a-z0-9_-]/g, '-');
	const labels = {
		'created-by': createdBy,
	};
	// End preparing the labels

	try {
		const { ImagesClient } = require('@google-cloud/compute').v1;
		const imagesClient = new ImagesClient();

		// Construct get request
		const getRequest = {
			image: imageName,
			project: projectId,
		};

		// Run  get request
		const getResponse = await imagesClient.get(getRequest);

		if (getResponse[0].labels['created-by']) {
			console.log("Already has 'created-by' label. Exiting...");
			return;
		}

		// Construct set label request
		const setLabelRequest = {
			resource: imageName,
			project: projectId,
			globalSetLabelsRequestResource: {
				labelFingerprint: String(getResponse[0].labelFingerprint),
				labels: labels,
			},
		};

		// Run set label request
		const setLabelResponse = await imagesClient.setLabels(setLabelRequest);
		console.log(JSON.stringify(labels));
		console.log(
			`Labels set for ${imageName} image in project ${projectId}`
		);
	} catch (error) {
		console.log(
			`Error setting lables to ${imageName} image in project ${projectId}.`
		);
		console.log(error);
	}
};
