const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = {
    writeFile(dirname, fileName, content) {
        function writeFiles() {
            fs.writeFile(path.resolve(dirname, fileName), content, function (err) {
                if (err) {
                    console.log(`  - writeFile: ${chalk.red(err)}`);
                } else {
                    //console.log('  Ifdef generate at:')
                    //console.log(`  - ${fileName}:`, ` ${chalk.cyan(path.join(dirname, fileName))}`)
                }
            })
        }
    
        fs.exists(path.resolve(dirname), function (exists) {
            exists ? writeFiles() : fs.mkdir(path.resolve(dirname), writeFiles)
        })
    }
}