
### Build a content moderation system using AWS

  

This is the sample code for my talk about '*Add a computer vision model to your app without ML*' from [Innovate AI ML 2021](https://aws.amazon.com/events/aws-innovate/machine-learning/online/emea/?sc_channel=em&sc_campaign=EMEA_FIELD_WEBINAR_innovate-AIML_20210224_7014z000001MJbu&sc_medium=em_&sc_content=REG_t1_field&sc_geo=emea&sc_country=mult&sc_outcome=reg&sc_publisher=aws&trkCampaign=emea21_innovatemlq1&trk=em_emea21_innovatemlq1_sohanm)

  

The aim was to teach beginners/intermediate developers how to add a computer vision model using the Rekognition APIs. I chose the content moderation example as most apps these days have some form of User Generated Content such as display pictures.

  

**Note**: In the talk, I showed the example of an Amplify App with the same backend code behind. For the purpose of this code sample I have stripped away the Amplify and front-end parts to keep it simple. Also, please use this code snippet for learning only :)

  

**Instructions**:

  

1. Download the repo

2. Run `npm install` in the root folder. This will install the dependencies listed in `package.json`

3. This example assumes you have stored a video file in an S3 bucket already. Check the bottom of the snippet for code on uploading a file to S3 programmatically
4. The `sample-image.js`  works for content moderation on images only and is a good starting point if you are new to this. 

5. Fill in Region, Bucket Name, and File Name
6. Run `node sample-image.js` and you will see the moderation labels in the console

7. The `sample.js` example shows how to implement content moderation for video. Create a SNS Topic, SQS Queue and an IAM Role and fill in these details. If you are unsure how to do these steps - View the talk linked above. You will have to sign up to view it.

8. Run `node sample.js`. If the program stops at the `snooze()` function just run `node sample.js` again. There is a finite time for SQS to send out the messages.

To implement the same system in either Python or Java, check our [documentation here](https://docs.aws.amazon.com/rekognition/latest/dg/procedure-moderate-videos.html)
