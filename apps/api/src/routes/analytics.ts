import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json({ success: true, data: [], message: 'analytics endpoint' })
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Get analytics by id' })
})

app.post('/', async (c) => {
  return c.json({ success: true, message: 'Create analytics' }, 201)
})

app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Update analytics' })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, message: 'Delete analytics' })
})

export { app as analyticsRoutes }
