# Run blueprint tests and send logs to Apiary (to check return syntax and structure)
dredd

# Run integration tests using mocha and chai
# mocha ./integration/${testfile}* --timeout 12000 --colors