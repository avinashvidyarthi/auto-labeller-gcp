exports.labelResource = async (event, context) => {
	const logData = JSON.parse(Buffer.from(event.data, 'base64').toString());
	console.log(JSON.stringify(logData));
	// const logData = event.data;
	if (
		String(logData.protoPayload.methodName).includes('compute.instances.insert')
	) {
		const { labelComputeEngineInstance } = require('./instnaces');
		console.log('Labelling Compute Engine Instance...');
		await labelComputeEngineInstance(logData);
	} else if (
		String(logData.protoPayload.methodName).includes('compute.snapshots.insert')
	) {
		const { labelSnapshots } = require('./snapshots');
		console.log('Labelling Snapshot...');
		await labelSnapshots(logData);
	} else if (
		String(logData.protoPayload.methodName).includes('compute.disks.insert')
	) {
		const { labelDisk } = require('./disks');
		console.log('Labelling Disk...');
		await labelDisk(logData);
	} else {
		console.log(logData);
	}
};
