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