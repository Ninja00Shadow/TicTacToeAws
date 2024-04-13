variable "name_tag" {
  type    = string
  default = "tictactoe"
}

variable "region" {
  type = string
}

variable "beanstalkappenv" {
  default = "tictactoe-env"
}
variable "solution_stack_name" {}
variable "tier" {}
variable "vpc_id" {}
variable "instance_type" {}
variable "minsize" {}
variable "maxsize" {}
variable "public_subnets" {}
variable "security_groups" {}
variable "app_port" {
  default = 8000
}