resource "aws_vpc" "tictactoe_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "tictactoe-vpc"
  }
}

resource "aws_subnet" "tictactoe_subnet1" {
  vpc_id            = aws_vpc.tictactoe_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "tictactoe-subnet1"
  }
}

resource "aws_subnet" "tictactoe_subnet2" {
  vpc_id            = aws_vpc.tictactoe_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "tictactoe-subnet2"
  }
}

resource "aws_internet_gateway" "tictactoe_igw" {
  vpc_id = aws_vpc.tictactoe_vpc.id

  tags = {
    Name = "tictactoe-igw"
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

resource "aws_route_table_association" "tictactoe_rta1" {
  subnet_id      = aws_subnet.tictactoe_subnet1.id
  route_table_id = aws_route_table.tictactoe_rt.id
}

resource "aws_route_table_association" "tictactoe_rta2" {
  subnet_id      = aws_subnet.tictactoe_subnet2.id
  route_table_id = aws_route_table.tictactoe_rt.id
}
