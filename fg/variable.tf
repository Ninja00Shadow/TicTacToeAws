variable "app_name" {
  type    = string
}

variable "region" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "service_name" {
  type = string
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "docker_image" {
  type = string
}

variable "app_port" {
  type    = number
  default = 80
}

variable "lb_name" {
  type = string
}


output "load_balancer_dns" {
  value = aws_lb.fargate_lb.dns_name
}