# ==============================================================================
# CareHealth Point – AWS Cloud Infrastructure Provisioning
# Course: DevOps & Automation Lab (ENSP461)
# ==============================================================================

# Availability Zones Data Source
data "aws_availability_zones" "available" {
  state = "available"
}

# 1. CareHealth VPC
resource "aws_vpc" "carehealth_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "carehealth-vpc"
  }
}

# 2. Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.carehealth_vpc.id

  tags = {
    Name = "carehealth-igw"
  }
}

# 3. Public Subnets (Across 2 AZs for High Availability)
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.carehealth_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "carehealth-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# 4. Private Subnets (Across 2 AZs for Database & Internal Services)
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.carehealth_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "carehealth-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# 5. Public Route Table & Association
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.carehealth_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "carehealth-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# 6. Security Groups
# Application Load Balancer / Frontend Security Group
resource "aws_security_group" "web_sg" {
  name        = "carehealth-web-sg"
  description = "Allow inbound HTTP and HTTPS traffic"
  vpc_id      = aws_vpc.carehealth_vpc.id

  ingress {
    description = "HTTP Ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "FastAPI Backend Port"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "carehealth-web-sg"
  }
}

# Database Security Group (Restricted to Web/App SG)
resource "aws_security_group" "db_sg" {
  name        = "carehealth-db-sg"
  description = "Allow PostgreSQL access strictly from application nodes"
  vpc_id      = aws_vpc.carehealth_vpc.id

  ingress {
    description     = "PostgreSQL from App Tier"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "carehealth-db-sg"
  }
}

# 7. S3 Bucket for Secure Document Backups & Terraform Remote State
resource "aws_s3_bucket" "carehealth_backups" {
  bucket        = "carehealth-point-assets-backup-${var.environment}"
  force_destroy = false

  tags = {
    Name = "carehealth-backups"
  }
}

# S3 Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encrypt" {
  bucket = aws_s3_bucket.carehealth_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
