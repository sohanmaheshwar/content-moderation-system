const AWS = require('aws-sdk');
const { time } = require('console');
const { stringify } = require('querystring');

// TO BE FILLED

const REGION = ""; // e.g., "us-east-1"
const BUCKET_NAME = ""; // your bucket name here
const FILE_NAME = ""; //image or video file to be uploaded. 

const rekog = new AWS.Rekognition({region: REGION});

var params = {
    Image: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name: FILE_NAME,
      },
    },
    "MinConfidence": 80,
  }

  const startModeration = async () => {
    try {
        const data = await rekog.detectModerationLabels(params).promise();
        if (data.ModerationLabels.length === 0) {
            // image is safe for work
          }
          else {
            console.log("this image contains " + data.ModerationLabels[1].Name);
          }
      }
      catch (err) {
        console.log("error ", err);
      }
  }

  startModeration();

 //  This code snippet in case you want to programmatically upload to S3, via a user upload from a HTML page

 /*
function submitData () {
    const imageFile = document.getElementById("img");
    console.log(imageFile.files[0], " and ", imageFile.files[0].name);

    var params = {
        Body: imageFile.files[0],
        Bucket: BUCKET_NAME,
        Key: imageFile.files[0].name,
    };
    s3.putObject(params, function (err,data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data); // set file name here
    })
}
  */

  
