import models from '../../db/models';
import nextConnect from 'next-connect';

const Accounts = models.accounts;

export default nextConnect()
  .get(async (req, res) => {
    try {
      const { uuid } = req.query;

      let accounts;
      if (req) {
        accounts = await Accounts.findOne({
          where: {
            uuid,
          },
        });
      } else {
        accounts = await Accounts.findAll();
      }
      res.status(200).json({ accounts });
    } catch (e) {
      res.status(400).json({
        error_code: 'getAccount',
        message: e.message,
      });
    }
  })
  .post(async (req, res) => {
    try {
      const [account, created] = await Accounts.findOrCreate({
        where: { username: req.body.username },
        defaults: req.body,
        paranoid: false,
      });
      if (created) {
        res.status(200).json({ account });
      } else {
        res.status(200).json({
          error_code: 'postAccount',
          message: 'The username already exists',
        });
      }
    } catch (e) {
      res.status(400).json({
        error_code: 'postAccount',
        message: e.message,
      });
    }
  })
  .patch(async (req, res) => {
    try {
      const account = await Accounts.update(req.body, {
        where: {
          id: req.body.id,
        },
        paranoid: false,
      });
      res.status(200).json({ account });
    } catch (e) {
      res.status(400).json({
        error_code: 'patchAccount',
        message: e.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      await Accounts.destroy({
        where: {
          id: req.body.id,
        },
        force: req.body.force,
      });
      res.status(200).json({ message: 'success' });
    } catch (e) {
      res.status(400).json({
        error_code: 'deleteAccount',
        message: e.message,
      });
    }
  });
