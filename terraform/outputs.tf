output "vpc_id" {
  description = "ID of the CareHealth VPC"
  value       = aws_vpc.carehealth_vpc.id
}

output "public_subnets" {
  description = "IDs of the public subnets for load balancers"
  value       = aws_subnet.public[*].id
}

output "private_subnets" {
  description = "IDs of the private subnets for database workloads"
  value       = aws_subnet.private[*].id
}

output "web_security_group_id" {
  description = "Security group ID for frontend & API"
  value       = aws_security_group.web_sg.id
}

output "db_security_group_id" {
  description = "Security group ID for PostgreSQL database"
  value       = aws_security_group.db_sg.id
}

output "s3_backup_bucket_name" {
  description = "S3 Bucket for persistent backups"
  value       = aws_s3_bucket.carehealth_backups.id
}
