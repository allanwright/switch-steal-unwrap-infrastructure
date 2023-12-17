import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as targets from "aws-cdk-lib/aws-route53-targets";

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define stack parameters
    const domains = new cdk.CfnParameter(this, "domains", { type: "CommaDelimitedList" });
    const certificateArn = new cdk.CfnParameter(this, "certificateArn");
    const hostedZoneId = new cdk.CfnParameter(this, "hostedZoneId");
    const zoneName = new cdk.CfnParameter(this, "zoneName");
    const deploymentUserArn = new cdk.CfnParameter(this, "deploymentUserArn");

    const bucket = new s3.Bucket(this, "website", {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const certificate = acm.Certificate.fromCertificateArn(
      this, "certificate", certificateArn.valueAsString);
    
    const distribution = new cloudfront.Distribution(this, "distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames: domains.valueAsList,
      certificate: certificate,
      defaultRootObject: "index.html"
    });

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this, "hosted-zone", {
        hostedZoneId: hostedZoneId.valueAsString,
        zoneName: zoneName.valueAsString
      });
    
    new route53.ARecord(this, "ARecord", {
      zone: zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    new route53.AaaaRecord(this, "AAAARecord", {
      zone: zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    const group = new iam.Group(this, "WebsiteDeploymentGroup", {});

    group.attachInlinePolicy(new iam.Policy(this, "WebsiteDeploymentPolicy", {
      document: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["s3:ListBucket"],
            effect: iam.Effect.ALLOW,
            resources: [bucket.bucketArn]
          }),
          new iam.PolicyStatement({
            actions: [
              "s3:DeleteObject",
              "s3:PutObject"
            ],
            effect: iam.Effect.ALLOW,
            resources: [bucket.arnForObjects("*")]
          })
        ]
      })
    }));
  }
}
