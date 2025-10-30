# Declare the data sources first
data "aws_eks_cluster" "cluster" {
  name = aws_eks_cluster.this.name
}

data "aws_eks_cluster_auth" "cluster" {
  name = aws_eks_cluster.this.name
}

# Helm provider using the EKS cluster data
provider "helm" {
  kubernetes = {
    host                   = data.aws_eks_cluster.cluster.endpoint
    token                  = data.aws_eks_cluster_auth.cluster.token
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "quizify-monitoring"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "48.0.1"
  namespace  = "monitoring"
  create_namespace = true

  values = [
    <<EOF
grafana:
  adminUser: admin
  adminPassword: AdminPass123
  service:
    type: LoadBalancer
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
EOF
  ]
}
