import controller from './typeformController'

const router = require('express').Router()

router.route('/:name')
  .get(controller.getByName)

router.route('/token/:token')
  .get(controller.getByToken)

export default router
