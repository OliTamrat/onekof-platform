import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Onekof Platform API',
    description: 'REST API for the Onekof Ethiopian Project Management Platform',
    version: '1.0.0',
    contact: {
      name: 'Onekof Team',
      url: 'https://onekof.com',
    },
  },
  servers: [
    {
      url: '{baseUrl}/api',
      description: 'API Server',
      variables: {
        baseUrl: {
          default: 'https://onekof.com',
          description: 'Base URL',
        },
      },
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Issues', description: 'Issue tracking' },
    { name: 'Budgets', description: 'Budget management' },
    { name: 'Teams', description: 'Team management' },
    { name: 'Documents', description: 'Document management and AI processing' },
    { name: 'Goals', description: 'Goal tracking' },
    { name: 'Automations', description: 'Workflow automation' },
    { name: 'User', description: 'User profile and settings' },
    { name: 'Organizations', description: 'Organization management' },
    { name: 'Activities', description: 'Activity tracking' },
    { name: 'Realtime', description: 'Real-time events via SSE' },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 12 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Account created' }, '400': { description: 'Validation error' } },
      },
    },
    '/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in with credentials',
        description: 'Authenticate with email and password. Supports 2FA via TOTP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  twoFactorCode: { type: 'string', description: '6-digit TOTP code or backup code' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Authenticated' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } } },
        },
        responses: { '200': { description: 'Reset email sent if account exists' } },
      },
    },
    '/auth/two-factor/setup': {
      post: { tags: ['Auth'], summary: 'Set up 2FA (TOTP)', security: [{ session: [] }], responses: { '200': { description: 'QR code and secret returned' } } },
    },
    '/auth/two-factor/verify': {
      post: { tags: ['Auth'], summary: 'Verify 2FA code', security: [{ session: [] }], responses: { '200': { description: '2FA verified' } } },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ session: [] }],
        parameters: [
          { name: 'organizationId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] } },
        ],
        responses: { '200': { description: 'List of projects' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'organizationId'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  organizationId: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  budget: { type: 'number' },
                  currency: { type: 'string', default: 'ETB' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Project created' } },
      },
    },
    '/issues': {
      get: {
        tags: ['Issues'],
        summary: 'List issues',
        security: [{ session: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] } },
        ],
        responses: { '200': { description: 'List of issues' } },
      },
      post: {
        tags: ['Issues'],
        summary: 'Create issue',
        security: [{ session: [] }],
        responses: { '201': { description: 'Issue created' } },
      },
    },
    '/budgets': {
      get: { tags: ['Budgets'], summary: 'List budgets', security: [{ session: [] }], responses: { '200': { description: 'List of budgets' } } },
      post: { tags: ['Budgets'], summary: 'Create budget', security: [{ session: [] }], responses: { '201': { description: 'Budget created' } } },
    },
    '/expenses': {
      get: { tags: ['Budgets'], summary: 'List expenses', security: [{ session: [] }], responses: { '200': { description: 'List of expenses' } } },
      post: { tags: ['Budgets'], summary: 'Submit expense', security: [{ session: [] }], responses: { '201': { description: 'Expense submitted' } } },
    },
    '/teams': {
      get: { tags: ['Teams'], summary: 'List teams', security: [{ session: [] }], responses: { '200': { description: 'List of teams' } } },
      post: { tags: ['Teams'], summary: 'Create team', security: [{ session: [] }], responses: { '201': { description: 'Team created' } } },
    },
    '/documents': {
      get: { tags: ['Documents'], summary: 'List documents', security: [{ session: [] }], responses: { '200': { description: 'List of documents' } } },
      post: { tags: ['Documents'], summary: 'Upload and process document with AI', security: [{ session: [] }], responses: { '201': { description: 'Document uploaded' } } },
    },
    '/goals': {
      get: { tags: ['Goals'], summary: 'List goals', security: [{ session: [] }], responses: { '200': { description: 'List of goals' } } },
      post: { tags: ['Goals'], summary: 'Create goal', security: [{ session: [] }], responses: { '201': { description: 'Goal created' } } },
    },
    '/automations': {
      get: { tags: ['Automations'], summary: 'List automation rules', security: [{ session: [] }], responses: { '200': { description: 'List of rules' } } },
      post: { tags: ['Automations'], summary: 'Create automation rule', security: [{ session: [] }], responses: { '201': { description: 'Rule created' } } },
    },
    '/organizations': {
      get: { tags: ['Organizations'], summary: 'List user organizations', security: [{ session: [] }], responses: { '200': { description: 'List of organizations' } } },
      post: { tags: ['Organizations'], summary: 'Create organization', security: [{ session: [] }], responses: { '201': { description: 'Organization created' } } },
    },
    '/user/sessions': {
      get: { tags: ['User'], summary: 'List active sessions', security: [{ session: [] }], responses: { '200': { description: 'Active sessions' } } },
      delete: { tags: ['User'], summary: 'Terminate all other sessions', security: [{ session: [] }], responses: { '200': { description: 'Sessions terminated' } } },
    },
    '/activities': {
      get: { tags: ['Activities'], summary: 'List activities', security: [{ session: [] }], responses: { '200': { description: 'Activity log' } } },
    },
    '/realtime': {
      get: {
        tags: ['Realtime'],
        summary: 'SSE connection for real-time events',
        description: 'Server-Sent Events stream for live updates (presence, notifications, data changes)',
        security: [{ session: [] }],
        responses: { '200': { description: 'SSE stream', content: { 'text/event-stream': {} } } },
      },
    },
    '/health': {
      get: { summary: 'Health check', responses: { '200': { description: 'Service healthy' } } },
    },
  },
  components: {
    securitySchemes: {
      session: { type: 'apiKey', in: 'cookie', name: 'next-auth.session-token', description: 'NextAuth.js session cookie' },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
