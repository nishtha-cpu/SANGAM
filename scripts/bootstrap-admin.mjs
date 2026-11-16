#!/usr/bin/env node

/**
 * SANGAM — One-Time Administrator Account Bootstrap Script
 *
 * Security Requirements:
 * 1. Never hardcodes credentials or creates default passwords.
 * 2. Does NOT expose public admin registration endpoints.
 * 3. Enforces one-time first administrator provisioning.
 * 4. Accepts credentials via environment variables (ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD)
 *    or secure interactive masked CLI prompts.
 * 5. Validates email format and strict password complexity.
 * 6. Never echoes or prints plaintext passwords to logs or stdout.
 */

import readline from 'readline'
import { provisionFirstAdmin, isFirstAdminProvisioned } from '../src/admin-panel/auth/admin-dev-auth.ts'

function prompt(question, isPassword = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    if (!isPassword) {
      rl.question(question, (answer) => {
        rl.close()
        resolve(answer.trim())
      })
      return
    }

    // Masked password input
    process.stdout.write(question)
    let password = ''
    process.stdin.setRawMode(true)
    process.stdin.resume()

    const onData = (char) => {
      char = char.toString('utf8')
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false)
          process.stdin.removeListener('data', onData)
          rl.close()
          process.stdout.write('\n')
          resolve(password.trim())
          break
        case '\u0003': // Ctrl+C
          process.stdin.setRawMode(false)
          process.stdout.write('\nOperation cancelled by user.\n')
          process.exit(1)
          break
        case '\u007f': // Backspace
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1)
            process.stdout.write('\b \b')
          }
          break
        default:
          password += char
          process.stdout.write('*')
          break
      }
    }

    process.stdin.on('data', onData)
  })
}

async function main() {
  console.log('\n======================================================')
  console.log(' SANGAM — Administrator Account Provisioning CLI')
  console.log('======================================================\n')

  // Check if first admin is already provisioned
  if (isFirstAdminProvisioned()) {
    console.error('[-] Security Notice: An administrator account is already provisioned.')
    console.error('    To maintain platform security, re-provisioning is blocked.')
    console.error('    Please log in directly at http://localhost:3000/admin-login\n')
    process.exit(1)
  }

  // Obtain Email
  let email = process.env.ADMIN_BOOTSTRAP_EMAIL
  if (!email) {
    email = await prompt('[?] Enter Administrator Email: ')
  } else {
    console.log('[+] Using email from ADMIN_BOOTSTRAP_EMAIL environment variable.')
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    console.error('\n[-] Error: A valid email address is required.\n')
    process.exit(1)
  }

  // Obtain Password
  let password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!password) {
    password = await prompt('[?] Enter Administrator Password (min 10 chars, upper, lower, digit, symbol): ', true)
    const confirm = await prompt('[?] Confirm Administrator Password: ', true)

    if (password !== confirm) {
      console.error('\n[-] Error: Passwords do not match.\n')
      process.exit(1)
    }
  } else {
    console.log('[+] Using password from ADMIN_BOOTSTRAP_PASSWORD environment variable.')
  }

  // Password Complexity Validation
  if (password.length < 10) {
    console.error('\n[-] Error: Password must be at least 10 characters long.\n')
    process.exit(1)
  }
  if (!/[A-Z]/.test(password)) {
    console.error('\n[-] Error: Password must contain at least one uppercase letter.\n')
    process.exit(1)
  }
  if (!/[a-z]/.test(password)) {
    console.error('\n[-] Error: Password must contain at least one lowercase letter.\n')
    process.exit(1)
  }
  if (!/[0-9]/.test(password)) {
    console.error('\n[-] Error: Password must contain at least one digit.\n')
    process.exit(1)
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    console.error('\n[-] Error: Password must contain at least one special character.\n')
    process.exit(1)
  }

  // Provision Admin
  const result = provisionFirstAdmin({ email, password })

  if (!result.ok) {
    console.error(`\n[-] Provisioning Failed: ${result.message}\n`)
    process.exit(1)
  }

  console.log('\n[+] Administrator Provisioned Successfully!')
  console.log('------------------------------------------------------')
  console.log(` Admin ID:    ${result.admin?.id}`)
  console.log(` Email:       ${result.admin?.email}`)
  console.log(` Collection:  ${result.admin?.collection}`)
  console.log(` Role:        ${result.admin?.role}`)
  console.log(' Status:      ACTIVE')
  console.log('------------------------------------------------------')
  console.log('\n[*] Next Steps:')
  console.log(' 1. Open http://localhost:3000/admin-login in your browser.')
  console.log(' 2. Sign in with the administrator email and password you just set.')
  console.log(' 3. Access the SANGAM Command Center at http://localhost:3000/admin-dashboard\n')
}

main().catch((err) => {
  console.error('\n[-] Unexpected fatal error during admin provisioning:', err.message)
  process.exit(1)
})
