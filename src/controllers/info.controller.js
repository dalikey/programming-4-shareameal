let controller = {
  info: (req, res, next) => {
    res.status(200).json({
      status: 200,
      message: 'Welcome to the Share A Meal Database API',
      documentation: 'https://shareameal-api.herokuapp.com/docs/',
      additionalInfo: [
        'Not in the documentation, add this to the URL to filter by isActive or firstName:',
        '/api/user?isActive=true',
        '/api/user?firstName=herman',
        'Made by Junhao (2189845)',
      ],
    });
  },
};

module.exports = controller;
