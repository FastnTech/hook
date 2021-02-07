const projectOptions = {
    main: {
        cwd: '/root/gatsby/'
    }
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
        command: "npm run build",
        option: projectOptions.main
    },
    {
        command: "FTP Upload", // optional
        ftp: true // required
    }
]