exports.healthcheck = async (req, res) => {

  try {

    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };

    res.status(200).json(healthcheck);

  }
  catch (err) {

    res.status(503).json({
      uptime: process.uptime(),
      error: err,
      timestamp: Date.now()
    });

  }

};
