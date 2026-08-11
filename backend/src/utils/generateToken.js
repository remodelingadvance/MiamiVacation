import jwt from 'jsonwebtoken';

const tokenPayload = (userOrId) => ({
  id: userOrId?._id || userOrId,
  version: Number(userOrId?.tokenVersion || 0),
});

const generateToken = (userOrId) => {
  return jwt.sign(tokenPayload(userOrId), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const generateRefreshToken = (userOrId) => {
  return jwt.sign(tokenPayload(userOrId), process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
  });
};

export { generateToken, generateRefreshToken };
