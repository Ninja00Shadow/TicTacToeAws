terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.19.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_s3_bucket" "tictactoe-bucket" {
  bucket = "tictactoe-bucket"
}

resource "aws_iam_instance_profile" "ec2_eb_profile" {
  name = "tictactoe-ec2-profile"
  role = "LabRole"
}


resource "aws_s3_object" "tictactoe-app" {
  bucket = aws_s3_bucket.tictactoe-bucket.bucket
  key    = "docker-compose.yaml"
  source = "./docker-compose.yaml"
  etag   = filemd5("./docker-compose.yaml")
}


resource "aws_elastic_beanstalk_application" "tictactoe-eb" {
  name        = var.name_tag
  description = "Tic Tac Toe Application"
}

resource "aws_elastic_beanstalk_application_version" "tictactoe_version" {
  name        = "tictactoe-eb-version"
  application = aws_elastic_beanstalk_application.tictactoe-eb.name
  bucket      = aws_s3_bucket.tictactoe-bucket.bucket
  key         = aws_s3_object.tictactoe-app.key
}

resource "aws_elastic_beanstalk_environment" "tictactoe-eb-env" {
  name                = var.beanstalkappenv
  application         = aws_elastic_beanstalk_application.tictactoe-eb.name
  solution_stack_name = var.solution_stack_name
  tier                = var.tier

  version_label = aws_elastic_beanstalk_application_version.tictactoe_version.name

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.ec2_eb_profile.name
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = join(",", var.security_groups)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.public_subnets)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBScheme"
    value     = "internet facing"
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "LoadBalanced"
  }
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = var.minsize
  }
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.maxsize
  }
}
