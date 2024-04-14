resource "aws_lb" "fargate_lb" {
  name            = var.lb_name
  security_groups = [aws_security_group.fargate_sg.id]
  subnets         = [aws_subnet.fargate_subnet1.id, aws_subnet.fargate_subnet2.id]
}

resource "aws_lb_target_group" "fargate_target_group" {
  name        = var.app_name
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.fargate_vpc.id

  depends_on = [aws_lb.fargate_lb]
}

resource "aws_lb_listener" "fargate_lb_listener" {
  load_balancer_arn = aws_lb.fargate_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fargate_target_group.arn
  }

  depends_on = [aws_lb.fargate_lb]
}

resource "aws_lb_target_group" "backend_target_group" {
  name        = "${var.app_name}-backend"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.fargate_vpc.id

  depends_on = [aws_lb.fargate_lb]
}

resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.fargate_lb.arn
  port              = 8000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_target_group.arn
  }
}
