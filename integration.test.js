const assert = require('assert/strict')
const { remote } = require('webdriverio')
const { exec } = require('child_process')

let server
let browser

async function main () {
  server = exec('node server.js')
  browser = await remote({
    capabilities: {
      browserName: 'edge',
      'goog:chromeOptions': {
        args: process.env.CI ? ['headless', 'disable-gpu'] : []
      }
    }
  })
  await browser.url('http://localhost:3000')
  await browser.$('a=Register').click()
  await browser.$('input[name=username]').setValue('user')
  await browser.$('input[name=password]').setValue('password')
  await browser.$('input[name=passwordRepeat]').setValue('password')
  await browser.$('input[type=submit]').click()
  await browser.$('a[href="/basic"]').click()
  await browser.$('a=Log Out').click()
  await browser.$('a=Register').click()
  await browser.$('input[name=username]').setValue('user2')
  await browser.$('input[name=password]').setValue('password2')
  await browser.$('input[name=passwordRepeat]').setValue('password2')
  await browser.$('input[type=submit]').click()
  await browser.$('a[href="/premium"]').click()
  await browser.$('a=Log Out').click()
  await browser.$('a=Register').click()
  await browser.$('input[name=username]').setValue('user3')
  await browser.$('input[name=password]').setValue('password3')
  await browser.$('input[name=passwordRepeat]').setValue('password3')
  await browser.$('input[type=submit]').click()
  await browser.$('a[href="/ultimate"]').click()
  await browser.$('a=Log Out').click()
}

main().catch(console.error).finally(async () => {
  await browser.deleteSession()
  server.kill()
})
