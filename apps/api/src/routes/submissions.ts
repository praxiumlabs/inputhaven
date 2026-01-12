import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json({ success: true, data: [], message: 'submissions endpoint' })
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Get submissions by id' })
})

app.post('/', async (c) => {
  return c.json({ success: true, message: 'Create submissions' }, 201)
})

app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Update submissions' })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, message: 'Delete submissions' })
})

export { app as submissionsRoutes }
