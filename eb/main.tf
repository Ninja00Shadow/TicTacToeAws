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

# resource "null_resource" "zip_archive" {
#   triggers = {
#     always_run = "${timestamp()}"
#   }

#   provisioner "local-exec" {
#     command = "powershell -File ${path.module}/create_zip.ps1"
#   }
# }

resource "aws_iam_instance_profile" "ec2_eb_profile" {
  name = "tictactoe-ec2-profile"
  # role = aws_iam_role.eb_ec2_role.name
  role = "LabRole"
}

# resource "aws_iam_role" "eb_ec2_role" {
#   name = "tictactoe-ec2-role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect = "Allow",
#         Principal = {
#           Service = "ec2.amazonaws.com",
#         },
#         Action = "sts:AssumeRole",
#       },
#     ],
#   })
# }

# resource "aws_iam_role_policy_attachment" "eb_ec2_policy" {
#   role       = aws_iam_role.eb_ec2_role.name
#   policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkFullAccess"
# }



resource "aws_s3_object" "tictactoe-app" {
  # depends_on = [null_resource.zip_archive]
  bucket = aws_s3_bucket.tictactoe-bucket.bucket
  key    = "TicTacToeAws.zip"
  source = "../TicTacToeAws.zip"
  etag = filemd5("../TicTacToeAws.zip")
}


resource "aws_elastic_beanstalk_application" "tictactoe-eb" {
  name = var.name_tag
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
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    # value     = "aws-elasticbeanstalk-ec2-role"
    value = aws_iam_instance_profile.ec2_eb_profile.name
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "True"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.public_subnets)
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "LoadBalanced"
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBScheme"
    value     = "internet facing"
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
