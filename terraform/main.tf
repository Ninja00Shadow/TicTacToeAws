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

resource "aws_vpc" "tictactoe_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "tictactoe_vpc"
  }
}

resource "aws_subnet" "tictactoe_subnet" {
  vpc_id            = aws_vpc.tictactoe_vpc.id
  cidr_block        = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags = {
    Name = "tictactoe_subnet"
  }
}

resource "aws_internet_gateway" "tictactoe_igw" {
  vpc_id = aws_vpc.tictactoe_vpc.id
  tags = {
    Name = "tictactoe_igw"
  }
}

resource "aws_route_table" "tictactoe_rt" {
  vpc_id = aws_vpc.tictactoe_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.tictactoe_igw.id
  }

  tags = {
    Name = "tictactoe_rt"
  }
}

resource "aws_route_table_association" "tictactoe_rta" {
  subnet_id      = aws_subnet.tictactoe_subnet.id
  route_table_id = aws_route_table.tictactoe_rt.id
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
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
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

  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
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
  subnet_id     = aws_subnet.tictactoe_subnet.id
  vpc_security_group_ids = [aws_security_group.tictactoe_sg.id]

  tags = {
    Name = var.name_tag
  }
}
