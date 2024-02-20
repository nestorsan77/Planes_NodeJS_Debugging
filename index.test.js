const { describe, it, beforeEach } = require('node:test')
const supertest = require('supertest')
const assert = require('assert/strict')

let app = null
let agent = null

async function login () {
  await agent.post('/register').send('username=user').send('password=password').send('passwordRepeat=password')
  return agent.post('/login').send('username=user').send('password=password')
}

beforeEach(() => {
  app = require('./index')
  agent = supertest.agent(app)
})

describe('GET /', () => {
  it('should not allow anonymous users', async () => {
    return agent
      .get('/')
      .expect('Location', '/login')
      .expect(302)
  })
  it('should not allow logged users', async () => {
    await login()
    return agent
      .get('/getPlan')
      .expect(200)
  })
})

describe('GET /login', () => {
  it('should not allow logged users', async () => {
    await login()
    return agent
      .get('/login')
      .expect('Location', '/')
      .expect(302)
  })
  it('should allow anonymous users', async () => {
    return agent
      .get('/login')
      .expect(200)
  })
})
describe('GET /getPlan', () => {
    it('should not allow logged users', async () => {
      return agent
        .get('/getPlan')
        .expect('Location', '/login')
        .expect(302)
    })
    it('should allow anonymous users', async () => {
      return agent
        .get('/login')
        .expect(200)
    })
  })

