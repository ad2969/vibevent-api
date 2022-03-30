# If file already exists, delete it
rm -rf ./apiary.apib || true

# Get a list of the files in 'blueprints'
blueprintfile=`ls ./api-blueprints`
for file in $blueprintfile
do
    # Compile all the files into a single file for dredd to use
    cat ./api-blueprints/$file >> ./apiary.apib
done