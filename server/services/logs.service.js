const { execCommand } = require('../utils/exec');
const CONTAINER_NAME = process.env.CONTAINER_NAME || 'mtproxy';
async function getLogs(tail = 150) {
  try { return await execCommand(`docker logs ${CONTAINER_NAME} --tail ${tail} 2>&1`); }
  catch (error) { return `Контейнер ${CONTAINER_NAME} не найден или Docker недоступен.\n\n${String(error)}`; }
}
module.exports = { getLogs };
