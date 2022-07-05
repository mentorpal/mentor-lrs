module "pipeline" {
  # source                  = "git@github.com:mentorpal/terraform-modules//modules/gitflow_cicd_pipeline?ref=tags/v1.6.1"
  source                  = "git@github.com:mentorpal/terraform-modules//modules/gitflow_cicd_pipeline?ref=gitflow-cicd"
  codestar_connection_arn = var.codestar_connection_arn
  project_name            = "mentor-lrs"
  github_org              = "mentorpal"
  github_repo_name        = "mentor-lrs"
  github_branch_dev       = "main"
  github_branch_release   = "release"
  # 
  enable_e2e_tests            = false
  enable_status_notifications = true
  build_buildspec             = "cicd/buildspec.yml"
  deploy_dev_buildspec        = "cicd/deployspec-dev.yml"
  deploy_qa_buildspec         = "cicd/deployspec-qa.yml"
  deploy_prod_buildspec       = "cicd/deployspec-prod.yml"

  # reference: https://github.com/cloudposse/terraform-aws-codebuild#inputs
  build_image  = "aws/codebuild/standard:5.0"
  deploy_image = "aws/codebuild/standard:5.0"
  # https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html
  build_compute_type      = "BUILD_GENERAL1_SMALL"
  deploys_compute_type    = "BUILD_GENERAL1_SMALL"
  build_cache_type        = "LOCAL"
  deploy_cache_type       = "LOCAL"
  builds_privileged_mode  = false
  deploys_privileged_mode = false

  tags = {
    Source  = "terraform"
    Project = "mentorpal"
  }

  providers = {
    aws = aws.us_east_1
  }
}
