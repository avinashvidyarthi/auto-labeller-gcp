# Creating a custom role for auto-labeller
resource "google_project_iam_custom_role" "auto_labeller_role" {
  role_id     = "autoLabellerRole"
  title       = "auto-labeller-custom-role"
  description = "Custom role for auto-labeller"
  permissions = var.custom_role_permissions
  stage       = "GA"
}

# Creating a service account for auto-labeller
resource "google_service_account" "auto_labeller_service_account" {
  account_id   = "auto-labeller"
  display_name = "Auto Labeller Service Account"
}

# Attaching role to service account
resource "google_project_iam_member" "auto_labeller_role_member" {
  project    = var.project_id
  role       = "projects/${var.project_id}/roles/${google_project_iam_custom_role.auto_labeller_role.role_id}"
  member     = "serviceAccount:${google_service_account.auto_labeller_service_account.email}"
  depends_on = [google_project_iam_custom_role.auto_labeller_role, google_service_account.auto_labeller_service_account]
}

# Create the pub/sub topic
resource "google_pubsub_topic" "auto_labeller_sink_topic" {
  name = "auto-labeller-sink-topic"
}

# Create the log sink
resource "google_logging_project_sink" "auto_labeller_log_sink" {
  name                   = "auto-labeller-log-sink"
  description            = "Auto Labeller Log Sink"
  destination            = "pubsub.googleapis.com/projects/${var.project_id}/topics/${google_pubsub_topic.auto_labeller_sink_topic.name}"
  filter                 = var.log_filter
  unique_writer_identity = true
  depends_on             = [google_pubsub_topic.auto_labeller_sink_topic]
}

# Attaching role to writer identity of sink to publish on pub/sub
resource "google_project_iam_member" "sink_writer_identity_publisher" {
  project    = var.project_id
  role       = "roles/pubsub.publisher"
  member     = google_logging_project_sink.auto_labeller_log_sink.writer_identity
  depends_on = [google_logging_project_sink.auto_labeller_log_sink]
}

# Create a bucket to store the code's zip file for Cloud Function
resource "google_storage_bucket" "function_code_bucket" {
  name     = "${var.project_id}-auto-labeller-function"
  location = var.region
}

# Generates an archive of the source code compressed as a .zip file.
data "archive_file" "source" {
  type        = "zip"
  source_dir  = "./src"
  output_path = "./tmp/function.zip"
  excludes = [
    "./src/node_modules/*",
    "./src/package-lock.json",
  ]
}

# Add source code zip to the Cloud Function's bucket
resource "google_storage_bucket_object" "auto_labeller_code" {
  source       = data.archive_file.source.output_path
  content_type = "application/zip"

  # Append to the MD5 checksum of the files's content
  # to force the zip to be updated as soon as a change occurs
  name   = "src-${data.archive_file.source.output_md5}.zip"
  bucket = google_storage_bucket.function_code_bucket.name

  # Dependencies are automatically inferred so these lines can be deleted
  depends_on = [
    google_storage_bucket.function_code_bucket,
    data.archive_file.source
  ]
}

# Create the Cloud function 
resource "google_cloudfunctions_function" "auto_labeller_function" {
  name          = "auto-labeller-function"
  runtime       = "nodejs18"
  max_instances = 5

  # Get the source code of the cloud function as a Zip compression
  source_archive_bucket = google_storage_bucket.function_code_bucket.name
  source_archive_object = google_storage_bucket_object.auto_labeller_code.name

  # Must match the function name in the cloud function `main.py` source code
  entry_point = "labelResource"

  service_account_email = google_service_account.auto_labeller_service_account.email
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = "projects/${var.project_id}/topics/${google_pubsub_topic.auto_labeller_sink_topic.name}"
  }

  # Dependencies are automatically inferred so these lines can be deleted
  depends_on = [
    google_storage_bucket.function_code_bucket,
    google_storage_bucket_object.auto_labeller_code
  ]
}
