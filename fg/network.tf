resource "aws_vpc" "fargate_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "tictactoe-fg-vpc"
  }
}

resource "aws_subnet" "fargate_subnet1" {
  vpc_id            = aws_vpc.fargate_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "tictactoe-fg-subnet1"
  }
}

resource "aws_subnet" "fargate_subnet2" {
  vpc_id            = aws_vpc.fargate_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "tictactoe-fg-subnet2"
  }
}

resource "aws_internet_gateway" "fargate_igw" {
  vpc_id = aws_vpc.fargate_vpc.id

  tags = {
    Name = "tictactoe-fg-igw"
  }
}

resource "aws_route_table" "fargate_route_table" {
  vpc_id = aws_vpc.fargate_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.fargate_igw.id
  }

  tags = {
    Name = "tictactoe-fg-rt"
  }
}

resource "aws_route_table_association" "fargate_rta1" {
  subnet_id      = aws_subnet.fargate_subnet1.id
  route_table_id = aws_route_table.fargate_route_table.id
}

resource "aws_route_table_association" "fargate_rta2" {
  subnet_id      = aws_subnet.fargate_subnet2.id
  route_table_id = aws_route_table.fargate_route_table.id
}

resource "aws_security_group" "fargate_sg" {
  name        = "tictactoe-fg-sg"
  vpc_id      = aws_vpc.fargate_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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
    Name = "tictactoe-fg-sg"
  }
}
