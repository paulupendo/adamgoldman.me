import controller from './typeformController'

const router = require('express').Router()

router.route('/:name')
  .get(controller.getDummy)

router.route('/')
  .post(controller.postDummy)

export default router
