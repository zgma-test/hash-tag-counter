let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

	console.log("Received hash tag message event", event);

	for (const record of event.Records) {

		let payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
		let payloadObj = JSON.parse(payload);
		console.log('Decoded payload successfully :', payload);

		let application = payloadObj.Application;
		let hashTags = payloadObj.HashTags;
		console.log('Decoded Application :', application, 'and hashtags :', hashTags);

		for (const hashTag of hashTags) {
			let currentCount = 0;
			try {
				let data = await ddb.get({
					TableName: 'HashTags',
					Key: { 'Application': application, 'HashTag': hashTag },
					AttributesToGet: [
						'Count'
					]
				}).promise();

				console.log('Successfully fetched the existing row for hashtag :', hashTag, 'in application :', application, data);
				let currentCount = data.Item ? data.Item.Count + 1 : 1;

				try {
					let data = await ddb.put({
						TableName: 'HashTags',
						Item: { 'Application': application, 'HashTag': hashTag, 'Count': currentCount }
					}).promise();

					console.log('Successfully updated the hashtag count to :', currentCount, 'for hashtag :', hashTag, 'in application :',
						application, data);

				} catch (err) {
					console.log('Error while updating the hashcount for hashtag :', hashTag, 'and application :', application, err);
				}
			} catch (err) {
				console.log('Error while getting the existing count for the hashtag : ' + hashTag + ' and application : ' +
					applciation, err);
			}
		}

	}

	return 'Successfully executed';
};