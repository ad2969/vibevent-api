const AWS = require('aws-sdk');
const errors = require('./_errors');

const isTest = process.env.NODE_ENV === 'test';

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

/**
 * Function to get a pre-signed upload url from S3
 * @param bucketName - the name of the bucket
 * @param bucketKey - the "key", or path, of the bucket object
 * @param expires - optional url expiry (in seconds)
 */
const getPreSignedUrl = async ({
  bucketName, bucketKey, contentType, meta, expires = 300
}) => (
  // wrap the function in a promise because it only accepts callback function
  new Promise((resolve, reject) => {

    const rawKey = `raw/${bucketKey}`;

    const obj = {
      Bucket: bucketName,
      Key: rawKey,
      Expires: expires,
      ACL: 'public-read',
      ContentType: contentType,
      Metadata: meta
    };

    s3.getSignedUrl('putObject', obj, (err, res) => {

      if (err) {

        const errObject = errors.handleAWSError(err);
        reject(errObject);

      }
      else {

        resolve({ url: res, ...obj });

      }

    });

  })
);

const getPreSignedUrlMock = (bucketName, bucketKey) => ({
  bucketName,
  bucketKey: `raw/${bucketKey}`,
  url: 'https://bucket-name.s3-us-west-2.amazonaws.com/file-name.pdf?AWSAccessKeyId=[access-key-omitted]&Expires=1470666057&Signature=[signature-omitted]'
});

module.exports = {
  getPreSignedUrl: isTest ? getPreSignedUrlMock : getPreSignedUrl
};
