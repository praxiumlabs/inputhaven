import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json({ success: true, data: [], message: 'users endpoint' })
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Get users by id' })
})

app.post('/', async (c) => {
  return c.json({ success: true, message: 'Create users' }, 201)
})

app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Update users' })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, message: 'Delete users' })
})

export { app as usersRoutes }
