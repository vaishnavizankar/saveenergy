# --- AMAZON S3 (FRONTEND STATIC ASSETS) ---

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "saveenergy-frontend-production-${random_id.id.hex}"
  # Allow the bucket to be destroyed even if it contains files
  force_destroy = true
}

# Block all direct public access (Best practice)
resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- AMAZON CLOUDFRONT (CDN & HTTPS) ---

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "saveenergy-oac"
  description                       = "CloudFront Access to SaveEnergy Frontend S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                   = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend_distribution" {
  # --- ORIGIN 1: S3 STATIC ASSETS ---
  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
    origin_id                = "S3-SaveEnergy-Frontend"
  }

  # --- ORIGIN 2: ECS BACKEND API ---
  origin {
    domain_name = aws_lb.backend_alb.dns_name
    origin_id   = "ECS-SaveEnergy-Backend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # ALB is listening on HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "GreenOps SaveEnergy Frontend Distribution"
  default_root_object = "index.html"

  # --- BEHAVIOR 1: API PROXY (/api/*) ---
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ECS-SaveEnergy-Backend"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Host"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # --- BEHAVIOR 2: WEBSOCKET PROXY (/ws/*) ---
  ordered_cache_behavior {
    path_pattern     = "/ws/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ECS-SaveEnergy-Backend"

    forwarded_values {
      query_string = true
      # CloudFront detects WebSocket Upgrade automatically if Host is forwarded
      headers      = ["Authorization", "Origin", "Host"] 
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # --- BEHAVIOR 3: DEFAULT (S3) ---
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-SaveEnergy-Frontend"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # SPA (Single Page App) Support: Redirect 404s to index.html
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 30
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 30
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Ensure the bucket is created before the distribution tries to fetch from it
  depends_on = [aws_s3_bucket.frontend_bucket]
}

# Bucket Policy to allow CloudFront to read objects
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "s3:GetObject"
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.frontend_bucket.arn}/*"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend_distribution.arn
          }
        }
      }
    ]
  })
}

# Output the URL for convenience
output "frontend_url" {
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
  description = "The public URL of the SaveEnergy Frontend"
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend_bucket.bucket
  description = "The S3 bucket name for uploading frontend build files"
}
