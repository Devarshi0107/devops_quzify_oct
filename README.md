# A DevOps-Enabled MERN Stack Quiz Platform with Cloud-Native Deployment

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-ECS%20%7C%20S3%20%7C%20CloudFront-orange)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-v1.5%2B-623CE4)](https://www.terraform.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF)](https://github.com/features/actions)

> A production-ready quiz management platform built with MERN stack, deployed on AWS using Infrastructure as Code (Terraform), containerization (Docker), continuous integration (GitHub Actions), and comprehensive monitoring (Prometheus/Grafana).




## 🎯 Overview

This project demonstrates a **complete DevOps lifecycle** for a MERN-based quiz platform where teachers create quizzes, students attempt them with real-time scoring, and admins oversee operations. The focus is on **cloud-native deployment practices** including Infrastructure as Code, CI/CD automation, container orchestration, and observability.

### What Makes This Project Unique?

- ✅ **Full IaC Implementation**: Entire AWS infrastructure provisioned via Terraform modules
- ✅ **Automated CI Pipeline**: GitHub Actions for build, test, scan, and push to ECR
- ✅ **Production-Ready Monitoring**: Prometheus + Grafana with custom metrics endpoints
- ✅ **Serverless Containers**: ECS Fargate for auto-scaling without server management
- ✅ **Security Best Practices**: IAM least-privilege, image scanning, encrypted secrets
- ✅ **Reproducible Environments**: Infrastructure can be rebuilt in minutes

---

## ✨ Features

### Application Features
- 🎓 **Teacher Dashboard**: Create/edit quizzes, manage questions, view student performance
- 📝 **Student Portal**: Browse quizzes, timed attempts, instant scoring, leaderboards
- 👨‍💼 **Admin Panel**: User management, credential generation, system oversight
- 🔐 **JWT Authentication**: Secure role-based access control
- 📊 **Real-time Analytics**: Performance tracking and leaderboard updates
- 📱 **Responsive Design**: TailwindCSS for mobile-friendly interfaces

### DevOps Features
- 🐳 **Docker Containerization**: Multi-stage builds for frontend (Nginx) and backend (Node.js)
- ☁️ **AWS Cloud Native**: ECS Fargate, S3, CloudFront, ECR, VPC, IAM, ALB
- 🛠️ **Infrastructure as Code**: Modular Terraform (networking, ECR, ECS, IAM, S3-CloudFront)
- 🔄 **CI Pipeline**: GitHub Actions auto-builds, pushes to ECR, updates ECS tasks
- 📈 **Observability**: Prometheus scrapes `/metrics` endpoint; Grafana dashboards
- 🔒 **Security**: HTTPS (ACM), image scanning (ECR), secrets management (GitHub Secrets)

---
