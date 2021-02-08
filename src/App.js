import React from 'react';
import Amplify, { Storage } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import awsconfig from './aws-exports';

const AWS = require('aws-sdk');
const bucket = awsconfig.aws_user_files_s3_bucket;
const identity_pool_id = awsconfig.aws_cognito_identity_pool_id;
const region = awsconfig.aws_project_region; 

Amplify.configure(awsconfig);
AWS.config.update({region: 'ap-northeast-1'});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: identity_pool_id});

const rek = new AWS.Rekognition();

class App extends React.Component {
  state = {
    file: {},
  }
  onChange(data) {
    this.setState({ file: data.file })
  }

  saveFile = async () => {
    console.log("save")
    const { file } = this.state
    Storage.put(file.name, file) //upload to s3
    .then (result => {
      checkImage(file.name);
    })
    .catch(err => console.log(err));
  }

  saveVideo = async () => {
    const { file } = this.state
    checkVideo(file.name);
  }

  render() {
    return (
      <div>
        <h2><center><PhotoPicker
          preview
          onPick={data => this.onChange(data)}
        /></center></h2>
        <center><button onClick={this.saveFile}>
          Upload Image
        </button>
        </center>

        
        <br>
        </br>
        <center>
        <div className='video-uploader'>
        <form>
          <h2>
            <label className='select-label'>Select video: </label>
          </h2>
          <p>
            <input
              className='video-input'
              type='file'
              id='file-input'
              accept='image/*, video/*'
            />
          </p>
          <button onClick={this.saveVideo}>
          Upload Video
        </button>
        </form>
      </div></center>
        
        

      </div>
    )
  }
}

let checkImage = (filename) => {
  var params = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: `public/${filename}`,
      },
    },
    "MinConfidence": 60,
    // HumanLoopConfig: {
    //   FlowDefinitionArn: "arn:aws:sagemaker:ap-northeast-1:XXXXXX",
    //   HumanLoopName: "content-mod-team",
    //   DataAttributes: {
    //     ContentClassifiers: [
    //       'FreeOfAdultContent',
    //     ]
    //   }
    // }
  }

  return new Promise((resolve, reject) => {
    rek.detectModerationLabels(params, (err,data) => {
      if (err) {
        console.log(err);
        return reject(new Error(err));
      }
      console.log(JSON.stringify(data));
      if (data.ModerationLabels.length === 0) {
        // image is safe for work
      }
      else {
        alert("this image is not allowed as it contains " + data.ModerationLabels[1].Name);
      }
    });
  });

};

let checkVideo = (filename) => {
  let jobID = "";
  var params = {
    Video: {
      S3Object: {
        Bucket: bucket,
        Name: `public/${filename}`,
      },
    },
    "ClientRequestToken": "LabelDetectionToken",
    "MinConfidence": 50,
    "NotificationChannel": {
        "SNSTopicArn": "arn:aws:sns:ap-northeast-1:XXXXXX",
        "RoleArn": "arn:aws:iam::XXXXXX"
    },
    "JobTag": "DetectingLabels"
  }
    
    return new Promise((resolve, reject) => {
    rek.startContentModeration(params, (err,data) => {
      if (err) {
        console.log(err);
        return reject(new Error(err));
      }
      jobID = data.JobId;
      checkVideoModeration(jobID);
    });
  });
};

let checkVideoModeration = (jobID)  => {
    
  var params = {
  JobId: jobID,
  MaxResults: 10,
}
  
  return new Promise((resolve, reject) => {
  rek.getContentModeration(params, (err,data) => {
    if (err) {
      console.log(err);
      return reject(new Error(err));
    }
    console.log(JSON.stringify(data));
      alert("this image contains " + data.ModerationLabels[1].Name);
  });
});

}


export default App;