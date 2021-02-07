const projectOptions = {
    main: {
        cwd: '/root/gatsby/'
    },
    public: {
        cwd: '/root/gatsby/public/'
    },
    publish: {
        cwd: '/home/public_html/'
    }
}

const copyProcess = {
    command: "cp -a ./. /home/public_html/",
    option: projectOptions.public
}

module.exports = [
    {
        command: "git reset --hard",
        option: projectOptions.main
    },
    {
        command: "git clean -df",
        option: projectOptions.main
    },
    {
        command: "git pull",
        option: projectOptions.main
    },
    {
        command: "npm install",
        option: projectOptions.main
    },
    {
        command: "sudo ls *.map *.js",
        option: projectOptions.public,
        callback: function (stdout, index) {
            const a = stdout.split('\n')

            for (let i = 0; i < a.length; i++) {
                if (a[i] && a[i].length > 15) {
                    processes.push({
                        command: "rm " + a[i],
                        option: projectOptions.publish,
                        type: "remove"
                    })
                }
            }

            processes.push(copyProcess)

            ejectRecursive(index + 1)
        }
    },
    {
        command: "npm run build",
        option: projectOptions.main
    }
]