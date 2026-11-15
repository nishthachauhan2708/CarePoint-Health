variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1" # Asia Pacific (Mumbai)
}

variable "environment" {
  description = "Application deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the CareHealth VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "instance_type" {
  description = "EC2 compute instance type for cluster worker nodes"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "SSH Key pair name for EC2 node access"
  type        = string
  default     = "carehealth-key"
}
