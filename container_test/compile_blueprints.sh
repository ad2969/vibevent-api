# If file already exists, delete it
rm -rf ./dredd/compile.apib || true

# Get a list of the files in 'blueprints'
blueprintfile=`ls ../api-blueprints`
for file in $blueprintfile
do
   # Compile all the files into a single file for dredd to use
   cat ../api-blueprints/$file >> ./dredd/compile.apib
done