output "vpc_id" {
  value = module.networking.vpc_id
}

output "public_subnet_ids" {
  value = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.networking.private_subnet_ids
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "ecr_repo_urls" {
  value       = try(module.ecr[0].repository_urls, [])
  description = "ECR repository URLs (if enabled)"
}

output "iam_ci_role_arn" {
  value       = try(module.iam[0].ci_role_arn, null)
  description = "IAM role ARN for GitHub Actions (if enabled)"
}

output "frontend_bucket_name" {
  value       = try(module.frontend[0].bucket_name, null)
  description = "S3 bucket for frontend (if enabled)"
}

output "cloudfront_domain_name" {
  value       = try(module.frontend[0].cloudfront_domain_name, null)
  description = "CloudFront domain (if enabled)"
}
