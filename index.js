const hook = require('./hook.js');
const fastify = require('fastify')({ logger: true })
const dotenv = require('dotenv')
dotenv.config()

fastify.post('/build/:hash', async (request, reply) => {
    return hook.startBuild(request, reply)
})

fastify.get('/build_result', async () => {
    return hook.results()
})

const start = async () => {
    try {
        await fastify.listen(process.env.SERVER_PORT, process.env.SERVER_IP)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()