import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json({ success: true, data: [], message: 'workspaces endpoint' })
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Get workspaces by id' })
})

app.post('/', async (c) => {
  return c.json({ success: true, message: 'Create workspaces' }, 201)
})

app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { id }, message: 'Update workspaces' })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, message: 'Delete workspaces' })
})

export { app as workspacesRoutes }
