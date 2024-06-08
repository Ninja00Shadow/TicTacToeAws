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

resource "aws_s3_bucket" "avatars_bucket" {
  bucket = "tictactoe-avatars-${random_id.bucket_suffix.hex}"

  force_destroy = true

  tags = {
    Name = "AvatarsBucket"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}

resource "aws_s3_bucket_ownership_controls" "avatars_bucket_control" {
  bucket = aws_s3_bucket.avatars_bucket.bucket

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  
}

resource "aws_s3_bucket_public_access_block" "avatars_bucket_block" {
  bucket = aws_s3_bucket.avatars_bucket.bucket

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false 
}

resource "aws_s3_bucket_acl" "avatars_bucket_acl" {
  bucket = aws_s3_bucket.avatars_bucket.bucket

  acl = "public-read"

  depends_on = [ 
    aws_s3_bucket_public_access_block.avatars_bucket_block,
    aws_s3_bucket_ownership_controls.avatars_bucket_control
   ]
}

resource "aws_s3_bucket_policy" "avatars_bucket_policy" {
  bucket = aws_s3_bucket.avatars_bucket.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.avatars_bucket.arn}/*"
      }
    ]
  })

  depends_on = [ 
    aws_s3_bucket.avatars_bucket,
    aws_s3_bucket_acl.avatars_bucket_acl
   ]
  
}

resource "aws_db_instance" "tictactoe_db" {
  allocated_storage    = 10
  db_name              = "tictactoe_db"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.micro"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = true

  vpc_security_group_ids = [aws_security_group.backend_db_sg.id]
  db_subnet_group_name = aws_db_subnet_group.tictactoe_db_subnet_group.name

  publicly_accessible  = false
  storage_encrypted    = true
  deletion_protection  = false

  tags = {
    Name = "TicTacToeDBInstance"
  }
}

resource "aws_db_subnet_group" "tictactoe_db_subnet_group" {
  name       = "tictactoe_db_subnet_group"
  subnet_ids = [aws_subnet.tictactoe_subnet.id, aws_subnet.tictactoe_subnet_2.id]

  tags = {
    Name = "tictactoe_db_subnet_group"
  }
}

resource "aws_security_group" "backend_db_sg" {
  name        = "backend-db-access"
  description = "Allow access to the RDS from the backend only"
  vpc_id      = aws_vpc.tictactoe_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.tictactoe_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "BackendDBSecurityGroup"
  }
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
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "tictactoe_subnet"
  }
}

resource "aws_subnet" "tictactoe_subnet_2" {
  vpc_id                  = aws_vpc.tictactoe_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "tictactoe_subnet_2"
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

resource "aws_route_table_association" "tictactoe_rta_2" {
  subnet_id      = aws_subnet.tictactoe_subnet_2.id
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

resource "aws_eip" "tictactoe_eip" {
  instance = aws_instance.tictactoe.id
  vpc      = true

  tags = {
    Name = "${var.name_tag}-eip"
  }
}

resource "aws_iam_instance_profile" "ec2_eb_profile" {
  name = "tictactoe-ec2-profile"
  role = "LabRole"
}

resource "aws_instance" "tictactoe" {
  ami           = var.ami
  instance_type = var.instance_type
  subnet_id     = aws_subnet.tictactoe_subnet.id
  vpc_security_group_ids = [aws_security_group.tictactoe_sg.id, aws_security_group.backend_db_sg.id]

  iam_instance_profile = aws_iam_instance_profile.ec2_eb_profile.name

  tags = {
    Name = var.name_tag
  }
}
