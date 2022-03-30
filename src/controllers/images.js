const AWS = require('./lib/_aws');

exports.getUrl = async (req, res) => {

  try {

    const images = req.body;
    const { id: userId, email, username } = req.user;

    const urlObjects = await Promise.all(
      images.map((image) => AWS.getPreSignedUrl({
        ...image,
        meta: {
          ...image.meta,
          userId,
          user: `${username} <${email}> [${userId}]`,
        }
      }))
    );

    res.status(201).json(urlObjects);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};
