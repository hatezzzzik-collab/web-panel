function parseStatus(text) {
  const data = {};
  for (const line of text.split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { container: data.Container || '', status: data.Status || '', ip: data.IP || '', secret: data.BotSecret || '', tag: data.Tag || '', link: data.Link || '' };
}
module.exports = { parseStatus };
