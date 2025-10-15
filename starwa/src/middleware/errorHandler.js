export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal Server Error' };
  if (process.env.NODE_ENV !== 'production') {
    if (err.stack) payload.stack = err.stack;
    if (err.code) payload.code = err.code;
    if (err.errno) payload.errno = err.errno;
    if (err.sqlMessage) payload.sqlMessage = err.sqlMessage;
    if (err.sql) payload.sql = err.sql;
  }
  res.status(status).json(payload);
}
