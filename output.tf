output "auto_labeller_role_info" {
  description = "Information about the created auto labeller custom role"
  value = {
    role_id     = google_project_iam_custom_role.auto_labeller_role.role_id
    title       = google_project_iam_custom_role.auto_labeller_role.title
    permissions = google_project_iam_custom_role.auto_labeller_role.permissions
  }
}

output "service_account_email" {
  value = {
    service_account_email = google_service_account.auto_labeller_service_account.email
    service_account_name  = google_service_account.auto_labeller_service_account.name
    iam_member            = google_project_iam_member.auto_labeller_role_member.member
  }
}

# Output block for the pub/sub topic
output "auto_labeller_sink_topic" {
  value = google_pubsub_topic.auto_labeller_sink_topic.name
}

# Output block for the log sink
output "log_sink_name" {
  value = google_logging_project_sink.auto_labeller_log_sink.name
}

# Output block for bucket name
output "bucket_name" {
  value = google_storage_bucket.function_code_bucket.name
}