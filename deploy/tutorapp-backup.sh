#!/bin/sh
# TutorApp: nightly backup of /var/lib/tutorapp (accounts, states, snapshots).
# Keeps the last 14 archives. Installed at /usr/local/bin/tutorapp-backup.sh,
# scheduled by /etc/cron.d/tutorapp-backup.
set -e
DIR=/var/backups/tutorapp
mkdir -p "$DIR"
tar -czf "$DIR/tutorapp-$(date +%Y%m%d-%H%M).tar.gz" -C /var/lib tutorapp
ls -1t "$DIR"/tutorapp-*.tar.gz | tail -n +15 | xargs -r rm --
