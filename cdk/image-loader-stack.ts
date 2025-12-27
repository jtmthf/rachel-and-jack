import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

const TEAM_SLUG = 'jack-moores-projects';
const PROJECT_NAME = 'rachel-and-jack';

export class ImageLoaderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vercelRole = new iam.Role(this, 'VercelRole', {
      assumedBy: new iam.FederatedPrincipal(
        this.formatArn({
          service: 'iam',
          region: '',
          resource: 'oidc-provider',
          resourceName: `oidc.vercel.com/${TEAM_SLUG}`,
          arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
        }),
        {
          StringEquals: {
            [`oidc.vercel.com/${TEAM_SLUG}:sub`]: `owner:${TEAM_SLUG}:project:${PROJECT_NAME}:environment:production`,
            [`oidc.vercel.com/${TEAM_SLUG}:aud`]: `https://vercel.com/${TEAM_SLUG}`,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    const bucket = new s3.Bucket(this, 'ImageLoaderBucket', {
      bucketName: `image-loader-bucket-${this.account}-${this.region}`,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    bucket.grantReadWrite(vercelRole);

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
    new cdk.CfnOutput(this, 'VercelRoleArn', {
      value: vercelRole.roleArn,
    });
  }
}
