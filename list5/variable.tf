variable "ami" {
  description = "The AMI to use for the instance"
  type        = string
}

variable "instance_type" {
  description = "The type of instance to launch"
  type        = string
}

variable "name_tag" {
  description = "The name tag to apply to the instance"
  type        = string
}

variable "region" {
  description = "The region to launch the instance in"
  type        = string
}

output "public_ip" {
  description = "The public IP address of the instance"
  value       = aws_instance.tictactoe.public_ip
}

output "instance_id" {
  description = "The ID of the instance"
  value       = aws_instance.tictactoe.id
}

variable "db_username" {
  description = "The username for the database"
  type        = string
}

variable "db_password" {
  description = "The password for the database"
  type        = string
}

variable "db_engine" {
  description = "The database engine to use"
  type        = string
}

variable "db_engine_version" {
  description = "The version of the database engine to use"
  type        = string
}

variable "db_instance_class" {
  description = "The instance class to use for the database"
  type        = string
}

variable "db_allocated_storage" {
  description = "The amount of storage to allocate for the database"
  type        = number
}

variable "db_name" {
  description = "The name of the database"
  type        = string
}

variable "db_parameter_group_name" {
  description = "The name of the parameter group to use for the database"
  type        = string
}