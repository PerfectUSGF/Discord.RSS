const express = require('express')
const guildFeedsAPI = express.Router({ mergeParams: true })
const validate = require('../../../../middleware/validator.js')
const guildHasFeed = require('../../../../middleware/guildHasFeed.js')
const guildHasChannel = require('../../../../middleware/guildHasChannel.js')
const guildHasChannelOptional = require('../../../../middleware/guildHasChannelOptional.js')
const {
  isMongoID
} = require('../../../../util/validators/index.js')
const {
  param,
  body
} = require('express-validator')

guildFeedsAPI.post('/', [
  validate([
    body(['url', 'channel'])
      .isString().withMessage('Must be a string')
      .notEmpty().withMessage('Cannot be empty'),
  ]),
  guildHasChannel
], require('../../../../controllers/api/guilds/feeds/createFeed.js'))

// Make sure feedID exists before proceeding
guildFeedsAPI.use('/:feedID', validate([
  param('feedID')
    .custom(isMongoID).withMessage('Invalid resource ID')
]))

// Make sure the guild has this feed, and inject the feed into req.feed
guildFeedsAPI.use('/:feedID', guildHasFeed)

// Get feed placeholders
guildFeedsAPI.get('/:feedID/placeholders', require('../../../../controllers/api/guilds/feeds/getFeedPlaceholders.js'))

// Edit the feed
guildFeedsAPI.patch('/:feedID', [
  validate([
    body(['channel', 'title'])
      .if(val => !!val)
      .isString().withMessage('Must be a string')
      .notEmpty().withMessage('Cannot be empty'),
    body([
      'checkTitles',
      'checkDates',
      'imgPreviews',
      'imgLinksExistence',
      'formatTables',
      'toggleRoleMentions'
    ]).if(val => !!val)
      .isBoolean().withMessage('Must be a boolean')
  ]),
  guildHasChannelOptional
], require('../../../../controllers/api/guilds/feeds/editFeed.js'))

module.exports = guildsAPI