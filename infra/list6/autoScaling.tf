resource "aws_launch_configuration" "config" {
  name            = "tictactoe-launch-configuration"
  image_id        = var.ami
  instance_type   = var.instance_type
  security_groups = [aws_security_group.tictactoe_sg.id]

  user_data = file("${path.module}/setup.sh")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "tictactoe_asg" {
  launch_configuration = aws_launch_configuration.config.id
  vpc_zone_identifier  = [aws_subnet.tictactoe_subnet1.id]

  min_size         = 1
  max_size         = 3
  desired_capacity = 2

  enabled_metrics = [ 
    "GroupInServiceInstances", 
  ]

  tag {
    key                 = "Name"
    value               = "ASG-TicTacToe"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "increase_policy" {
  name                   = "increase-capacity"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.tictactoe_asg.name
  policy_type            = "SimpleScaling"
}

resource "aws_autoscaling_policy" "decrease_policy" {
  name                   = "decrease-capacity"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.tictactoe_asg.name
  policy_type            = "SimpleScaling"
}

resource "aws_cloudwatch_metric_alarm" "asg-up-alarm" {
  alarm_name          = "asg-high-cpu-usage"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "This metric monitors ec2 cpu usage"
  actions_enabled     = true
  alarm_actions       = [aws_autoscaling_policy.increase_policy.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.tictactoe_asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "asg-down-alarm" {
  alarm_name          = "asg-low-cpu-usage"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 25
  alarm_description   = "This metric monitors ec2 cpu usage"
  actions_enabled     = true
  alarm_actions       = [aws_autoscaling_policy.decrease_policy.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.tictactoe_asg.name
  }
}
