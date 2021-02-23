const AWS = require('aws-sdk');
const { time } = require('console');
const { stringify } = require('querystring');

// TO BE FILLED

const REGION = ""; // e.g., "us-east-1"
const BUCKET_NAME = ""; // your bucket name here
const FILE_NAME = ""; //image or video file to be uploaded. 
const SNSTopic_ARN = ""; // ARN of the new Topic created in SNS
const ROLE_ARN = ""; // ARN of the IAM Role
const QUEUE_URL = ""; //URL of the SQS Queue created

const sqs = new AWS.SQS({region: REGION});
const rekog = new AWS.Rekognition({region: REGION});
let s3 = new AWS.S3({ region: REGION });

var JobID = "";

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms)); //function for a async timeout

var params = {
    Video: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name: FILE_NAME,
      },
    },
    "ClientRequestToken": "ABC123",  //specify diff names for diff jobs
    "MinConfidence": 50,
    "NotificationChannel": {
        "SNSTopicArn": SNSTopic_ARN,
        "RoleArn": ROLE_ARN
    }, 
    "JobTag": "DetectingLabels"
  }

  var jobFound = false;
  var succeeded = false;

  var queueParams = {
    QueueUrl: QUEUE_URL,
    AttributeNames: ['All'],
    MaxNumberOfMessages: 10,
}

  const startModeration = async () => {
    try {
        const data = await rekog.startContentModeration(params).promise();
        console.log("started ", data.JobId);
        jobID = data.JobId;
        setTimeout(function() { startSQSMessage(); }, 5000);
      }
      catch (err) {
        console.log("error ", err);
      }
  }

  const startSQSMessage = async () => {
    try {  
      while (jobFound == false) {
         const response = await new Promise((resolve, reject) => {
           sqs.receiveMessage(queueParams, (err,data) => {
             if (err) console.log("error ", err);
             else {
               console.log(JSON.stringify(data));


                if (!data.Messages) {
                    console.log("sleep");
                    (async () => {
                        await snooze(5000);
                    })();
                }

                else {
                    data.Messages.forEach(function(message) {
                        console.log("message is ", message);
                        var notification = JSON.parse(message.Body);
                        var rekMessage = JSON.parse(notification.Message);
                        console.log(rekMessage.JobId + " and " + rekMessage.Status);
    
                        if (rekMessage.JobId === jobID) {
                            console.log("matching job found ", rekMessage.JobId);
                            jobFound = true;
                            var deleteParams = {
                                QueueUrl: QUEUE_URL,
                                ReceiptHandle: message.ReceiptHandle
                            }
                            if (rekMessage.Status == 'SUCCEEDED') {
                                succeeded = true;
                                getModeration();
                            }
                            sqs.deleteMessage(deleteParams, (err, data) => {
                                if (err) console.log("error ", err);
                                else {
                                    console.log("deleted message ", data)
                                }
                            })
                        }
                        else {
                            var deleteParams = {
                                QueueUrl: QUEUE_URL,
                                ReceiptHandle: message.ReceiptHandle
                            }
                            sqs.deleteMessage(deleteParams, (err, data) => {
                                if (err) console.log("error ", err);
                                else console.log("deleted message and failed ", data);
                            }) 
                        }
                    });
                } 
             }
           })
         })
        }
      }
      catch (err) {
        console.log("error ", err);
        return false;
      }
  }

  const getModeration = async () => {
    try {
        var contentModParams = {
            JobId: jobID,
            MaxResults: 10,
          }

          return new Promise((resolve, reject) => {
            rekog.getContentModeration(contentModParams, (err,data) => {
              if (err) {
                console.log(err);
                return reject(new Error(err));
              }
              console.log("completed. Here's the final results");
              console.log(JSON.stringify(data));
            });
          });
      }
      catch (err) {
        console.log("error ", err);
      }
  }

  startModeration();

 //  This code snippet in case you want to programmatically upload to S3, via a user upload from a HTML page

 /*
function submitData () {
    const videoFile = document.getElementById("video"); 
    console.log(videoFile.files[0], " and ", videoFile.files[0].name);

    var params = {
        Body: videoFile.files[0],
        Bucket: BUCKET_NAME,
        Key: videoFile.files[0].name,
    };
    s3.putObject(params, function (err,data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data); // set file name here
    })
}
  */
  
