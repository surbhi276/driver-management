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
   - Added unit test cases to enable it's functionalities to be tested in development environment.
4. Improve code quality:
   - creates a singleton instance of the DynamoDB.DocumentClient class, which can be accessed and reused by application. It will minimize the number of AWS SDK connections.
   - Added Joi validation to improve the data quality. It will help to ensure that the data being processed by the application is of the expected format and type.
   - Implemented logger to better debug the application.
   - Changed the code structure of the application into smaller, self-contained components with each module responsible for a specific set of functions or features in order to have a clean code architecture. It has several benefits such as
     - Easy to maintain : Each module can be updated or modified independently without affecting other parts of the application to promote seperation of concern.
     - Code reusability : By breaking the application into modules, developers can reuse code across different parts of the application. This will ensure less redundency and more consistency in the code.
     - Easier testing : Each module can be tested independently, making it easier to identify and fix bugs or issues.
     - Clean structure : Modularity provides a clear structure for the application, with each module responsible for a specific set of functions or features. This makes it easier for developers to understand the overall architecture of the application and to navigate the codebase.
5. Explain your decisions in regards to the vision you had for the project.
   - As the challenge was to keep the track of tips received by drivers and exposing an API to access the aggregated amount of tips received by a driver on a daily and weekly level. The tipping events are available via an SQS queue, and the task is to consume tipping events and store the information in a suitable way.
   - To accomplish this, I created a new DynamoDB table to store the tips received by drivers. The table could have its own partition key to make sure each event is come as unique. Each tipping event could be stored as a new item in the table with the driver ID and tip amount as attributes. To calculate the aggregated amount of tips received by a driver on a daily and weekly level, I used the DynamoDB scan operation to retrieve all items with a specific driver ID and timestamp within a specific time range, and then calculate the sum of the tip amounts.
   - Regarding the decision to make the handlers testable, I tried to seperate the data access layer from the business logic layer to make the handlers more testable.
   - As for improving the existing code,I tried to follow the best practices and coding standards for TypeScript and refactor the code as much as possible to make it more modular and maintainable.

## Improvements:

- Updated the folders structure, like below screenshot: <br>
  <img width="267" alt="cdk" src="https://user-images.githubusercontent.com/25278823/227360530-d7031373-2b1b-4bb7-94b1-14e17930e645.png"> <br>
  <img width="368" alt="src" src="https://user-images.githubusercontent.com/25278823/227382762-d366c153-15e1-4a14-845f-59d89572f347.png">
