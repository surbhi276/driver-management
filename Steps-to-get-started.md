## How to get started:

## Task Description:

The driver service has been extended to keep tracks of the tips received by each driver and provide an API to access this data which will help the drivers get a better idea of their earnings and enable us to track the tips given by our customers effectively.

## Pre-Requisites:

- AWS Account and aws-cli configured with access key and secret access key
- node and yarn installed

## Steps to run the application:

- Clone the repo
- cd into _*"coding-challenge-surbhi"*_
- Run below commands in specified order:
  - yarn
  - yarn bootstrap
  - yarn deploy
- To take down the deployment from AWS Account run _*yarn destroy*_

## Tasks expected to be completed:

1. Consume tipping events and store the information. <br>
   After the changes I have implemented, now tippings events can be stored in a new table in AWS DynamoDB.
   - What strategy implemented and why?<br>
     - Created a new Lambda Function to receive the tipping events from SQS and store it in the newly created DynamoDB table.
     - _Why?_ I chose AWS lambda function to consume the SQS events as Lambda function is easily scalable and cost-effective, it is also a good option for Event Driven Systems and provides easy integration with other AWS services.
   - Which alternatives discarded and why?
     - Creating a custom application using AWS SDK for polling SQS messages and storing it in DynamoDB.
     - _Why_ Adds more complexity to the whole setup and involves more maintenance in the infrastructure side.
2. Extend the REST API to reflect tips amount received by a driver, in a day and current week:
   - Created another lambda which fetches the tips information from the newly created DynamoDB table.
   - Added a new API endpoint to present the tips information of the driver (/tips).
3. Write Unit tests for the handlers.
   - Added unit test cases and enabled the project and it's functionalities to be tested in development environment.
4. Improve code quality:
   - List of flaws I found in the given code and how I resolved it:
5. Explain your decisions in regards to the vision you had for the project.

## Additional improvements done in the project:

- Introduced validation on incoming request(s).
- Added logging functionality to make the debugging easier.
- Updated the folders structure, like below screenshot: <br>
  <img width="267" alt="cdk" src="https://user-images.githubusercontent.com/25278823/227360530-d7031373-2b1b-4bb7-94b1-14e17930e645.png"> <br>
  <img width="368" alt="src" src="https://user-images.githubusercontent.com/25278823/227382762-d366c153-15e1-4a14-845f-59d89572f347.png">
