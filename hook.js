
const { exec } = require("child_process")
const gatsbyProcesses = require("./hook_commands/gatsby")
const gatsbyFtpProcesses = require("./hook_commands/gatsby_ftp")
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const dotenv = require('dotenv')
dotenv.config()

let isPublishing = false
let results = ''

const ftpConfig = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT),
  include: ['*', '**/*'],
  localRoot: __dirname + "/hook_commands",
  remoteRoot: "/backup/",
  deleteRemote: false,
  forcePasv: true,
  sftp: false
}

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

  //ftp commond check
  if (processes[index].ftp) {
    ftpDeploy
      .deploy(ftpConfig)
      .then(res => {
        writeResult(`=====> FTP Upload Finished <=====`)
        ejectRecursive(index + 1)
      })
    return
  }

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

module.exports.startBuild = (request, reply) => {
  const receivedHash = request.params.hash

  if (isPublishing)
    return response(false, "build process is already started")

  if (receivedHash !== process.env.BUILD_HASH) {
    return response(false, "invalid hash")
  }

  results = ''
  processes = gatsbyFtpProcesses;
  writeResult(`Process is starting... : ${new Date()} :`)
  ejectRecursive(0)
  isPublishing = true

  return response(true, "build is started")
}

module.exports.results = () => results