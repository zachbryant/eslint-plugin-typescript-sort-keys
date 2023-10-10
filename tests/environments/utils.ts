import chalk from 'chalk'
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const TemplatesAbsolutePath = path.resolve(__dirname, 'templates')

/**
 * Generate a test environment based on the node version supplied.
 * Outputs formatted versions of all template files into testFolder.
 */
export function generateTestEnvironment(nodeVersion: string, testFolder: string) {
  fs.mkdirSync(testFolder, { recursive: true })
  // for each file in tests/environments/templates
  fs.readdirSync(TemplatesAbsolutePath).map(_=>`${TemplatesAbsolutePath}/${_}`).forEach((templateFile)=>{
    const templateVars = getTemplateFileFormatObject(templateFile, { nodeVersion })
    const formattedTemplate = formatFileWithNamedVariables(templateFile, templateVars)
    const formattedFileName = templateFileRealName(templateFile)
    const formattedPath = path.resolve(testFolder, formattedFileName)
    fs.writeFileSync(formattedPath, formattedTemplate, 'utf8')
  })
}

export function runTest(testFolder: string) {
  const testName = path.basename(testFolder)
  console.log(`Running test ${chalk.yellowBright(testName)}`)
  const result = spawnSync(`cd ${testFolder} && yarn test`, {
    stdio: 'inherit',
    encoding: 'utf-8',
    shell: true,
  })

  if (result.status === 0) {
    console.log(`Test ${chalk.greenBright(testName)} executed successfully`);
  } else {
    console.error(`Test ${chalk.redBright(testName)} failed with code ${result.status}`);
  }
}

export function purgeTestEnvironment(testFolder: string) {
  fs.rmdirSync(testFolder, { recursive: true })
}

/**
 * Supply a dictionary for formatting based on the file name supplied.
 */
function getTemplateFileFormatObject(templateFile: string, opts: {nodeVersion: string}) {
  switch (templateFileRealName(templateFile)) {
    case 'package.json':
      return {
        'TEST_NODE_MAJOR_VERSION': opts.nodeVersion,
        'TEST_NODE_VERSION': getNodeVersion(opts.nodeVersion),
      }
    default:
      return {}
  }
}

/**
 * Format a file with the supplied variables. Expects variables to be wrapped with brackets like {{MYVAR}}.
 */
function formatFileWithNamedVariables(file: string, variables: Record<string, string>) {
  const templateContent = fs.readFileSync(file, 'utf8')
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value),
    templateContent,
  )
}

// Drop the .template extension
const templateFileRealName = (templateFile: string) => path.basename(templateFile, '.template')

const getNodeVersion = (majorNodeVersion: string) => {
  switch(majorNodeVersion) {
    case '20': return '20.8.0'
    case '19': return '19.9.0'
    case '18': return '18.18.0'
    case '17': return '17.9.1'
    case '16': return '16.20.2'
    case '15': return '15.14.0'
    case '14': return '14.21.3'
    case '13': return '13.14.0'
    case '12': return '12.22.12'
  }
}
