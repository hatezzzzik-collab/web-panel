function parseStatus(text) {
  const lines = text.split('\n');
  const data = {};

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  }

  return {
    container: data.Container || '',
    status: data.Status || '',
    ip: data.IP || '',
    secret: data.BotSecret || '',
    tag: data.Tag || '',
    link: data.Link || ''
  };
}

module.exports = { parseStatus };
