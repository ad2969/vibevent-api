/* eslint-disable import/no-extraneous-dependencies */

const morgan = require('morgan');

exports.morganMiddleware = morgan((tokens, req, res) => {

  const error = tokens.status(req, res) >= 400;
  return [
    error ? `\n** ERROR: ${tokens.method(req, res)}` : `\n${tokens.method(req, res)}`, tokens.url(req, res),
    `\nReturned ${tokens.status(req, res)} ${res.statusMessage}`,
    'after', `${tokens['response-time'](req, res)} ms`,
    `\n${tokens['user-agent'](req, res)}`,
    '@', tokens.date(req, res),
    '\n-------------------------------------------------------------------',
  ].join(' ');

});

exports.responseLoggingMiddleware = (req, res, next) => {

  const defaultWrite = res.write;
  const defaultEnd = res.end;

  const chunks = [];

  res.write = (...restArgs) => {

    // eslint-disable-next-line
    chunks.push(new Buffer(restArgs[0]));
    defaultWrite.apply(res, restArgs);

  };

  res.end = (...restArgs) => {

    // eslint-disable-next-line
    if (restArgs[0]) chunks.push(new Buffer(restArgs[0]));
    const body = Buffer.concat(chunks).toString('utf8');
    defaultEnd.apply(res, restArgs);

    console.debug(body);

  };

  next();

};
