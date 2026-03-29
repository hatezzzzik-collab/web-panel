const { execCommand } = require('../utils/exec');
const CONTAINER_NAME = process.env.CONTAINER_NAME || 'mtproxy';
async function getLogs(tail = 100) {
  return await execCommand(`docker logs ${CONTAINER_NAME} --tail ${tail} 2>&1`);
}
module.exports = { getLogs };
