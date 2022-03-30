 # Compile apiary.apib only if any of the files in apiary-blueprints are staged
stagedchanges=`git diff --name-only --cached`

if [[ "$stagedchanges" == *"api-blueprints/"* ]]; then

   # Do the compile
   ./scripts/apiary_compile.sh

   ## Add the compiled file to staging for commit
   git add apiary.apib

fi
