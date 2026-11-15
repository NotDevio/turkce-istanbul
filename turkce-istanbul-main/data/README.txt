This folder holds your accounts and progress.

  db.json   created automatically the first time the server runs.
            Every account: username, password HASH (scrypt - the real password is not stored and cannot be read back),
            and its learning progress (XP, streak, units, words, exams, mistakes). Login sessions are stored here too.

Back up or move this folder to keep your accounts. Do not edit db.json while the server is running.
Move it elsewhere with:  DATA_DIR=/path/to/folder node server.js

  backups/  one copy of db.json per day (the newest 14 are kept). To restore: stop the server, copy a backup over db.json, start again.
