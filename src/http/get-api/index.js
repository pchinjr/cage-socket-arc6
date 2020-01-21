const url = require('@architect/shared/utils/url');

exports.handler = async function http (req) {
  console.log('Begin API called')
  console.log(url('paul'))
  return {
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    },
    body: JSON.stringify({
      msg: 'Praise Cage from Svelte + your Begin API!'
    })
  }
}