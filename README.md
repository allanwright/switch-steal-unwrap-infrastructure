## Introduction
This repo is the infrastructure as code repository for [switch-steal-unwrap](https://github.com/allanwright/switch-steal-unwrap), which is a Vue SPA implementation of the gift exchange game known as 'switch, steal or unwrap'. 

## Development Environment
A devcontainer configuration file has been defined for use with [VSCode](https://code.visualstudio.com/).

### Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


# Application Architecture
The infrastructure defined in this repository is a static website implemented with a CloudFront distribution backed by an S3 origin. The following diagram provides a high level overview of this architecture:

![Architecture Diagram](https://github.com/allanwright/switch-steal-unwrap-infrastructure/blob/main/diagram.png)

## Build and Deployment
The project uses Github Actions to execute CDK commands in order to deploy the required cloud infrastructure. The application is available [here](https://stealy.link).