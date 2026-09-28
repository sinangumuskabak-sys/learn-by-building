// A stand-in for a subscription tool that is installed but not logged in: says so and fails without answering.
process.stdin.resume()
process.stdin.on('end', () => {
  process.stderr.write('Error: not logged in. Run the login command first.\n')
  process.exit(1)
})
