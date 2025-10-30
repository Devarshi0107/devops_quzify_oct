output "repository_urls" {
  value = [for r in aws_ecr_repository.repo : r.repository_url]
}
