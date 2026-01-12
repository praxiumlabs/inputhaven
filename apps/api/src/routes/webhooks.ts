import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json({ success: true, data: [], message: 'webhooks endpoint' })
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Get webhooks by id' })
})

app.post('/', async (c) => {
  return c.json({ success: true, message: 'Create webhooks' }, 201)
})

app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Update webhooks' })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, message: 'Delete webhooks' })
})

export { app as webhooksRoutes }
