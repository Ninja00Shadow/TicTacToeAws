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

resource "aws_security_group" "tictactoe_sg" {
  name        = "tictactoe_sg"
  description = "Security group for tictactoe application"
  vpc_id      = aws_vpc.tictactoe_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tictactoe_sg"
  }
}

resource "aws_instance" "tictactoe" {
  ami           = var.ami
  instance_type = var.instance_type
  subnet_id     = aws_subnet.tictactoe_subnet1.id
  vpc_security_group_ids = [aws_security_group.tictactoe_sg.id]

  monitoring = true

  user_data = file("${path.module}/setup.sh")

  tags = {
    Name = var.name_tag
  }
}
