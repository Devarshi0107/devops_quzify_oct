output "ci_role_arn" {
  value = aws_iam_role.ci_role.arn
}

output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}
