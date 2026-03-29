const { execCommand } = require('../utils/exec');
const { parseStatus } = require('../utils/parseStatus');

const PROXY_BIN = process.env.PROXY_BIN || '/usr/local/bin/proxy';

async function getStatus() {
  const raw = await execCommand(`${PROXY_BIN} status`);
  return parseStatus(raw);
}

async function getSecret() {
  return await execCommand(`${PROXY_BIN} secret show`);
}

async function getTag() {
  return await execCommand(`${PROXY_BIN} tag show`);
}

async function setTag(tag) {
  return await execCommand(`${PROXY_BIN} tag set ${tag}`);
}

async function clearTag() {
  return await execCommand(`${PROXY_BIN} tag clear`);
}

async function getLink() {
  return await execCommand(`${PROXY_BIN} link`);
}

async function restartProxy() {
  return await execCommand(`${PROXY_BIN} restart`);
}

async function uninstallProxy() {
  return await execCommand(`printf 'YES\\n' | ${PROXY_BIN} uninstall`);
}

module.exports = {
  getStatus,
  getSecret,
  getTag,
  setTag,
  clearTag,
  getLink,
  restartProxy,
  uninstallProxy
};
