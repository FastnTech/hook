# HOOK

Mini webhook project for your all linux based projects. A predefined configuration has been added for your Gatsby projects [(Gatsby Configuration File)](https://github.com/FastnTech/hook/blob/master/hook_commands/gatsby.js). You can use Hook in all your projects that need to be compiled and create your own configurations.

# How It Works

Hook's working logic is simple and straightforward. It applies the configurations to be taken from a JSON object, respectively.

Example
```json
[
    {
        "command": "git pull",
        "option": {
            "cwd": "/home/public_html/"
        }
    },
    {
        "command": "npm install",
        "option": {
            "cwd": "/home/public_html/"
        }
    }
]
```

In the above example, we have two commands in the JSON array. Commands are written in the "command" field and the directory in which the command will be run is written in the "cwd" field under "options". 

In the example here, we pull our current project files from git. Then we run the "npm install" command to install new dependencies, if any.

"Callback" fields were created in order to make different operations according to the completion status of the commands. The functions to be given to these fields will be executed after the relevant command is successfully completed.

```js
module.exports = [
    {
        command: "sudo ls *.map *.js",
        option: projectOptions.public,
        callback: function (stdout, index) {
            const a = stdout.split('\n')

            for (let i = 0; i < a.length; i++) {
                if (a[i] && a[i].length > 15) {
                    processes.push({
                        command: "rm " + a[i],
                        option: {
                            cwd: "/home/public_html/"
                        }
                        type: "remove"
                    })
                }
            }

            processes.push(copyProcess)

            ejectRecursive(index + 1)
        }
    }
]
```

In the example here, the function given to the "callback" field adds new commands to the JSON array that contains the commands. These commands are the deletion of the files in the response from the previous command.

2 parameters are sent to the defined "callback" function. The first is the output after the relevant command is completed. The second is the index in which the executed command is in the JSON array.

*Defining a "callback" field for a command means that other commands in the JSON array will not be executed. For this reason, you must continue the repetitive cycle yourself.* `ejectRecursive(index + 1)`

The "type" field has been added to prevent the loop from breaking when errors are received for non-critical commands. "type" field only works with "remove" value for now. *Add this field only to commands where errors are not a problem.*

# How Do I Start the System

In order to start the system, you need to send a POST request to "0.0.0.0:5466/build/:hash" with the text you specified in the "env" file. You will receive an answer that the system has started as follows.

```json
{
    "status": true,
    "message": "build process is already started"
}
```

If you send the wrong text, you will receive a response from the server as follows.

```json
{
    "status": false,
    "message": "invalid hash"
}
```

# How Do I View the Results

If you haven't made any changes in the settings, you can get a live view of the results by sending GET to "0.0.0.0:5466/build_result".

# How Can I Configure a Hook

Hook gets configurations such as "BUILD_HASH", "SERVER_IP", "SERVER_PORT" from ".env.dev" file. Before running the project, you had to organize these areas according to you. In order for the "env" file to be detected, you must change the name ".env.dev" to ".env". Since these settings are private, it is ensured that ".env" files are not transferred to git in gitignore.

# Dependencies

- [child_process](https://www.npmjs.com/package/child_process)
This module is used to run the commands entered in the system.
- [Fastify](https://www.npmjs.com/package/fastify)
This module is used to satisfy future requests to Hook and return results.
- [dotenv](https://www.npmjs.com/package/dotenv)
This module is used to get the required configurations from the ".env" file.

# License

Distributed under the MIT License. See `LICENSE` for more information.
