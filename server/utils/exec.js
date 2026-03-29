const { exec } = require('child_process');

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { shell: '/bin/bash', maxBuffer: 1024 * 1024 * 4 },
      (error, stdout, stderr) => {
        if (error) {
          return reject((stderr || error.message || '').trim());
        }
        resolve((stdout || stderr || '').trim());
      }
    );
  });
}

module.exports = { execCommand };
