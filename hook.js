const dotenv = require('dotenv')
dotenv.config()
const fastify = require('fastify')({ logger: true })
const { exec } = require("child_process")
const gatsbyProcesses = require("./hook_commands/gatsby")

let isPublishing = false
let results = ''
let processes = []

const writeResult = (value) => {
  results += value + '\n'
}

const response = (status, message) => {
  return { status, message }
}

function ejectRecursive(index) {
  if (typeof processes[index] === "undefined") {
    writeResult(`Completed : ${new Date()} :`)
    isPublishing = false
    return
  }

  writeResult(`=====> command is started [ ${processes[index].command} ] : ${new Date()} : <=====`)

  exec(processes[index].command, processes[index].option, (error, stdout, stderr) => {
    if (error) {
      writeResult(`=====> error command: [ ${processes[index].command} ] : ${new Date()} : <=====`)
      writeResult(error.toString())

      if (!processes[index].callback && processes[index].type !== "remove") {
        writeResult(`=====> break <=====`)
        writeResult(`=====> break <=====`)
        writeResult(`=====> break <===== : ${new Date()} :`)
        isPublishing = false
        return;
      }
    }
    
    if (stderr) {
      writeResult(`=====> std error command: [ ${processes[index].command} ] : ${new Date()} : <=====`)
      writeResult(stderr.toString())
    }

    writeResult((stdout || '').toString())
    writeResult(`=====> command completed: [ ${processes[index].command} ] : ${new Date()} : <=====`)

    if (processes[index].callback) {
      processes[index].callback((error || stderr) ? "" : stdout, index)
      return;
    }

    ejectRecursive(index + 1)
  })
}

fastify.post('/build/:hash', async (request, reply) => {
  const receivedHash = request.params.hash

  if (isPublishing)
    return response(false, "build process is already started")

  if (receivedHash !== process.env.BUILD_HASH) {
    return response(false, "invalid hash")
  }

  results = ''
  processes = gatsbyProcesses;
  writeResult(`Process is starting... : ${new Date()} :`)
  ejectRecursive(0)
  isPublishing = true

  return response(true, "build is started")
})

fastify.get('/build_result', async () => {
  return results
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