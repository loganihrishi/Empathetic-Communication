import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { VpcStack } from "./vpc-stack";

export interface EcsSocketStackProps extends StackProps {
  certificateArn?: string;
}

export class EcsSocketStack extends Stack {
  public readonly socketUrl: string;
  public readonly secureSocketUrl: string;

  constructor(
    scope: Construct,
    id: string,
    vpcStack: VpcStack,
    props?: EcsSocketStackProps
  ) {
    super(scope, id, props);

    // Create a VPC
    const vpc = vpcStack.vpc;

    // ECS cluster
    const cluster = new ecs.Cluster(this, "SocketCluster", { vpc });

    // Create task role with Bedrock permissions
    const taskRole = new iam.Role(this, "SocketTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy"
        ),
      ],
      inlinePolicies: {
        BedrockPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithBidirectionalStream",
                "bedrock:Converse",
                "bedrock:ConverseStream",
                "bedrock:InvokeModelWithResponseStream",
              ],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["sts:AssumeRole", "sts:GetCallerIdentity"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "ssmmessages:CreateControlChannel",
                "ssmmessages:CreateDataChannel",
                "ssmmessages:OpenControlChannel",
                "ssmmessages:OpenDataChannel",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // Enable execute command on cluster
    cluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      minCapacity: 0,
      maxCapacity: 0,
    });

    // Create a self-signed certificate for development
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "*.elb.amazonaws.com",
      validation: acm.CertificateValidation.fromEmail(),
    });

    // Fargate service with load balancer
    const fargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "SocketService",
        {
          cluster,
          cpu: 512,
          memoryLimitMiB: 1024,
          desiredCount: 1,
          listenerPort: 443,
          protocol: certificate ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
          certificate: certificate,
          redirectHTTP: certificate ? true : false,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset("./socket-server"),
            containerPort: 3000,
            taskRole: taskRole,
            executionRole: taskRole,
          },
          publicLoadBalancer: true,
          enableExecuteCommand: true,
        }
      );

    // Configure for WebSocket support
    fargateService.targetGroup.configureHealthCheck({
      path: "/health",
      port: "3000",
      healthyHttpCodes: "200,404",
      interval: Duration.seconds(30),
      timeout: Duration.seconds(10),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // Enable sticky sessions for WebSocket
    fargateService.targetGroup.setAttribute("stickiness.enabled", "true");
    fargateService.targetGroup.setAttribute("stickiness.type", "lb_cookie");

    // Use the load balancer DNS name for the socket URLs
    this.socketUrl = `http://${fargateService.loadBalancer.loadBalancerDnsName}`;
    this.secureSocketUrl = `https://${fargateService.loadBalancer.loadBalancerDnsName}`;

    // Export the socket URLs
    new cdk.CfnOutput(this, "SocketUrl", {
      value: this.socketUrl,
      description: "Socket.IO server HTTP URL",
      exportName: `${id}-SocketUrl`,
    });
    
    new cdk.CfnOutput(this, "SecureSocketUrl", {
      value: this.secureSocketUrl,
      description: "Socket.IO server HTTPS URL",
      exportName: `${id}-SecureSocketUrl`,
    });
  }
}
