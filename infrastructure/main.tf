terraform {
  backend "s3" {
    bucket         = "mentorpal-lrs-tf-state-us-east-1"
    region         = "us-east-1"
    key            = "terraform.tfstate"
    dynamodb_table = "mentorpal-lrs-tf-lock"
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

provider "aws" {
  region = "us-west-2"
  alias  = "us_west_2"
}
