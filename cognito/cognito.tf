resource "aws_cognito_user_pool" "user_pool" {
  name = "tictactoe_user_pool"

  username_attributes      = []
  auto_verified_attributes = []

  schema {
    name                     = "username"
    developer_only_attribute = false
    mutable                  = true
    # required                 = true
    attribute_data_type      = "String"

    string_attribute_constraints {
      min_length = "1"
      max_length = "256"
    }
  }

  password_policy {
    minimum_length                   = 6
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    require_uppercase                = false
    temporary_password_validity_days = 7
  }
}

resource "aws_cognito_user_pool_client" "frontend_client" {
  name         = "frontend-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
#   generate_secret = false
  prevent_user_existence_errors = "ENABLED"

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  refresh_token_validity = 30
  generate_secret        = false
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain = "tictactoe"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}
