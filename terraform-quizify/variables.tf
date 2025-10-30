variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "quizify"
}

variable "env" {
  type    = string
  default = "dev"
}

variable "cluster_version" {
  type    = string
  default = "1.29"
}

variable "desired_capacity" {
  type    = number
  default = 2
}

variable "max_capacity" {
  type    = number
  default = 3
}

variable "min_capacity" {
  type    = number
  default = 1
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}

# Toggle modules
variable "enable_ecr" {
  type    = bool
  default = true
}

variable "enable_iam" {
  type    = bool
  default = true
}

variable "enable_frontend" {
  type    = bool
  default = true
}

# ECR
variable "ecr_repos" {
  type    = list(string)
  default = ["quizify-backend", "quizify-frontend"]
}

# IAM (GitHub OIDC)
variable "github_repo" {
  description = "owner/repo for GitHub Actions (e.g., Devarshi0107/ai_quiz_backend)"
  type        = string
  default     = "" # leave empty to skip IAM module or fill to enable
}

variable "github_branch" {
  type    = string
  default = "main"
}

# Frontend
variable "frontend_bucket_name" {
  description = "Optional explicit bucket name. Leave empty to use project-env."
  type        = string
  default     = ""
}
