import models from '../../db/models';
import nextConnect from 'next-connect';

const Contracts = models.contracts;

export default nextConnect().get(async (req, res) => {
  try {
    const contracts = await Contracts.findAll({
      include: ['hasAccount'],
    });

    res.status(200).json({ contracts });
  } catch (e) {
    res.status(400).json({
      error_code: 'getContracts',
      message: e.message,
    });
  }
});
