exports.stringify = (object) => {

  if (typeof object === 'object') return JSON.stringify(object);
  return object;

};

exports.parse = (string) => {

  if (typeof string === 'string') return JSON.parse(string);
  return string;

};

exports.addQuery = (path, key, value) => {

  try {

    // add a template host
    const host = 'http://localhost:3000';

    let url = host + path;

    url = new URL(url);
    url.searchParams.set(key, value);

    url = url.href.replace(host, '');

    return url;

  }
  catch (err) {

    throw new Error(`Error adding a query to the transaction - ${err.message}`);

  }

};

exports.replaceParam = (path, code = 'aaaaaaaaaaaaaaaaaaaaaaaa', value) => {

  try {

    const url = path.replace(code, value);

    return url;

  }
  catch (err) {

    throw new Error(`Error adding a parameter to the transaction - ${err.message}`);

  }

};
