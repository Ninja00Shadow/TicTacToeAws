resource "aws_sns_topic" "topic" {
  name = "ec2-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.topic.arn
  protocol  = "email"
  endpoint  = var.email

}

resource "aws_cloudwatch_metric_alarm" "high_cpu_usage" {
  alarm_name                = "high-cpu-usage"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = 1
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EC2"
  period                    = 60
  statistic                 = "Average"
  threshold                 = 75
  alarm_description         = "This metric monitors ec2 cpu usage"
  actions_enabled           = true
  alarm_actions             = [aws_sns_topic.topic.arn]
  dimensions = {
    InstanceId = aws_instance.tictactoe.id
  }

}

resource "aws_cloudwatch_metric_alarm" "instance_not_running" {
  alarm_name          = "EC2-Not-Running"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Trigger an alert if EC2 instance is not running"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.topic.arn]
  dimensions = {
    InstanceId = aws_instance.tictactoe.id
  }
}

resource "aws_cloudwatch_metric_alarm" "no_instances_type" {
  alarm_name          = "No-Instances-Type"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Trigger an alert if no instances are running"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.topic.arn]

  dimensions = {
    InstanceType = var.instance_type
  }
}

resource "aws_cloudwatch_metric_alarm" "no_intances_asg" {
  alarm_name          = "No-Instances-Running"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "GroupInServiceInstances"
  namespace           = "AWS/AutoScaling"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Trigger an alert if no instances are running"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.topic.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.tictactoe_asg.name
  }
}