variable "project_id" {
  description = "Google Cloud project ID"
  default     = "avinashvidyarthi"
}

variable "region" {
  description = "Google Cloud region"
  default     = "asia-south1"
}

variable "custom_role_permissions" {
  description = "Permissions for the auto-labeller-custom-role"
  type        = list(string)
  default = [
    "compute.instances.get",
    "compute.instances.setLabels",
    "compute.snapshots.get",
    "compute.snapshots.setLabels",
    "compute.disks.get",
    "compute.disks.setLabels",
    "compute.images.get",
    "compute.images.setLables"
  ]
}

variable "log_filter" {
  type    = string
  default = <<EOF
    logName="projects/avinashvidyarthi/logs/cloudaudit.googleapis.com%2Factivity"
protoPayload.methodName: ("compute.instances.insert" OR "compute.snapshots.insert" OR "compute.disks.insert" OR "compute.images.insert")
    EOF
}
