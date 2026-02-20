# Local dev storage
# User-uploaded images are stored here for local development.
# 
# 🔄 PRODUCTION SWITCH:
# For production, switch to Supabase Storage or S3-compatible storage.
# Update lib/storage.ts (create this file) to use:
#   - Supabase: supabase.storage.from('uploads').upload(...)
#   - S3: @aws-sdk/client-s3 PutObjectCommand
#
# This directory is gitignored by default. Ensure /storage is in .gitignore.
