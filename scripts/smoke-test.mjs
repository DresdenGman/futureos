#!/usr/bin/env node

/**
 * Smoke test script for FutureOS.
 *
 * Verifies basic availability of the application without calling AI/search services.
 * Run against a running dev server or production deployment.
 *
 * Usage:
 *   npm run smoke
 *   SMOKE_BASE_URL=https://futureos.example.com npm run smoke
 */

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000"

let failures = 0

async function check(name, url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`
  try {
    const res = await fetch(fullUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
      ...options,
    })
    const ok = options.status
      ? res.status === options.status
      : res.ok
    if (ok) {
      console.log(`  ✓ ${name} (${res.status})`)
    } else {
      console.error(`  ✗ ${name} — expected ${options.status || "2xx"}, got ${res.status}`)
      failures++
    }
    return res
  } catch (err) {
    console.error(`  ✗ ${name} — ${err.message}`)
    failures++
    return null
  }
}

async function smokeTest() {
  console.log(`\nSmoke testing ${BASE_URL}\n`)

  // Health check
  await check("Health check returns ok", "/api/health", {
    headers: { "Content-Type": "application/json" },
  })
  const healthRes = await fetch(`${BASE_URL}/api/health`)
  if (healthRes.ok) {
    const health = await healthRes.json()
    if (health.ok && health.service === "futureos") {
      console.log("  ✓ Health response structure is correct")
    } else {
      console.error("  ✗ Health response structure is incorrect")
      failures++
    }
  }

  // Home page
  const homeRes = await check("Home page loads", "/")
  if (homeRes && homeRes.ok) {
    const html = await homeRes.text()
    if (html.includes("FutureOS")) {
      console.log("  ✓ Home page contains 'FutureOS'")
    } else {
      console.error("  ✗ Home page missing 'FutureOS'")
      failures++
    }
  }

  // Not found page
  await check("404 page for nonexistent route", "/not-a-real-route", {
    status: 404,
  })

  // Forecast not found
  await check("Forecast not found page", "/forecast/nonexistent-id", {
    status: 200, // Next.js renders not-found page but returns 200
  })

  // Login page
  await check("Login page loads", "/login")

  // Create page
  await check("Create page loads", "/create")

  // API error handling — invalid structure request
  await check(
    "Structure API rejects empty input",
    "/api/ai/structure",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalQuestion: "", domain: "" }),
      status: 400,
    }
  )

  console.log(`\n${failures === 0 ? "✓ All smoke tests passed" : `✗ ${failures} smoke test(s) failed`}\n`)
  process.exit(failures > 0 ? 1 : 0)
}

smokeTest()
