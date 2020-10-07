let AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis();

exports.handler = async (event) => {

	console.log("Receiveed messages for hash tags", event.body);

	let hashTagMessages = JSON.parse(event.body).HashTagData;

	let putRecordResponses = [];
	let successCount = 0;
	let failedCount = 0;

	for (const hashTagMessage of hashTagMessages) {

		let message = JSON.stringify(hashTagMessage);
		console.log("HashTag message", message)

		try {
			let putRecordData = await kinesis.putRecord({
				Data: message,
				PartitionKey: 'SocialMedia',
				StreamName: 'hash-tag-stream'
			}).promise();

			console.log("Push message successfully to hash-tag-stream with response", putRecordData);
			putRecordResponses.push(putRecordData);
			successCount++;

		} catch (err) {
			console.log("Error while pushing message to hash-tag-stream with response", err);
			failedCount++;
		}
	}

	let response = {
		'statusCode': 200,
		'headers': {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		},
		'body': JSON.stringify({
			'Success Count': successCount,
			'Failed Count': failedCount,
			'Success Data': putRecordResponses
		}),
		'isBase64Encoded': false
	};
	return response;
};