locals {
  repo_map = { for r in var.repos : r => r }
}

resource "aws_ecr_repository" "repo" {
  for_each             = local.repo_map
  name                 = "${var.project_name}/${var.env}/${each.value}-v2"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Project = var.project_name
    Env     = var.env
    App     = each.value
  }
}
