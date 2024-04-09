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

variable "solution_stack_name" {
  type = string
}

variable "tier" {
  type = string
}

variable "vpc_id" {}
variable "instance_type" {}
variable "minsize" {}
variable "maxsize" {}
variable "public_subnets" {}