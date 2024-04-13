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
  memory = "2048"
  network_mode = "awsvpc"
  requires_compatibilities = [ "FARGATE" ]
  execution_role_arn = "arn:aws:iam::236293649068:role/LabRole"

  container_definitions = jsonencode([
    {
      name = var.app_name
      image = var.docker_image
      essential = true

      portMappings = [
        {
          containerPort = var.app_port
          hostPort = var.app_port
          protocol = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = "/ecs/${var.app_name}"
          "awslogs-region" = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name = "/ecs/${var.app_name}"
  retention_in_days = 7

  tags = {
    Name = "ECSLogs-${var.app_name}"
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
    container_name = var.app_name
    container_port = var.app_port
  } 

  depends_on = [ aws_lb.fargate_lb ]
}

resource "aws_lb" "fargate_lb" {
  name = var.lb_name
  security_groups = [aws_security_group.fargate_sg.id]
  subnets = [aws_subnet.fargate_subnet1.id, aws_subnet.fargate_subnet2.id]
}

resource "aws_lb_target_group" "fargate_target_group" {
  name = var.app_name
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.fargate_vpc.id

  depends_on = [ aws_lb.fargate_lb ]
}

resource "aws_lb_listener" "fargate_lb_listener" {
  load_balancer_arn = aws_lb.fargate_lb.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.fargate_target_group.arn
  }

  depends_on = [ aws_lb.fargate_lb ]
}

