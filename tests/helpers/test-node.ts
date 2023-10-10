import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { rimrafSync } from 'rimraf'

const TemplatesAbsolutePath = path.resolve(__dirname, '../environments/templates')

/**
 * Generate a test environment based on the node version supplied.
 * Outputs formatted versions of all template files into testFolder.
 */
export function generateTestEnvironment(nodeVersion: string, testFolder: string) {
  fs.mkdirSync(testFolder, { recursive: true })
  // for each file in tests/environments/templates
  fs.readdirSync(TemplatesAbsolutePath)
    .filter(_ => _.endsWith('.template'))
    .map(_ => `${TemplatesAbsolutePath}/${_}`)
    .forEach(templateFile => {
      const templateVars = getTemplateFileFormatObject(templateFile, { nodeVersion })
      const formattedTemplate = formatFileWithNamedVariables(templateFile, templateVars)
      const formattedFileName = templateFileRealName(templateFile)
      const formattedPath = path.resolve(testFolder, formattedFileName)
      fs.writeFileSync(formattedPath, formattedTemplate, 'utf8')
    })
}

// Run the package.json script in and report results
export function runScript(testFolder: string, scriptName: string) {
  try {
    const result = execSync(`cd ${testFolder} && yarn -s ${scriptName}`, {
      encoding: 'utf-8',
      stdio: 'inherit',
      env: {
        PATH: `/home/node/.volta/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
        FORCE_COLOR: '1',
      },
    })
    return {
      result: (result ?? '').toString(),
      exitCode: 0,
    }
  } catch (error: any) {
    return {
      result: error.message,
      exitCode: 1,
    }
  }
}

// Remove the generated test artifacts
export function purgeTestEnvironment(testFolder: string) {
  rimrafSync(testFolder)
}

/**
 * Supply a dictionary for formatting based on the file name supplied.
 */
function getTemplateFileFormatObject(
  templateFile: string,
  opts: { nodeVersion: string },
) {
  switch (templateFileRealName(templateFile)) {
    case 'package.json':
      return {
        TEST_NODE_MAJOR_VERSION: opts.nodeVersion,
        TEST_NODE_VERSION: getNodeVersion(opts.nodeVersion),
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
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
    templateContent,
  )
}

// Drop the .template extension
const templateFileRealName = (templateFile: string) =>
  path.basename(templateFile, '.template')

const getNodeVersion = (majorNodeVersion: string) => {
  switch (majorNodeVersion) {
    case '20':
      return '20.8.0'
    case '19':
      return '19.9.0'
    case '18':
      return '18.18.0'
    case '17':
      return '17.9.1'
    case '16':
      return '16.20.2'
  }
}
