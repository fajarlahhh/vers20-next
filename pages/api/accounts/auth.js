import models from '../../../db/models';
import bcryptjs from 'bcryptjs';
import nextConnect from 'next-connect';

const jwt = require('jsonwebtoken');

const Accounts = models.accounts;

export default nextConnect().post(async (req, res) => {
  const { username, password } = req.body;
  const accounts = await Accounts.findOne(
    {
      where: {
        username,
      },
    },
    {
      include: ['contract'],
    },
  );

  if (!accounts) {
    return res.status(200).send({
      error_code: 'authentication',
      message: 'Invalid username',
    });
  }

  if (!bcryptjs.compareSync(password, accounts.password)) {
    return res.status(200).send({
      error_code: 'authentication',
      message: 'Invalid password',
    });
  }

  const token = jwt.sign({ sub: accounts.username }, 'Vers20 2022', {
    expiresIn: '1d',
  });

  return res.status(200).json({
    username: accounts.username,
    walletAddress: accounts.walletAddress,
    contract: accounts.contract,
    token,
  });
});
