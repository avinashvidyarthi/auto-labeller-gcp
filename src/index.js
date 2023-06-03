const { labelComputeEngineInstance } = require('./instnaces');
const { labelSnapshots } = require('./snapshots');

exports.labelResource = async (event, context) => {
	const logData = JSON.parse(Buffer.from(event.data, 'base64').toString());
	console.log(JSON.stringify(logData));
	// const logData = event.data;
	if (
		String(logData.protoPayload.methodName).includes('compute.instances.insert')
	) {
		console.log('Labelling Compute Engine Instance...');
		await labelComputeEngineInstance(logData);
	} else if (
		String(logData.protoPayload.methodName).includes('compute.snapshots.insert')
	) {
		console.log('Labelling Snapshot...');
		await labelSnapshots(logData);
	} else {
		console.log(logData);
	}
};
