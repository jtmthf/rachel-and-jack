import * as cdk from 'aws-cdk-lib';
import { ImageLoaderStack } from './image-loader-stack.ts';

const app = new cdk.App();

new ImageLoaderStack(app, 'ImageLoaderStack');

app.synth();
