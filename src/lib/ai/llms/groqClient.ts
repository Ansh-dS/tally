import { Groq, type Groq as groq } from 'groq-sdk/client.js'

function createGroqClient() {
  const client = new Groq({
    apiKey:
      process.env.GROQ_API_KEY ||
      (process.env.STAGE === 'local' ? 'mock_groq_api_key' : undefined),
  })
  return client
}

const globalGroqClient = global as unknown as { groqClient: groq }

function generateGroqClient() {
  const groqClient = globalGroqClient.groqClient || createGroqClient()
  return groqClient
}

const groqClient = generateGroqClient()
export default groqClient
