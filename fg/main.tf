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

resource "aws_ecs_cluster" "fargate_cluster" {
  name = var.cluster_name
}

resource "aws_ecs_task_definition" "fargate_task" {
  family = var.app_name
  cpu = "512"
  memory = "1024"
  network_mode = "awsvpc"
  requires_compatibilities = [ "FARGATE" ]
  execution_role_arn = "arn:aws:iam::236293649068:role/LabRole"

  container_definitions = jsonencode([
    {
      name = "${var.app_name}-backend"
      image = var.backend_image
      essential = true

      portMappings = [
        {
          containerPort = var.backend_port
          hostPort = var.backend_port
          protocol = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = "/ecs/${var.app_name}-backend"
          "awslogs-region" = var.region
          "awslogs-stream-prefix" = "backend"
        }
      }
    },
    {
      name = "${var.app_name}-frontend"
      image = var.frontend_image
      essential = true

      portMappings = [
        {
          containerPort = var.frontend_port
          hostPort = var.frontend_port
          protocol = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = "/ecs/${var.app_name}-frontend"
          "awslogs-region" = var.region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs_log_group1" {
  name = "/ecs/${var.app_name}-frontend"
  retention_in_days = 7

  tags = {
    Name = "ECSLogs-${var.app_name}-frontend"
  }
}

resource "aws_cloudwatch_log_group" "ecs_log_group2" {
  name = "/ecs/${var.app_name}-backend"
  retention_in_days = 7

  tags = {
    Name = "ECSLogs-${var.app_name}-backend"
  }
}

resource "aws_ecs_service" "fargate_service" {
  name = var.service_name
  cluster = aws_ecs_cluster.fargate_cluster.id
  task_definition = aws_ecs_task_definition.fargate_task.arn
  desired_count = var.desired_count
  launch_type = "FARGATE"

  network_configuration {
    subnets = [aws_subnet.fargate_subnet1.id, aws_subnet.fargate_subnet2.id]
    security_groups = [aws_security_group.fargate_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.fargate_target_group.arn
    container_name = "${var.app_name}-frontend"
    container_port = var.frontend_port
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend_target_group.arn
    container_name = "${var.app_name}-backend"
    container_port = var.backend_port
  }
  

  depends_on = [ aws_lb.fargate_lb ]
}

