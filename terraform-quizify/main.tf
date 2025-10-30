locals {
  name_prefix           = "${var.project_name}-${var.env}"
  frontend_bucket_final = length(var.frontend_bucket_name) > 0 ? var.frontend_bucket_name : "${var.project_name}-frontend-${var.env}"
}

module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  env          = var.env
}

module "eks" {
  source             = "./modules/eks"
  project_name       = var.project_name
  env                = var.env
  cluster_version    = var.cluster_version
  subnet_ids         = module.networking.private_subnet_ids
  vpc_id             = module.networking.vpc_id
  desired_capacity   = var.desired_capacity
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  node_instance_type = var.node_instance_type
}

module "ecr" {
  source = "./modules/ecr"
  count  = var.enable_ecr ? 1 : 0

  project_name = var.project_name
  env          = var.env
  repos        = var.ecr_repos
}

module "iam" {
  source = "./modules/iam"
  count  = var.enable_iam && length(var.github_repo) > 0 ? 1 : 0

  project_name  = var.project_name
  env           = var.env
  github_repo   = var.github_repo
  github_branch = var.github_branch
}

module "frontend" {
  source = "./modules/frontend"
  count  = var.enable_frontend ? 1 : 0

  project_name = var.project_name
  env          = var.env
  bucket_name  = local.frontend_bucket_final
}
