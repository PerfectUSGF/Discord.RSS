const Discord = require('discord.js')
const moment = require('moment')
const ScheduleStats = require('../structs/db/ScheduleStats.js')

module.exports = async (message) => {
  const results = await ScheduleStats.getAll()
  const bot = message.client
  const scheduleStats = results.find(r => r._id === 'default')
  if (!scheduleStats) {
    return message.channel.send('More time is needed to gather enough information. Try again later.')
  }
  if (scheduleStats.feeds === 0) {
    return message.channel.send('No feeds found for any data.')
  }
  const sizeFetches = await bot.shard.fetchClientValues('guilds.cache.size')

  const aggregated = {
    guilds: sizeFetches.reduce((prev, val) => prev + val, 0),
    feeds: scheduleStats.feeds,
    cycleTime: scheduleStats.cycleTime,
    cycleFails: scheduleStats.cycleFails,
    cycleURLs: scheduleStats.cycleURLs,
    lastUpdated: new Date(scheduleStats.lastUpdated)
  }

  const visual = new Discord.MessageEmbed()
    .setAuthor('Basic Performance Stats')
    .setDescription(`
**Unique Feeds** - Number of unique feed links (duplicate links are not counted).
**Total Feeds** - Number of total feeds.
**Cycle Duration** - The time it takes to process all the unique feed links.
**Cycle Failures** - The number of failures out of the number of unique feeds per cycle. 
**Success Rate** - The rate at which unique links connect successfully per cycle. A high rate is necessary to ensure that all feeds are fetched.\n\u200b`)

  const guilds = `${aggregated.guilds}`
  const feeds = `${aggregated.feeds}`
  const cycleURLs = `${aggregated.cycleURLs.toFixed(2)}`
  const cycleFails = `${aggregated.cycleFails.toFixed(2)}`
  const cycleTime = `${aggregated.cycleTime.toFixed(2)}s`
  const successRate = `${((1 - aggregated.cycleFails / aggregated.cycleURLs) * 100).toFixed(2)}%`

  visual
    .addField('Servers', guilds, true)
    .addField('Shard Count', bot.shard.count, true)
    .addField('\u200b', '\u200b', true)

  let diff = moment.duration(moment().diff(moment(aggregated.lastUpdated)))
  if (diff.asMinutes() < 1) {
    diff = `Updated ${diff.asSeconds().toFixed(2)} seconds ago`
  } else {
    diff = `Updated ${diff.asMinutes().toFixed(2)} minutes ago`
  }

  visual
    .addField('Unique Feeds', cycleURLs, true)
    .addField('Total Feeds', feeds, true)
    .addField('Cycle Duration', cycleTime, true)
    .addField('Cycle Failures', cycleFails, true)
    .addField('Success Rate', successRate, true)
    .addField('\u200b', '\u200b', true)
    .setFooter(diff)

  await message.channel.send('', visual)
}
