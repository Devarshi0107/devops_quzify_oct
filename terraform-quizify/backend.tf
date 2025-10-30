terraform {
  backend "s3" {
    bucket         = "quizify-terraform-state-bucket" # actual bucket name from bootstrap
    key            = "quizify/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "quizify-terraform-locks" # actual DynamoDB table name from bootstrap
    encrypt        = true
  }
}
