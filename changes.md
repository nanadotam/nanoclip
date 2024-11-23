# NanoClip System Changes & Security Features

## 1. Automated Cleanup System

### Background Cleanup Process
- Daemon-based cleanup process running every 60 seconds (cleanup-daemon.php)
- Fallback cron job for redundancy (cleanup.php)
- Transaction-based cleanup with rollback support
- Deletes both expired clips and associated files
- Handles view-once clips after access

### Security Features
- File locking using cleanup.lock prevents concurrent cleanup operations
- 10-minute stale lock detection and auto-removal
- Detailed error logging to cleanup-daemon.log
- JSON validation of file metadata before deletion

## 2. File Management

### Upload Security
- Strict file type validation against allowed MIME types
- Category-based size limits enforced:
  - Documents (pdf, doc, docx): 25MB
  - Images (jpg, png, gif): 10MB 
  - Audio (mp3, wav): 50MB
  - Video (mp4, mov): 100MB
  - Archives (zip, rar): 50MB
- PHP code detection in uploads
- File extension validation

### Storage Security
- Files renamed using format: uniqid()_timestamp.extension
- Uploads stored outside web root
- 0644 permissions on uploaded files
- Separate directories for temporary and permanent storage

## 3. Clip Protection

### Password Protection
- Argon2id hashing with PASSWORD_DEFAULT
- Custom work factors based on server capabilities
- No plain text passwords stored or logged
- Rate limiting on password attempts (3 per minute)

### Expiration System
- Configurable expiration options:
  - 1 minute
  - 1 hour
  - 24 hours
  - 72 hours
  - 1 week
- View-once clips deleted after first access
- Automatic cleanup of expired content

## 4. Database Security

### Transaction Management
- Full ACID compliance on all operations
- Automatic rollback on failures
- Prepared statements for all queries
- Input validation and sanitization
- Foreign key constraints

### Data Integrity
- URL slug validation (alphanumeric + hyphens only)
- JSON schema validation for metadata
- NULL handling for optional fields
- Timestamp validation for expiry dates

## 5. API Security

### Request Validation
- Content-Type enforcement
- Origin validation
- File size pre-validation
- Required field validation
- CORS policy enforcement

### Error Handling
- Structured JSON error responses
- Sanitized error messages to clients
- Detailed internal error logging
- HTTP status code mapping

## 6. View-Once Implementation

### Security Measures
- Single-transaction deletion process
- File removal verification
- Database record deletion
- Access logging before deletion
- No caching headers sent

## 7. System Requirements

### Server Configuration
- PHP 8.2 or higher
- MariaDB 10.4+
- Required PHP Extensions:
  - PDO
  - JSON
  - FileInfo
  - OpenSSL
- Directory permissions:
  - uploads: 0755
  - logs: 0755
  - data: 0755

## 8. Monitoring

### Logging Implementation
- Separate log files:
  - cleanup-daemon.log: Cleanup operations
  - error.log: System errors
  - access.log: Clip access
  - security.log: Security events
- Log rotation enabled
- JSON formatted log entries
- Timestamp and IP logging

## 9. Future Enhancements

### Planned Features
- API rate limiting per IP
- Enhanced file type detection using magic bytes
- Automated backup system
- Additional encryption layers for stored files
- Geographic access restrictions

## 10. Testing Procedures

### Required Tests
1. Expiration Testing
   - Create clips with each expiry option
   - Verify timely deletion
   - Check file removal
   - Validate database cleanup

2. File Management Testing
   - Upload size limits
   - MIME type validation
   - Storage security
   - Deletion verification

3. Security Testing
   - Password protection
   - View-once functionality
   - Transaction integrity
   - Concurrent access handling

4. Performance Testing
   - Cleanup daemon efficiency
   - Database query optimization
   - File system operations
   - Memory usage monitoring